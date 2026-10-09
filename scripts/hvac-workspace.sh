# Portfolio root for local deploy clones (scratch/sites).
# This file lives in <portfolio>/builders/<name>/scripts, three levels below
# the portfolio. A copy that lives somewhere else falls back to the Lexar
# portfolio. HVAC_WORKSPACE still wins when set.
# Do not default to $HOME/Projects/hvac: on this Mac that path is an empty file.
if [ -z "${HVAC_WORKSPACE:-}" ]; then
  _ws_here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  _ws_candidate="$(cd "$_ws_here/../../.." && pwd)"
  if [ -d "$_ws_candidate/builders" ] && [ -d "$_ws_candidate/scratch" ]; then
    HVAC_WORKSPACE="$_ws_candidate"
  elif [ -d "/Volumes/Lexar/Projects/hvac/scratch" ]; then
    HVAC_WORKSPACE="/Volumes/Lexar/Projects/hvac"
  else
    echo "ERROR: cannot find the HVAC portfolio. Set HVAC_WORKSPACE." >&2
    exit 1
  fi
  unset _ws_here _ws_candidate
fi
