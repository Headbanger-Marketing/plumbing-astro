#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract bespoke contact-page copy from a deployed site's contact/index.html.

Output: src/sites/<domain>/contact-overrides.json

Usage:
    python3 scripts/extract-contact-overrides.py londonhvacpros.ca
    python3 scripts/extract-contact-overrides.py --all
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


def inner_html(el) -> str:
    if el is None:
        return ""
    return el.decode_contents()


def extract_contact_overrides(deploy_dir: Path) -> dict:
    p = deploy_dir / "contact" / "index.html"
    if not p.exists():
        return {}
    soup = BeautifulSoup(p.read_text(encoding="utf-8"), "html.parser")
    overrides: dict = {}

    hero = soup.find("section", class_="page-hero")
    if hero:
        p_tag = hero.find("p")
        if p_tag:
            overrides["hero_lead"] = inner_html(p_tag)

    # "Send a Message" section: find the eyebrow anywhere, then the next <p>
    # sibling of the h2 in the same split-block.
    for eb in soup.select(".eyebrow"):
        if "send a message" in eb.get_text().lower():
            # Walk up to the nearest container that also has the h2 + p.
            container = eb.parent
            while container and container.name != "html":
                h2 = container.find("h2")
                if h2:
                    # Find the first <p> that comes after the h2 in document order.
                    p_tag = h2.find_next("p")
                    if p_tag:
                        overrides["form_intro"] = inner_html(p_tag)
                    break
                container = container.parent
            break

    return overrides


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: extract-contact-overrides.py <domain> | --all")
        sys.exit(1)
    arg = sys.argv[1]
    domains = PILOTS if arg == "--all" else [arg]
    for d in domains:
        deploy_dir = NETWORK / d
        if not deploy_dir.exists():
            print(f"SKIP {d}")
            continue
        overrides = extract_contact_overrides(deploy_dir)
        out_dir = ROOT / "src" / "sites" / d
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "contact-overrides.json"
        out_path.write_text(json.dumps(overrides, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"OK  {d}: {len(overrides)} keys -> {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
