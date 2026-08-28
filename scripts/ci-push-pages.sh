#!/usr/bin/env bash
# Push an already-built dist/<domain>/ into Headbanger-Marketing/<domain>
# (GitHub Pages). Used by .github/workflows/deploy-site.yml.
#
# Requires: PAGES_DEPLOY_TOKEN (repo contents:write on the Pages repos)
# Usage:    ./scripts/ci-push-pages.sh <domain>
set -euo pipefail

SITE="${1:?Usage: $0 <domain>}"
TOKEN="${PAGES_DEPLOY_TOKEN:?PAGES_DEPLOY_TOKEN is not set}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST_ROOT="${DIST_ROOT:-dist}"
DIST="$ROOT/$DIST_ROOT/$SITE"
NAME="$(python3 -c "import json; print(json.load(open('$ROOT/package.json'))['name'])")"

if [ ! -d "$DIST" ]; then
  echo "ERROR: $DIST missing. Build first." >&2
  exit 1
fi

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

echo "[ci-push] clone Headbanger-Marketing/$SITE"
git clone --depth 1 --branch main \
  "https://x-access-token:${TOKEN}@github.com/Headbanger-Marketing/${SITE}.git" \
  "$TMP" >/dev/null

rsync -a \
  --include='/index.html' --include='/404.html' \
  --include='/about/***' --include='/services/***' --include='/blog/***' \
  --include='/contact/***' --include='/privacy-policy/***' --include='/thank-you/***' --include='/locations/***' \
  --include='/sitemap-index.xml' --include='/sitemap-0.xml' \
  --include='/robots.txt' --include='/llms.txt' --include='/favicon.ico' --include='/CNAME' \
  --include='/assets/' --include='/assets/css/' --include='/assets/css/**' \
  --include='/assets/js/' --include='/assets/js/**' \
  --exclude='*' "$DIST/" "$TMP/"

mkdir -p "$TMP/assets/img"
if [ -d "$DIST/assets/img" ]; then
  cp -R "$DIST/assets/img/." "$TMP/assets/img/"
fi

if [ "$NAME" = "hvac-astro" ] && [ "$SITE" != "londonheatingcooling.ca" ]; then
  site_logo="$(sed -n 's/.*logo: *"\([^"]*\)".*/\1/p' "$ROOT/src/sites/$SITE.ts" | head -1)"
  if [ -n "$site_logo" ]; then
    site_logo_png="$(printf '%s' "$site_logo" | sed 's/\.svg$/.png/')"
    find "$TMP/assets/img/logos" -type f ! -name "$site_logo" ! -name "$site_logo_png" -delete 2>/dev/null || true
  fi
  rm -f "$TMP/assets/img/logo.png"
fi

touch "$TMP/.nojekyll"

git -C "$TMP" config user.name "github-actions[bot]"
git -C "$TMP" config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git -C "$TMP" add -A
if git -C "$TMP" diff --cached --quiet; then
  echo "[ci-push] $SITE CLEAN (no HTML change)"
  exit 0
fi
git -C "$TMP" commit -qm "deploy: $SITE (github actions)"
git -C "$TMP" push origin main
echo "[ci-push] $SITE pushed"
