#!/usr/bin/env bash
# Build all sites with config files in src/sites/. Loops build-site.sh per site.
# Used during the pilot for the 3 London sites; will scale to the full fleet later.
#
# Usage:
#   ./scripts/build-all.sh                # build + sync all
#   ./scripts/build-all.sh --dry-run      # preview sync only
#   ./scripts/build-all.sh --no-sync      # build + normalize, no sync
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Discover all site configs (*.ts directly under src/sites/, not in subfolders).
SITES=$(ls src/sites/*.ts 2>/dev/null | sed 's|src/sites/||; s|\.ts$||' | sort)

if [ -z "$SITES" ]; then
  echo "No site configs found in src/sites/*.ts"
  exit 1
fi

echo "[build-all] Sites: $(echo "$SITES" | tr '\n' ' ')"
echo

FAILED=""
for SITE in $SITES; do
  if HVAC_SITE="$SITE" ./scripts/build-site.sh "$@"; then
    # Regenerate the per-site OG card right after the build: the astro build
    # wipes dist/, and without this every dist ships the shared public/
    # placeholder until a deploy wave happens to pass by (media-audit 2026-08-23).
    if [ -f scripts/gen-og-images.mjs ]; then
      node scripts/gen-og-images.mjs "$SITE" >/dev/null 2>&1 || echo "[build-all] OG GEN FAIL: $SITE" >&2
    fi
    echo
  else
    echo "[build-all] FAILED: $SITE" >&2
    FAILED="$FAILED $SITE"
  fi
done

if [ -n "$FAILED" ]; then
  echo "[build-all] Failures:$FAILED" >&2
  exit 1
fi

echo "[build-all] All sites built successfully."
