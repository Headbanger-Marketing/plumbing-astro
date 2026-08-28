#!/usr/bin/env bash
# Build one site, clone its GitHub Pages repo on demand, sync, commit, push,
# then drop the clone (and that site's dist/) so it doesn't sit on disk.
#
# Usage:
#   ./scripts/deploy-site.sh <domain>
#   ./scripts/deploy-site.sh londonplumbingpros.ca --keep
#   ./scripts/deploy-site.sh londonplumbingpros.ca --no-push
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <domain> [--keep] [--no-push]" >&2
  exit 1
fi

DOMAIN="$1"
shift
KEEP=0
NO_PUSH=0
for arg in "$@"; do
  case "$arg" in
    --keep) KEEP=1 ;;
    --no-push) NO_PUSH=1 ;;
    *) echo "Unknown flag: $arg" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HVAC_WORKSPACE="${HVAC_WORKSPACE:-$HOME/Projects/hvac}"
NETWORK="${HVAC_SITES_DIR:-$HVAC_WORKSPACE/scratch/sites}"
DEPLOY="$NETWORK/$DOMAIN"
cd "$ROOT"

if [ -f "$HOME/.nvm/nvm.sh" ]; then
  unset npm_config_prefix
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use 22 >/dev/null
fi

echo "[deploy-site] === $DOMAIN ==="
HVAC_SITE="$DOMAIN" ./scripts/build-site.sh

node scripts/gen-og-images.mjs "$DOMAIN" >/dev/null 2>&1 || echo "[deploy-site] OG GEN FAIL"

mkdir -p "$DEPLOY/assets/img"
if [ -d "$ROOT/dist/$DOMAIN/assets/img" ]; then
  cp -R "$ROOT/dist/$DOMAIN/assets/img/." "$DEPLOY/assets/img/" 2>/dev/null || true
fi
touch "$DEPLOY/.nojekyll"

if [ $NO_PUSH -eq 1 ]; then
  echo "[deploy-site] --no-push: clone left at $DEPLOY"
  exit 0
fi

pushout=$(cd "$DEPLOY" && git add -A && \
  if git diff --cached --quiet; then echo "CLEAN"; else \
    git commit -q -m "deploy: $DOMAIN" && \
    { git ls-remote --heads origin main 2>/dev/null | grep -q . && { git pull --rebase origin main 2>/dev/null || git rebase --abort; }; } && \
    git push origin main 2>&1 | tail -1; \
  fi)
echo "[deploy-site] $pushout"

rm -rf "$ROOT/dist/$DOMAIN"

if [ $KEEP -eq 0 ]; then
  echo "[deploy-site] removing clone $DEPLOY"
  rm -rf "$DEPLOY"
fi

echo "[deploy-site] OK"
