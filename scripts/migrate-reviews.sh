#!/usr/bin/env bash
# Migrate per-site WordPress reviews into a site's Astro build:
#   1. extract real reviews from live WP HTML -> home-overrides.json
#   2. rebuild + normalize
#   3. sync to deploy repo
#   4. verify all 9 hard checks still pass
#
# Usage:
#   ./scripts/migrate-reviews.sh <domain>
#   ./scripts/migrate-reviews.sh <domain> --no-verify   # skip verify
#   ./scripts/migrate-reviews.sh --all                  # loop all eligible sites
set -uo pipefail   # NOTE: no -e; we want to continue the --all loop on per-site failure

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Ensure Node 22
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 22 >/dev/null
fi

run_one() {
  local DOMAIN="$1"
  local NO_VERIFY="$2"

  echo "=== [$DOMAIN] Step 1/4: extract WP reviews ==="
  if ! python3 scripts/extract-wp-reviews.py "$DOMAIN"; then
    echo "=== [$DOMAIN] FAILED at extract — skipping ===" >&2
    return 1
  fi

  echo "=== [$DOMAIN] Step 2/4: build + normalize ==="
  if ! HVAC_SITE="$DOMAIN" npm run build > /dev/null 2>&1; then
    echo "=== [$DOMAIN] FAILED at build ===" >&2
    return 1
  fi
  HVAC_SITE="$DOMAIN" python3 scripts/normalize.py 2>&1 | tail -1

  echo "=== [$DOMAIN] Step 3/4: sync to deploy repo ==="
  if ! ./scripts/sync-deploy-repo.sh "$DOMAIN" > /dev/null 2>&1; then
    echo "=== [$DOMAIN] FAILED at sync ===" >&2
    return 1
  fi

  if [ "$NO_VERIFY" = "1" ]; then
    echo "=== [$DOMAIN] --no-verify: skipping verify ==="
    return 0
  fi

  echo "=== [$DOMAIN] Step 4/4: verify ==="
  if python3 scripts/verify-site.py "$DOMAIN" > /tmp/verify-$DOMAIN.log 2>&1; then
    local fails=$(grep -c "FAIL" /tmp/verify-$DOMAIN.log || echo 0)
    if [ "$fails" = "0" ]; then
      echo "=== [$DOMAIN] DONE (all checks pass) ==="
      return 0
    fi
  fi
  echo "=== [$DOMAIN] DONE WITH VERIFY FAILURES (see /tmp/verify-$DOMAIN.log) ===" >&2
  return 1
}

if [ "${1:-}" = "--all" ]; then
  # Discover eligible sites: every src/sites/<domain>/home-overrides.json,
  # minus the skip list baked into extract-wp-reviews.py.
  DOMAINS=$(python3 scripts/extract-wp-reviews.py --all 2>&1 | grep "^OK" | awk '{print $2}' | sed 's/://')
  # NOTE: the --all mode of extract-wp-reviews.py already does the extract
  # for every eligible site in one pass. Then we just build+sync+verify each.
  if [ -z "$DOMAINS" ]; then
    echo "No sites extracted successfully." >&2
    exit 1
  fi
  echo "=== Extract pass complete. Now building/syncing/verifying each site. ==="
  echo ""
  ok=0; fail=0; failed_list=""
  for DOMAIN in $DOMAINS; do
    if run_one "$DOMAIN" "0"; then
      ok=$((ok+1))
    else
      fail=$((fail+1))
      failed_list="$failed_list $DOMAIN"
    fi
  done
  echo ""
  echo "=== Summary: $ok OK, $fail FAIL ==="
  if [ -n "$failed_list" ]; then
    echo "Failed: $failed_list"
  fi
  exit $fail

elif [ $# -ge 1 ]; then
  DOMAIN="$1"
  NO_VERIFY=0
  [ "${2:-}" = "--no-verify" ] && NO_VERIFY=1
  run_one "$DOMAIN" "$NO_VERIFY"
  exit $?

else
  echo "Usage: $0 <domain> [--no-verify]"
  echo "       $0 --all"
  exit 1
fi
