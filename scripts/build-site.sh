#!/usr/bin/env bash
# Build on this machine with complete assets; never clone a city repository.
set -euo pipefail
script_dir="$(cd "$(dirname "$0")" && pwd)"
site="${HVAC_SITE:-${ELECTRICAL_SITE:-}}"
if [ "$#" -gt 0 ] && [[ "$1" != --* ]]; then site="$1"; shift; fi
if [ -z "$site" ]; then echo "Set HVAC_SITE/ELECTRICAL_SITE or pass a domain" >&2; exit 1; fi
exec python3 "$script_dir/local-deploy.py" "$site" --build-only "$@"
