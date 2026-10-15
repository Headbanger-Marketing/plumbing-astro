#!/usr/bin/env bash
# Local build and preview; add --publish to publish the reviewed compiled files.
set -euo pipefail
script_dir="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$script_dir/local-deploy.py" "$@"
