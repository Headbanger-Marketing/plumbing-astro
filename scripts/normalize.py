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
    """Describe the published inquiry website, using its actual public homepage.

    The rendered HTML already applies phone visibility and reviewed descriptions.
    Never bypass those policies by publishing raw routing numbers or old claims.
    """
    import json
    import re
    config_path = ROOT / "src" / "sites" / f"{domain}.ts"
    content_path = ROOT / "src" / "sites" / domain / "content.ts"
    homepage = DIST / "index.html"
    if not config_path.exists() or not homepage.exists():
        raise RuntimeError(f"Cannot generate public site summary for {domain}")
    config_ts = config_path.read_text(encoding="utf-8")
    brand = _extract_ts_string(config_ts, "brand") or domain
    city = _extract_ts_string(config_ts, "city") or "Ontario"
    email = _extract_ts_string(config_ts, "email") or f"contact@{domain}"
    brand_plain = brand.replace("&amp;", "&")
    soup = BeautifulSoup(homepage.read_text(encoding="utf-8"), "html.parser")
    description = soup.find("meta", attrs={"name": "description"})
    definition = description.get("content", "").strip() if description else ""
    if not definition:
        raise RuntimeError(f"Missing reviewed homepage description for {domain}")
    public_phone = next((a["href"][4:] for a in soup.find_all("a", href=True)
                         if a["href"].startswith("tel:")), "")
    contact = [f"Email: {email}", f"Website: https://{domain}"]
    if public_phone:
        contact.insert(0, f"Phone: {public_phone}")
    lines = [f"# {brand_plain}", "", f"> {definition}", "", "  |  ".join(contact), ""]
    sa_match = re.search(r"serviceAreas:\s*\[([^\]]+)\]", config_ts)
    areas = [m.group(2) for m in re.finditer(r"(['\"])(.*?)\1", sa_match.group(1))] if sa_match else []
    if areas:
        lines.extend([f"Request locations: {', '.join(areas)}. Coverage and availability require provider confirmation.", ""])
    lines.extend(["## Key pages", "",
        f"- [Home](https://{domain}/): Service request overview and equipment guidance",
        f"- [About](https://{domain}/about/): Website and inquiry process",
        f"- [Contact](https://{domain}/contact/): Submit a service inquiry", ""])
    services = []
    if content_path.exists():
        content_ts = content_path.read_text(encoding="utf-8")
        hs_match = re.search(r'HOME_SERVICES\s*=\s*\[(.*?)\];', content_ts, re.DOTALL)
        if hs_match:
            for m in re.finditer(r'\[\s*"[a-z\-]+"\s*,\s*"([^"]+)"\s*,\s*"[^"]*"\s*,\s*"([^"]+)"\s*\]', hs_match.group(1)):
                title, url = m.group(1).replace("&amp;", "&"), m.group(2)
                if not url.startswith("/") or not (DIST / url.strip("/") / "index.html").exists():
                    raise RuntimeError(f"Missing service-summary target {domain}{url}")
                services.append((title, url))
    if services:
        lines.extend(["## Services", ""])
        lines.extend(f"- [{title}](https://{domain}{url}): {title} guidance and requests in {city}, Ontario" for title, url in services)
        lines.append("")
    package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["name"]
    vertical_match = re.search(r"vertical:\s*['\"]([^'\"]+)['\"]", config_ts)
    vertical = vertical_match.group(1) if vertical_match else "hvac"
    topic = {"plumbing-astro": "plumbing requests", "duct-cleaning-astro": "duct-cleaning requests"}.get(package)
    topic = topic or {"generator": "standby generator planning", "solar": "solar planning", "geothermal": "geothermal planning"}.get(vertical, "heating and cooling requests")
    lines.extend(["## FAQ", "", f"Questions about {topic} in {city} are addressed on the homepage.", ""])
    (DIST / "llms.txt").write_text("\n".join(lines), encoding="utf-8")
    print(f"[normalize] llms.txt written ({brand_plain})")


def _extract_ts_string(ts: str, field: str) -> str | None:
    """Extract a single- or double-quoted TS config string."""
    import re
    m = re.search(rf"\b{re.escape(field)}:\s*(['\"])(.*?)\1", ts)
    return m.group(2) if m else None


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
