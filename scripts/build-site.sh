#!/usr/bin/env bash
# Build one site end-to-end: astro build + normalize + sync into deploy repo.
#
# Usage:
#   HVAC_SITE=londonheatingcooling.ca ./scripts/build-site.sh
#   HVAC_SITE=londonheatingcooling.ca ./scripts/build-site.sh --dry-run
#   HVAC_SITE=londonheatingcooling.ca ./scripts/build-site.sh --no-sync   # build+normalize only
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SITE="${HVAC_SITE:-}"
if [ -z "$SITE" ]; then
  echo "ERROR: HVAC_SITE env var required." >&2
  echo "Usage: HVAC_SITE=londonheatingcooling.ca $0 [--dry-run] [--no-sync]" >&2
  exit 1
fi

NO_SYNC=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --no-sync) NO_SYNC=1 ;;
    --dry-run) DRY_RUN=1 ;;
  esac
done

# Ensure Node 22 (Astro 7 requires >=22.12).
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  unset npm_config_prefix  # nvm refuses to load under npm_config_prefix (set by `npm run`)
  source "$HOME/.nvm/nvm.sh"
  nvm use 22 >/dev/null
fi

echo "[build-site] === $SITE ==="

# 1. astro build
echo "[build-site] astro build..."
HVAC_SITE="$SITE" npm run build

# 2. normalize HTML (BS4 post-process to match deployed format)
echo "[build-site] normalize..."
HVAC_SITE="$SITE" python3 scripts/normalize.py

# 3. generate redirect pages for old WP service slugs -> Astro slugs
echo "[build-site] redirects..."
HVAC_SITE="$SITE" python3 scripts/gen-service-redirects.py

# 4. sync into deploy repo
if [ $NO_SYNC -eq 1 ]; then
  echo "[build-site] --no-sync: skipping deploy sync"
  echo "[build-site] Done. Output at dist/$SITE/"
else
  echo "[build-site] sync..."
  if [ $DRY_RUN -eq 1 ]; then
    ./scripts/sync-deploy-repo.sh "$SITE" --dry-run
  else
    ./scripts/sync-deploy-repo.sh "$SITE"
  fi
fi

echo "[build-site] OK"
