#!/usr/bin/env bash
# Build reviewed live sites locally, once per builder, with no publication.
set -euo pipefail
script_dir="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$script_dir/local-deploy.py" --all-live --build-only "$@"
