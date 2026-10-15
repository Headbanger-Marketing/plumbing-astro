#!/usr/bin/env bash
# Exact reviewed live sites only; add --publish to publish local builds.
set -euo pipefail
script_dir="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$script_dir/local-deploy.py" --all-live "$@"
