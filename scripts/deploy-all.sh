#!/usr/bin/env bash
# Deploy the full network (all sites with src/sites/<domain>.ts). Builds each,
# clones the Pages repo on demand, syncs HTML/CSS, refreshes per-site
# assets/img, commits, pushes, then drops the clone so it doesn't sit on disk.
#
# Usage:  bash scripts/deploy-all.sh [site1.ca ...]   (no args = all sites)
#         bash scripts/deploy-all.sh --keep [site1.ca ...]  # leave clones
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NETWORK="$(cd "$ROOT/../hvac-network" && pwd)"
ASTRO="$ROOT"
cd "$ASTRO"
[ -f "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" && nvm use >/dev/null 2>&1 || true

KEEP=0
ARGS=()
for arg in "$@"; do
  case "$arg" in
    --keep) KEEP=1 ;;
    *) ARGS+=("$arg") ;;
  esac
done

ALL="$(ls src/sites/*.ts 2>/dev/null | sed 's|src/sites/||; s|\.ts$||' | sort)"
if [ "${#ARGS[@]}" -gt 0 ]; then
  SITES="${ARGS[*]}"
else
  SITES="$ALL"
fi

ok=0; fail=0; clean=0; nopush=0
for site in $SITES; do
  if ! "$ASTRO/scripts/clone-deploy-repo.sh" "$site" >/tmp/da.$site.clone.log 2>&1; then
    echo "[$site] SKIP (clone failed; see /tmp/da.$site.clone.log)"; nopush=$((nopush+1)); continue
  fi
  dd="$NETWORK/sites/$site"
  dist_dir="$ASTRO/dist/$site"

  if ! HVAC_SITE="$site" npm run build:site -- --no-sync >/tmp/da.$site.log 2>&1; then
    echo "[$site] BUILD FAIL (see /tmp/da.$site.log)"; fail=$((fail+1)); continue
  fi

  node scripts/gen-og-images.mjs "$site" >/dev/null 2>&1 || echo "[$site] OG GEN FAIL"

  rsync -a \
    --include='/index.html' --include='/404.html' \
    --include='/about/***' --include='/services/***' --include='/blog/***' \
    --include='/contact/***' --include='/privacy-policy/***' --include='/thank-you/***' --include='/locations/***' \
    --include='/sitemap-index.xml' --include='/sitemap-0.xml' \
    --include='/robots.txt' --include='/llms.txt' --include='/favicon.ico' --include='/CNAME' \
    --include='/assets/' --include='/assets/css/' --include='/assets/css/**' \
    --include='/assets/js/' --include='/assets/js/**' \
    --exclude='*' "$dist_dir/" "$dd/" 2>/dev/null || true

  mkdir -p "$dd/assets/img"
  cp -R "$dist_dir/assets/img/." "$dd/assets/img/" 2>/dev/null || true
  touch "$dd/.nojekyll"

  pushout=$(cd "$dd" && git add -A && \
    if git diff --cached --quiet; then echo "CLEAN"; else \
      git commit -q -m "deploy: $site" && \
      { git ls-remote --heads origin main 2>/dev/null | grep -q . && { git pull --rebase origin main 2>/dev/null || git rebase --abort; }; } && \
      git push origin main 2>&1 | tail -1; \
    fi)
  case "$pushout" in
    CLEAN) clean=$((clean+1));;
    *"main -> main"*) ok=$((ok+1));;
    *) echo "[$site] PUSH ISSUE: $pushout"; fail=$((fail+1));;
  esac
  echo "[$site] $(echo $pushout | head -c 70)"
  rm -rf "$dist_dir"
  if [ $KEEP -eq 0 ]; then
    rm -rf "$dd"
  fi
done

echo ""
echo "=== DONE: $ok pushed, $clean clean, $fail failed, $nopush no-repo ==="
echo "=== Chatbot: if any site NAP/service-area changed, refresh the context bundle: ==="
echo "===   npm run gen:chat-context  &&  (cd ../hvac-chat-context && wrangler deploy) ==="
