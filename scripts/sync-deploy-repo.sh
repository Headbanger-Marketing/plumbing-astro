#!/usr/bin/env bash
# Sync built HTML from hvac-astro/dist/<domain>/ into the deploy repo at
# hvac-network/sites/<domain>/, with explicit include rules.
#
# This sync is intentionally NOT using rsync --delete because the deploy repo
# carries Python-build artifacts (build.py, build_pages.py, CNAME, llms.txt,
# _wp_text.json, favicon.ico, robots.txt, sitemap.xml) that the Astro build
# doesn't produce. We list exactly what to overwrite instead.
#
#   KEEP (never touch):  .git/, assets/img/, assets/js/, build.py, build_pages.py,
#                        CNAME, .nojekyll, llms.txt, _wp_text.json,
#                        favicon.ico, robots.txt, sitemap.xml, .gitignore
#   OVERWRITE:          index.html, 404.html, about/, services/, blog/,
#                        contact/, privacy-policy/, locations/, thank-you/,
#                        sitemap-index.xml, sitemap-0.xml, assets/css/
#
# NOTE: assets/js/main.js is per-site (each site has its own contact email
# hardcoded in the failure fallback). Do NOT sync it from hvac-astro.
#
# Usage:
#   ./scripts/sync-deploy-repo.sh <domain>            # sync (default)
#   ./scripts/sync-deploy-repo.sh <domain> --dry-run  # preview only
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <domain> [--dry-run]"
  exit 1
fi

DOMAIN="$1"
DRY_RUN=0
[ "${2:-}" = "--dry-run" ] && DRY_RUN=1

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist/$DOMAIN"
DEPLOY="$ROOT/../hvac-network/sites/$DOMAIN"

if [ ! -d "$DIST" ]; then
  echo "ERROR: $DIST does not exist. Run 'HVAC_SITE=$DOMAIN npm run build' first." >&2
  exit 1
fi
if [ ! -d "$DEPLOY" ]; then
  echo "ERROR: $DEPLOY does not exist." >&2
  exit 1
fi

RSYNC_FLAGS="-a"
if [ $DRY_RUN -eq 1 ]; then
  RSYNC_FLAGS="$RSYNC_FLAGS -n -v --itemize-changes"
  echo "[dry-run] Preview of changes:"
fi

# Sync ONLY the files/dirs Astro produces. No --delete; deploy repo keeps its
# Python-build artifacts (build.py, CNAME, etc.) untouched.
# Explicit includes:
#   /index.html, /404.html           (root HTML)
#   /about/                          (directory)
#   /services/                       (directory)
#   /blog/                           (directory)
#   /contact/                        (directory)
#   /privacy-policy/                 (directory)
#   /locations/                      (directory — vertical-hub location sub-pages)
#   /sitemap-index.xml, /sitemap-0.xml  (Astro sitemap output)
#   /assets/css/, /assets/js/        (CSS + JS — same content as Python build)
echo "[sync] $DIST/ -> $DEPLOY/"
# Note: rsync's `/***` pattern works for top-level dirs but NOT for nested dirs
# (e.g. assets/css/). For nested paths, list each parent dir explicitly.
rsync $RSYNC_FLAGS \
  --include='/index.html' \
  --include='/404.html' \
  --include='/about/***' \
  --include='/services/***' \
  --include='/blog/***' \
  --include='/contact/***' \
  --include='/privacy-policy/***' \
  --include='/thank-you/***' \
  --include='/locations/***' \
  --include='/sitemap-index.xml' \
  --include='/sitemap-0.xml' \
  --include='/assets/' \
  --include='/assets/css/' \
  --include='/assets/css/**' \
  --exclude='*' \
  "$DIST/" "$DEPLOY/"

if [ $DRY_RUN -eq 1 ]; then
  echo "[dry-run] No changes made. Re-run without --dry-run to apply."
else
  echo "[sync] OK. Run 'cd $DEPLOY && git status' to review changes."
fi
