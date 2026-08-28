#!/usr/bin/env bash
# Clone the Pages repo for <domain> into hvac-network/sites/<domain>/ if it
# isn't already there. Deploy clones are not kept on disk; call this on demand.
#
# Live plumbing/duct/HVAC Pages repos are on Headbanger-Marketing. Fall back
# to liamseopro only for any repo that was never transferred.
#
# Usage:
#   ./scripts/clone-deploy-repo.sh <domain>
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <domain>" >&2
  exit 1
fi

DOMAIN="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HVAC_WORKSPACE="${HVAC_WORKSPACE:-$HOME/Projects/hvac}"
DEPLOY="${HVAC_SITES_DIR:-$HVAC_WORKSPACE/scratch/sites}/$DOMAIN"

if [ -d "$DEPLOY/.git" ]; then
  echo "[clone] $DOMAIN already at $DEPLOY"
  exit 0
fi

if [ -e "$DEPLOY" ]; then
  echo "ERROR: $DEPLOY exists but is not a git repo. Move it aside." >&2
  exit 1
fi

mkdir -p "$(dirname "$DEPLOY")"

clone_from() {
  local owner="$1"
  echo "[clone] git clone $owner/$DOMAIN -> $DEPLOY (depth 1)"
  # plain git clone: gh repo clone needs GraphQL, which rate-limits out mid
  # bulk deploys. git+gh-credential-helper works without any API quota.
  git clone --depth 1 --single-branch --branch main "https://github.com/$owner/$DOMAIN.git" "$DEPLOY"
}

# git ls-remote checks existence without burning gh API quota (gh repo view is
# GraphQL and rate-limits out mid bulk deploys, faking "no repo" errors).
if git ls-remote --exit-code "https://github.com/Headbanger-Marketing/$DOMAIN.git" HEAD >/dev/null 2>&1; then
  clone_from Headbanger-Marketing
elif git ls-remote --exit-code "https://github.com/liamseopro/$DOMAIN.git" HEAD >/dev/null 2>&1; then
  clone_from liamseopro
else
  echo "ERROR: no GitHub repo for $DOMAIN under Headbanger-Marketing or liamseopro." >&2
  exit 1
fi
echo "[clone] OK"
