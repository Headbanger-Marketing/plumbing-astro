#!/usr/bin/env bash
# Finish a new HVAC site's deploy after NS propagation.
# Run this once the Cloudflare zone shows 'active' (NS has propagated).
#
# Usage: bash scripts/finish-new-site.sh <domain> <zone-id>
# Example: bash scripts/finish-new-site.sh exeterheatingcooling.ca 4305b48e0bf6a79bb8f918417640dcb5
#
# It will: enable email routing, wait for DNS→GH Pages, enforce HTTPS, verify.
set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> <zone-id>}"
ZONE="${2:?Usage: $0 <domain> <zone-id>}"

set -a; . ~/.cloudflare/headbanger-credentials; set +a

echo "=== Checking zone status ==="
zstatus=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE" \
  -H "Authorization: Bearer $CF_API_TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin)['result']['status'])" 2>/dev/null)

if [ "$zstatus" != "active" ]; then
  echo "Zone is '$zstatus', not 'active'. NS hasn't propagated yet."
  echo "Check with: dig +short NS $DOMAIN"
  echo "Re-run this script once the NS shows cloudflare nameservers."
  exit 1
fi
echo "Zone is ACTIVE. Proceeding."

echo ""
echo "=== 1/4 Enable email routing (contact@ -> hvac-email-router) ==="
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE/email/routing/enable" \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  --data '{"enabled":true}' >/dev/null 2>&1 && echo "  routing enabled" || echo "  (may already be enabled)"
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE/email/routing/rules" \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  --data "{\"name\":\"contact to hvac-email-router\",\"enabled\":true,\"matchers\":[{\"type\":\"literal\",\"field\":\"to\",\"value\":\"contact@$DOMAIN\"}],\"actions\":[{\"type\":\"worker\",\"value\":[\"hvac-email-router\"]}]}" >/dev/null 2>&1
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE/email/routing/rules" \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  --data '{"name":"catch-all drop","enabled":false,"matchers":[{"type":"all"}],"actions":[{"type":"drop"}]}' >/dev/null 2>&1
echo "  contact@$DOMAIN -> hvac-email-router Worker"

echo ""
echo "=== 2/4 Wait for A record to resolve to GH Pages ==="
for i in $(seq 1 30); do
  ip=$(dig +short A "$DOMAIN" @1.1.1.1 2>/dev/null | head -1)
  echo "  [$i/30] A=${ip:-none}"
  if echo "$ip" | grep -q '185.199'; then
    echo "  DNS resolving to GH Pages!"
    break
  fi
  sleep 20
done

echo ""
echo "=== 3/4 Enforce HTTPS (re-kick cname + enforce) ==="
sleep 30  # let cert provision
gh api -X PUT "repos/liamseopro/$DOMAIN/pages" -f 'cname=""' >/dev/null 2>&1 || true
sleep 5
gh api -X PUT "repos/liamseopro/$DOMAIN/pages" -f "cname=$DOMAIN" >/dev/null 2>&1 || true
sleep 10
gh api -X PUT "repos/liamseopro/$DOMAIN/pages" -F "https_enforced=true" >/dev/null 2>&1 || true
echo "  HTTPS enforcement requested"

echo ""
echo "=== 4/4 Verify ==="
sleep 10
ip=$(dig +short A "$DOMAIN" @1.1.1.1 2>/dev/null | head -1)
if echo "$ip" | grep -q '185.199'; then
  code=$(curl -s -o /dev/null -w '%{http_code}' --resolve "$DOMAIN:443:$ip" "https://$DOMAIN/" 2>/dev/null || echo "000")
  title=$(curl -sk --resolve "$DOMAIN:443:$ip" "https://$DOMAIN/" 2>/dev/null | grep -o '<title>[^<]*</title>' | head -1)
  echo "  HTTPS: $code"
  echo "  Title: $title"
else
  echo "  A record not yet at GH Pages — cert may still be provisioning."
  echo "  Check in 5-10 min: curl -sk https://$DOMAIN/ | grep '<title>'"
fi

echo ""
echo "=== Pages config ==="
gh api "repos/liamseopro/$DOMAIN/pages" --jq '{status, cname, https_enforced, cert: .https_certificate.state}' 2>/dev/null
