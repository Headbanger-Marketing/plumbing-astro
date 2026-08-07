#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract bespoke about-page copy from a deployed site's about/index.html.

Output: src/sites/<domain>/about-overrides.json

Usage:
    python3 scripts/extract-about-overrides.py londonhvacpros.ca
    python3 scripts/extract-about-overrides.py --all
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
NETWORK = ROOT.parent / "hvac-network" / "sites"

PILOTS = [
    "londonheatingcooling.ca",
    "londonhvacpros.ca",
    "londonacrepair.ca",
]


def inner_html(el) -> str:
    if el is None:
        return ""
    return el.decode_contents()


def extract_about_overrides(deploy_dir: Path) -> dict:
    p = deploy_dir / "about" / "index.html"
    if not p.exists():
        return {}
    soup = BeautifulSoup(p.read_text(encoding="utf-8"), "html.parser")
    overrides: dict = {}

    # page-hero h1 + lead
    hero = soup.find("section", class_="page-hero")
    if hero:
        h1 = hero.find("h1")
        if h1:
            overrides["hero_h1"] = inner_html(h1)
        # hero lead is the <p> inside page-hero
        p = hero.find("p")
        if p:
            overrides["hero_lead"] = inner_html(p)

    # "Our Story" section: lead + body paragraphs
    for sec in soup.find_all("section"):
        eb = sec.select_one(".eyebrow")
        if not eb:
            continue
        if "our story" in eb.get_text().lower():
            reveal = sec.select_one(".reveal") or sec
            lead = reveal.find("p", class_="lead")
            if lead:
                overrides["story_lead"] = inner_html(lead)
            ps = [
                p for p in reveal.find_all("p")
                if "lead" not in (p.get("class") or [])
            ]
            if ps:
                overrides["story_paragraphs"] = [inner_html(p) for p in ps]
            break

    # "Our Commitment" section: heading + body paragraphs
    for sec in soup.find_all("section"):
        eb = sec.select_one(".eyebrow")
        if not eb:
            continue
        if "our commitment" in eb.get_text().lower():
            reveal = sec.select_one(".reveal") or sec
            h2 = reveal.find("h2")
            if h2:
                overrides["commitment_h2"] = inner_html(h2)
            ps = [
                p for p in reveal.find_all("p")
                if "lead" not in (p.get("class") or [])
            ]
            if ps:
                overrides["commitment_paragraphs"] = [inner_html(p) for p in ps]
            # callout h3 + p
            callout = sec.select_one(".callout")
            if callout:
                ch3 = callout.find("h3")
                if ch3:
                    overrides["callout_h3"] = inner_html(ch3)
                cp = callout.find("p")
                if cp:
                    overrides["callout_p"] = inner_html(cp)
            break

    # CTA band h2 ("Experience the X Difference")
    for band in soup.select(".cta-band"):
        h2 = band.find("h2")
        if h2 and "difference" in h2.get_text().lower():
            overrides["cta_h2"] = inner_html(h2)
            p = band.find("p")
            if p:
                overrides["cta_p"] = inner_html(p)
            break

    return overrides


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: extract-about-overrides.py <domain> | --all")
        sys.exit(1)
    arg = sys.argv[1]
    domains = PILOTS if arg == "--all" else [arg]
    for d in domains:
        deploy_dir = NETWORK / d
        if not deploy_dir.exists():
            print(f"SKIP {d}: not checked out")
            continue
        overrides = extract_about_overrides(deploy_dir)
        out_dir = ROOT / "src" / "sites" / d
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "about-overrides.json"
        out_path.write_text(json.dumps(overrides, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"OK  {d}: {len(overrides)} keys -> {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
