#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract bespoke service-page copy from each service page's deployed HTML.

Service pages have per-site quirks:
- LHP/LAC add `reveal` class to .svc-photo (LHC doesn't)
- The CTA band text is bespoke per site
- Some sites use loading="eager" on svc-photo

Rather than detect all variants in build_pages.py, we extract the rendered
<img> tag and CTA text directly from each deployed service page.

Output: src/sites/<domain>/service-overrides.json
  {
    "<slug>": {
      "svc_photo_img": "<img class=\"svc-photo reveal\" ...>",
      "cta_text": "Don't let..."
    },
    ...
  }

Usage:
    python3 scripts/extract-service-overrides.py londonhvacpros.ca
    python3 scripts/extract-service-overrides.py --all
"""
import json
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: pip3 install beautifulsoup4", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
NETWORK = Path.home() / "Projects" / "hvac" / "scratch" / "sites"

PILOTS = [
    "londonheatingcooling.ca",
    "londonhvacpros.ca",
    "londonacrepair.ca",
]

SERVICE_SLUGS = [
    "furnace-repair",
    "ac-repair",
    "ductless-ac-installation",
    "heat-pump-repair-installation",
    "fireplace-installation",
    "thermostat-repair-replacement",
    "duct-cleaning",
]


def extract_service_overrides(deploy_dir: Path) -> dict:
    result = {}
    for slug in SERVICE_SLUGS:
        p = deploy_dir / "services" / slug / "index.html"
        if not p.exists():
            continue
        soup = BeautifulSoup(p.read_text(encoding="utf-8"), "html.parser")
        entry: dict = {}
        img = soup.select_one("img.svc-photo")
        if img:
            entry["svc_photo_img"] = str(img)
        # h1 — per-site pattern (LHC/LHP prepend brand, LAC doesn't).
        h1 = soup.find("h1")
        if h1:
            entry["h1"] = h1.decode_contents()
        # CTA band is the last .cta-band on the page; its <p> is bespoke.
        bands = soup.select(".cta-band")
        if bands:
            last = bands[-1]
            p_tag = last.find("p")
            if p_tag:
                entry["cta_text"] = p_tag.decode_contents()
        if entry:
            result[slug] = entry
    return result


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: extract-service-overrides.py <domain> | --all")
        sys.exit(1)
    arg = sys.argv[1]
    domains = PILOTS if arg == "--all" else [arg]
    for d in domains:
        deploy_dir = NETWORK / d
        if not deploy_dir.exists():
            print(f"SKIP {d}")
            continue
        overrides = extract_service_overrides(deploy_dir)
        out_dir = ROOT / "src" / "sites" / d
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "service-overrides.json"
        out_path.write_text(json.dumps(overrides, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"OK  {d}: {len(overrides)} services -> {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
