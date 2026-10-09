"""Portfolio root for local deploy clones.

Scripts live in <portfolio>/builders/<name>/scripts, or in a copied client
repo. HVAC_WORKSPACE and HVAC_SITES_DIR still win when they are set.
"""

from __future__ import annotations

import os
from pathlib import Path


def portfolio_root() -> Path:
    override = os.environ.get("HVAC_WORKSPACE")
    if override:
        return Path(override)
    # parents: scripts -> builder -> builders -> portfolio
    candidate = Path(__file__).resolve().parents[3]
    if (candidate / "builders").is_dir() and (candidate / "scratch").is_dir():
        return candidate
    lexar = Path("/Volumes/Lexar/Projects/hvac")
    if (lexar / "scratch").is_dir():
        return lexar
    raise SystemExit("ERROR: cannot find the HVAC portfolio. Set HVAC_WORKSPACE.")


def deploy_sites_dir() -> Path:
    override = os.environ.get("HVAC_SITES_DIR")
    if override:
        return Path(override)
    return portfolio_root() / "scratch" / "sites"
