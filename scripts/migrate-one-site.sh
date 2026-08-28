#!/usr/bin/env bash
# Migrate ONE site end-to-end: extract config + content + overrides,
# build, normalize, sync to deploy repo, fix em-dash in deploy's main.js,
# remove /services/index.html from deploy, verify.
#
# Usage:
#   ./scripts/migrate-one-site.sh <domain>
#   ./scripts/migrate-one-site.sh <domain> --no-verify  # skip verify step
set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain>}"
shift || true
NO_VERIFY=0
for arg in "$@"; do [ "$arg" = "--no-verify" ] && NO_VERIFY=1; done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HVAC_WORKSPACE="${HVAC_WORKSPACE:-$HOME/Projects/hvac}"
DEPLOY="${HVAC_SITES_DIR:-$HVAC_WORKSPACE/scratch/sites}/$DOMAIN"

if [ ! -d "$DEPLOY" ]; then
  echo "FAIL: $DEPLOY not found" >&2
  exit 1
fi

# Ensure Node 22 + Python deps
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 22 >/dev/null
fi

echo "=== [$DOMAIN] Step 1/6: extract config + content + overrides ==="
python3 scripts/extract-config.py "$DOMAIN"
python3 scripts/extract-content.py "$DOMAIN"
python3 scripts/extract-home-overrides.py "$DOMAIN"
python3 scripts/extract-about-overrides.py "$DOMAIN"
python3 scripts/extract-contact-overrides.py "$DOMAIN"
python3 scripts/extract-service-overrides.py "$DOMAIN"

echo "=== [$DOMAIN] Step 2/6: astro build ==="
HVAC_SITE="$DOMAIN" npm run build 2>&1 | tail -3

echo "=== [$DOMAIN] Step 3/6: normalize HTML ==="
HVAC_SITE="$DOMAIN" python3 scripts/normalize.py

echo "=== [$DOMAIN] Step 4/6: sync to deploy repo ==="
./scripts/sync-deploy-repo.sh "$DOMAIN"

# Remove /services/index.html from deploy repo (sync doesn't delete).
if [ -f "$DEPLOY/services/index.html" ]; then
  rm "$DEPLOY/services/index.html"
  echo "  removed stale $DEPLOY/services/index.html"
fi

# Fix em-dash in deploy's main.js success message (per-site email is preserved).
if grep -q "received — a local" "$DEPLOY/assets/js/main.js" 2>/dev/null; then
  sed -i.bak 's/received — a local/received. A local/' "$DEPLOY/assets/js/main.js"
  rm "$DEPLOY/assets/js/main.js.bak"
  echo "  fixed em-dash in $DEPLOY/assets/js/main.js"
fi

if [ $NO_VERIFY -eq 1 ]; then
  echo "=== [$DOMAIN] --no-verify: skipping verification ==="
  echo "=== [$DOMAIN] DONE ==="
  exit 0
fi

echo "=== [$DOMAIN] Step 5/6: verify ==="
if python3 scripts/verify-site.py "$DOMAIN"; then
  echo "=== [$DOMAIN] Step 6/6: DONE (all checks pass) ==="
  exit 0
else
  echo "=== [$DOMAIN] DONE WITH FAILURES (see above) ===" >&2
  exit 1
fi
