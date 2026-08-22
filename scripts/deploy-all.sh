#!/usr/bin/env bash
# Deploy the full network (all sites with src/sites/<domain>.ts). Builds each,
# syncs HTML/CSS, refreshes per-site assets/img, commits, and pushes to the
# correct deploy repo (sites/<domain>/).
#
# Usage:  bash scripts/deploy-all.sh [site1.ca ...]   (no args = all sites)
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NETWORK="$(cd "$ROOT/../hvac-network" && pwd)"
ASTRO="$ROOT"
cd "$ASTRO"
[ -f "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" && nvm use >/dev/null 2>&1 || true

# Discover all site domains.
ALL="$(ls src/sites/*.ts 2>/dev/null | sed 's|src/sites/||; s|\.ts$||' | sort)"
SITES="${*:-$ALL}"

# Find the deploy dir for a site (single location after deploy-preview consolidation).
deploy_dir() {
  [ -d "$NETWORK/sites/$1/.git" ] && echo "$NETWORK/sites/$1"
}

ok=0; fail=0; clean=0; nopush=0
for site in $SITES; do
  dd="$(deploy_dir "$site")"
  if [ -z "$dd" ]; then echo "[$site] SKIP (no git deploy repo)"; nopush=$((nopush+1)); continue; fi
  dist_dir="$ASTRO/dist/$site"

  # 1. build
  if ! HVAC_SITE="$site" npm run build:site -- --no-sync >/tmp/da.$site.log 2>&1; then
    echo "[$site] BUILD FAIL (see /tmp/da.$site.log)"; fail=$((fail+1)); continue
  fi

  # 1b. regenerate the per-site OG card (the astro build wipes dist/, and the
  # shared public/ og-default would otherwise go out identical on every site).
  node scripts/gen-og-images.mjs "$site" >/dev/null 2>&1 || echo "[$site] OG GEN FAIL"

  # 2. sync HTML/CSS/JS
  rsync -a \
    --include='/index.html' --include='/404.html' \
    --include='/about/***' --include='/services/***' --include='/blog/***' \
    --include='/contact/***' --include='/privacy-policy/***' --include='/thank-you/***' --include='/locations/***' \
    --include='/sitemap-index.xml' --include='/sitemap-0.xml' \
    --include='/robots.txt' --include='/llms.txt' --include='/favicon.ico' --include='/CNAME' \
    --include='/assets/' --include='/assets/css/' --include='/assets/css/**' \
    --include='/assets/js/' --include='/assets/js/**' \
    --exclude='*' "$dist_dir/" "$dd/" 2>/dev/null || true

  # 3. refresh assets/img
  mkdir -p "$dd/assets/img"
  cp -R "$dist_dir/assets/img/." "$dd/assets/img/" 2>/dev/null || true
  touch "$dd/.nojekyll"

  # 4. commit + push (rebase if remote has cutover commits)
  pushout=$(cd "$dd" && git add -A && \
    if git diff --cached --quiet; then echo "CLEAN"; else \
      git commit -q -m "deploy: direct service copy + header brand lockup" && \
      { git ls-remote --heads origin main 2>/dev/null | grep -q . && { git pull --rebase origin main 2>/dev/null || git rebase --abort; }; } && \
      git push origin main 2>&1 | tail -1; \
    fi)
  case "$pushout" in
    CLEAN) clean=$((clean+1));;
    *"main -> main"*) ok=$((ok+1));;
    *) echo "[$site] PUSH ISSUE: $pushout"; fail=$((fail+1));;
  esac
  echo "[$site] $(echo $pushout | head -c 70)"
done

echo ""
echo "=== DONE: $ok pushed, $clean clean, $fail failed, $nopush no-repo ==="
echo "=== Chatbot: if any site NAP/service-area changed, refresh the context bundle: ==="
echo "===   npm run gen:chat-context  &&  (cd ../hvac-chat-context && wrangler deploy) ==="
