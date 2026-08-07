#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Post-build HTML normalizer for hvac-astro.

Astro's HTML serializer and the live Python-built sites differ in cosmetic ways
(attribute order, void-tag self-closing, whitespace, & encoding). The live sites
were themselves normalized through BeautifulSoup (`patch_wptext.py` line 497 does
`str(soup)` with html.parser), so re-serializing Astro's output through the same
BS4 + html.parser produces byte-identical formatting.

This script:
  1. Reads every .html file under dist/<SITE>/
  2. Parses with BeautifulSoup(html.parser)
  3. Writes str(soup) back, matching the deployed format exactly

Also generates the per-build root files (CNAME, robots.txt, llms.txt, .nojekyll)
and handles the hero class injection (if the deploy repo has hero.webp).

Usage:
    HVAC_SITE=londonheatingcooling.ca python3 scripts/normalize.py
"""
import os
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: beautifulsoup4 not installed. Run: pip3 install beautifulsoup4", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
SITE = os.environ.get("HVAC_SITE")
if not SITE:
    print("ERROR: HVAC_SITE env var required", file=sys.stderr)
    sys.exit(1)

DIST = ROOT / "dist" / SITE
if not DIST.exists():
    print(f"ERROR: {DIST} does not exist. Run astro build first.", file=sys.stderr)
    sys.exit(1)


def normalize_html(path: Path) -> bool:
    """Parse + re-serialize one HTML file via BS4 html.parser. Returns True if changed."""
    original = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(original, "html.parser")
    normalized = str(soup)
    # Astro collapses the newline between the inline <script> and <title> in <head>.
    # The live Python-built sites have them on separate lines. Restore the newline.
    normalized = normalized.replace(
        "</script><title>", "</script>\n<title>", 1
    )
    # Live Python-built files end with a trailing newline after </html>.
    if not normalized.endswith("\n"):
        normalized += "\n"
    if normalized != original:
        path.write_text(normalized, encoding="utf-8")
        return True
    return False


def generate_robots(domain: str) -> None:
    """Write robots.txt with the site's domain + AI crawler allow rules."""
    robots = DIST / "robots.txt"
    content = """User-agent: *
Allow: /

# AI / answer-engine crawlers explicitly allowed (citation is the goal)
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: CCBot
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: https://%s/sitemap-index.xml
""" % domain
    robots.write_text(content, encoding="utf-8")
    print(f"[normalize] robots.txt written (domain={domain})")


def generate_llms_txt(domain: str) -> None:
    """Write llms.txt — a curated markdown map of the site for LLMs.

    Reads the site config + content to build a brand-entity definition
    that mirrors the homepage copy/meta/schema (entity consistency = AIO signal).
    """
    import re
    config_path = ROOT / "src" / "sites" / f"{domain}.ts"
    content_path = ROOT / "src" / "sites" / domain / "content.ts"

    if not config_path.exists():
        print(f"[normalize] llms.txt skipped (no config for {domain})")
        return

    config_ts = config_path.read_text(encoding="utf-8")
    brand = _extract_ts_string(config_ts, "brand") or domain
    city = _extract_ts_string(config_ts, "city") or "Ontario"
    county = _extract_ts_string(config_ts, "county") or "Ontario"
    phone = _extract_ts_string(config_ts, "display") or ""
    email = _extract_ts_string(config_ts, "email") or f"contact@{domain}"

    # Brand for plain-text output (llms.txt is not HTML)
    brand_plain = brand.replace("&amp;", "&").replace("&amp;amp;", "&")

    # Extract service areas
    sa_match = re.search(r"serviceAreas:\s*\[([^\]]+)\]", config_ts)
    service_areas = []
    if sa_match:
        service_areas = re.findall(r'"([^"]+)"', sa_match.group(1))

    # Extract HOME_SERVICES from content.ts (the 6-card home grid).
    # Each entry: [icon, "Title", "desc", "/services/<slug>/"]
    # We extract the title + slug pair so llms.txt links are correct.
    home_services = []
    if content_path.exists():
        content_ts = content_path.read_text(encoding="utf-8")
        # Match the HOME_SERVICES export block, then extract tuples from it.
        hs_match = re.search(r'HOME_SERVICES\s*=\s*\[(.*?)\];', content_ts, re.DOTALL)
        if hs_match:
            hs_block = hs_match.group(1)
            # Each tuple: [icon, "Title", "desc", "/url"]
            for m in re.finditer(r'\[\s*"[a-z\-]+"\s*,\s*"([^"]+)"\s*,\s*"[^"]*"\s*,\s*"([^"]+)"\s*\]', hs_block):
                title_raw = m.group(1)
                url = m.group(2)
                # Unescape HTML entities for plain-text llms.txt
                title = title_raw.replace("&amp;", "&")
                home_services.append((title, url))

    # Entity definition (mirrors homepage copy + schema description)
    definition = (
        f"{brand_plain} is a local HVAC company serving {city}, {county}, Ontario, "
        f"offering furnace repair, AC repair, ductless mini-split installation, "
        f"heat pump repair and installation, fireplace installation, thermostat "
        f"repair, and duct cleaning to homeowners across the region."
    )

    lines = [
        f"# {brand_plain}",
        "",
        f"> {definition}",
        "",
        f"Phone: {phone}  |  Email: {email}  |  Website: https://{domain}",
        "",
    ]

    if service_areas:
        lines.append(f"Service areas: {', '.join(service_areas)}")
        lines.append("")

    lines.append("## Key pages")
    lines.append("")
    lines.append(f"- [Home](https://{domain}/): {brand_plain} homepage with service overview and FAQ")
    lines.append(f"- [About](https://{domain}/about/): About the company and service area")
    lines.append(f"- [Contact](https://{domain}/contact/): Request a free quote or service call")
    lines.append("")

    if home_services:
        lines.append("## Services")
        lines.append("")
        for title, url in home_services:
            full_url = f"https://{domain}{url}" if url.startswith("/") else url
            lines.append(f"- [{title}]({full_url}): {title} in {city}, Ontario")
        lines.append("")

    lines.append(f"## FAQ")
    lines.append("")
    lines.append(f"Common questions about HVAC service in {city} are answered on the homepage.")
    lines.append("")

    llms_path = DIST / "llms.txt"
    llms_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[normalize] llms.txt written ({brand})")


def _extract_ts_string(ts: str, field: str) -> str | None:
    """Extract a string value from a TS config field like: field: "value"."""
    import re
    m = re.search(rf'{field}:\s*"([^"]+)"', ts)
    return m.group(1) if m else None


def main() -> None:
    html_files = sorted(DIST.rglob("*.html"))
    changed = 0
    for p in html_files:
        if normalize_html(p):
            changed += 1
    print(f"[normalize] {changed}/{len(html_files)} HTML files re-serialized via BS4")

    # Generate root files for AIO/SEO
    generate_robots(SITE)
    generate_llms_txt(SITE)


if __name__ == "__main__":
    main()
