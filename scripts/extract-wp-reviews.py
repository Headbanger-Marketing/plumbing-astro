#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract per-site customer reviews from the live WordPress HTML of a site and
write them into the site's home-overrides.json (home_reviews field).

Background: the migration's existing extract-home-overrides.py reads from the
*deploy repo's* index.html, which is already the Astro build. For the 59 sites
that are still serving WordPress live, this circularly captures the shared
template reviews (Sarah M. / David R. / Jennifer T.) rather than the real
per-site reviews. This script reads from the LIVE WordPress HTML instead, where
each site has 3 unique brand-specific reviews.

The WP DOM is GeneratePress / Generate Blocks. The review section uses stable
per-card class hashes that are identical across all 59 WP sites:
  quote paragraphs:  gb-text-1a8b9f72, gb-text-231a7625, gb-text-4ef7f9b8
  author names:      gb-text-08f619f5, gb-text-e75e8ba4, gb-text-69656d98
  author places:     gb-text-1fd01fe2, gb-text-fe0dab0e, gb-text-9615f75e

Strategy A (hash-anchored) is the only reliable approach — Strategy B
(structural, finding every <p> with <span class="gb-shape">) has false
positives because trust badges share the same star-icon wrapper.

Output: src/sites/<domain>/home-overrides.json (merges home_reviews into the
existing JSON; all other keys are preserved).

Usage:
    python3 scripts/extract-wp-reviews.py chathamhvacpros.ca
    python3 scripts/extract-wp-reviews.py --all
"""
import json
import re
import subprocess
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: pip3 install beautifulsoup4", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
SITES_DIR = ROOT / "src" / "sites"

# Sites that are already serving the Astro build live (no WP HTML to extract
# from). Their reviews are already bespoke and must not be touched.
SKIP_SITES = {
    "londonheatingcooling.ca",
    "londonacrepair.ca",
    "londonfurnacerepair.ca",
    "londonhvacpros.ca",
    "cambridgehvacpros.ca",       # excluded — pre-existing manual mods
    "dunnvilleheatingcooling.ca", # excluded — hand-built, no WP source
}

# Stable Generate Blocks class anchors (identical across all 59 WP sites).
QUOTE_CLASSES = ["gb-text-1a8b9f72", "gb-text-231a7625", "gb-text-4ef7f9b8"]
NAME_CLASSES  = ["gb-text-08f619f5", "gb-text-e75e8ba4", "gb-text-69656d98"]
PLACE_CLASSES = ["gb-text-1fd01fe2", "gb-text-fe0dab0e", "gb-text-9615f75e"]


def clean_quote(text: str) -> tuple[str, list[str]]:
    """Normalize a WP review quote.
    Returns (cleaned_text, list_of_warnings).
    """
    warnings = []
    original = text

    # Strip wrapping curly quotes (smart quotes) — WP sometimes wraps in
    # literal "..." and sometimes in &#8220;...&#8221; entities. BeautifulSoup
    # decodes entities to literal chars for us.
    for left, right in [("\u201c", "\u201d"), ('"', '"')]:
        while text.startswith(left) and text.endswith(right) and len(text) >= len(left) + len(right):
            text = text[len(left):-len(right)].strip()

    # Collapse internal whitespace (newlines, double spaces, tabs).
    text = re.sub(r"\s+", " ", text).strip()

    # Replace em-dashes / en-dashes with spaced hyphens. The migration's hard
    # rule is "no em-dashes in visible copy" — WP customer reviews sometimes
    # contain them ("furnace install — highly recommend"). Convert to a spaced
    # hyphen ONLY where the em-dash has whitespace on at least one side (the
    # punctuation use case). Em-dashes glued directly between word characters
    # are rare in review text; if they appear, we leave them as a plain hyphen
    # so we don't break real hyphenated compounds like "energy-efficient".
    #   " — "  -> " - "       (spaced em-dash stays spaced)
    #   "word — word" -> "word - word"
    #   "—word" -> " - word"  (leading em-dash, common WP signature)
    #   "word—" -> "word - "  (trailing em-dash)
    new_text = text
    # First, mark em-dashes that have whitespace adjacency by replacing them
    # with " - " (the surrounding spaces prevent merging). Do this BEFORE
    # touching any plain hyphens.
    new_text = re.sub(r"\s*[\u2014\u2013]\s*", " - ", new_text)
    # Any em-dashes that survived (glued between two word chars with no
    # surrounding whitespace) become a plain hyphen — preserves compounds.
    new_text = new_text.replace("\u2014", "-").replace("\u2013", "-")
    # Tidy whitespace and clean up " . " artifacts from the spaced replacement.
    new_text = re.sub(r"\s+", " ", new_text).strip()
    if new_text != text:
        warnings.append("em-dash-replaced")
        text = new_text

    # Fix stray space before sentence-final punctuation: "word !" -> "word!"
    # Conservative — only ! ? . , : ;
    fixed_punct = re.sub(r"\s+([!?.,;:])", r"\1", text)
    if fixed_punct != text:
        warnings.append("stray-space-before-punct")
        text = fixed_punct

    # Strip any leftover wrapping quotes after the punct fix (in case the
    # original was `"..."` with trailing space inside).
    text = text.strip("\u201c\u201d\"")

    if text != original and not warnings:
        warnings.append("normalized")
    return text, warnings


def clean_name(name: str) -> tuple[str, list[str]]:
    """Normalize an author name. WP sometimes renders names with a leading
    em-dash signature ('— Sarah L.'). Strip leading/trailing dashes and
    whitespace; flag if a dash was removed."""
    warnings = []
    original = name
    name = re.sub(r"\s+", " ", name).strip()
    # strip leading dashes (em-dash, en-dash, hyphen) and whitespace around them
    new_name = re.sub(r"^[\s\u2014\u2013\-]+", "", name).strip()
    # strip trailing dashes too
    new_name = re.sub(r"[\s\u2014\u2013\-]+$", "", new_name).strip()
    if new_name != name:
        warnings.append("name-dash-stripped")
        name = new_name
    # also strip any internal em-dashes (defensive — shouldn't happen in names)
    if "\u2014" in name or "\u2013" in name:
        name = name.replace("\u2014", " ").replace("\u2013", " ")
        name = re.sub(r"\s+", " ", name).strip()
        warnings.append("name-internal-dash-removed")
    return name, warnings


def fetch_wp_html(domain: str, timeout: int = 20) -> str:
    """Fetch the live WP homepage HTML for a domain. Raises on failure.

    Some WP pages contain invalid UTF-8 bytes (stray 0xed from a broken emoji
    or smart-quote on the WP side). We decode with errors='replace' so the
    parse succeeds; the affected bytes are not in the review text we extract.
    """
    result = subprocess.run(
        ["curl", "-s", "--max-time", str(timeout), "-A",
         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
         f"https://{domain}/"],
        capture_output=True, timeout=timeout + 5,
    )
    raw = result.stdout
    if not raw or len(raw) < 1000:
        raise RuntimeError("empty or too-short response (likely network error)")
    html = raw.decode("utf-8", errors="replace")
    # Sanity check: must look like the WP Generate Blocks DOM
    if "gb-text-1a8b9f72" not in html:
        raise RuntimeError("WP review anchor gb-text-1a8b9f72 not found \u2014 not a WP/GenerateBlocks site?")
    return html


def derive_city_from_overrides(overrides_path: Path) -> str:
    """Derive a site's city from its existing home-overrides.json reviews_h2.
    The h2 has the form 'What <City> Homeowners Are Saying'.
    Used as a fallback when WP has an empty place field for a review.
    """
    if not overrides_path.exists():
        return ""
    data = json.loads(overrides_path.read_text(encoding="utf-8"))
    h2 = data.get("reviews_h2", "")
    m = re.search(r"What\s+(\w[\w\s]*?)\s+Homeowners", h2)
    return m.group(1).strip() if m else ""


def extract_reviews(html: str, fallback_city: str = "") -> tuple[list[dict], list[str]]:
    """Extract exactly 3 reviews from WP HTML using hash-anchored classes.

    Some WP sites have an empty place field (data entry omission on the WP
    side). When that happens we fall back to `fallback_city` (the site's own
    city, derived from reviews_h2) and emit a warning so it's visible.
    """
    soup = BeautifulSoup(html, "html.parser")
    reviews = []
    all_warnings = []

    for i in range(3):
        q_el = soup.find("p", class_=QUOTE_CLASSES[i])
        n_el = soup.find("p", class_=NAME_CLASSES[i])
        p_el = soup.find("p", class_=PLACE_CLASSES[i])

        if not q_el:
            raise RuntimeError(f"quote element .{QUOTE_CLASSES[i]} not found")
        if not n_el:
            raise RuntimeError(f"name element .{NAME_CLASSES[i]} not found")
        if not p_el:
            raise RuntimeError(f"place element .{PLACE_CLASSES[i]} not found")

        # Quote: BeautifulSoup strips <em> tags automatically via get_text,
        # and decodes HTML entities to literal chars.
        raw_quote = q_el.get_text(" ", strip=True)
        quote, warnings = clean_quote(raw_quote)
        if warnings:
            all_warnings.append(f"review {i+1}: {', '.join(warnings)}")

        name = n_el.get_text(" ", strip=True)
        name, name_warnings = clean_name(name)
        if name_warnings:
            all_warnings.append(f"review {i+1}: {', '.join(name_warnings)}")

        place = p_el.get_text(" ", strip=True)
        # WP places are bare town names ("Dresden", "Paris, ON"); strip a
        # trailing ", ON" or ", Ontario" if present (reviewCard re-adds ", ON").
        # Use endswith + len() to avoid off-by-one slice bugs.
        for suffix in (", Ontario", ", ON"):
            if place.endswith(suffix):
                place = place[: -len(suffix)].strip()
                break

        # Fallback for empty place (4 sites have this WP-side data omission)
        if not place:
            if fallback_city:
                place = fallback_city
                all_warnings.append(f"review {i+1}: empty-place (fell back to site city {fallback_city!r})")
            else:
                raise RuntimeError(f"review {i+1} place empty and no fallback_city available")

        # Validate
        if len(quote) < 30:
            raise RuntimeError(f"review {i+1} quote too short ({len(quote)} chars): {quote!r}")
        if not name:
            raise RuntimeError(f"review {i+1} name empty")
        if not place:
            raise RuntimeError(f"review {i+1} place empty")

        reviews.append({"text": quote, "name": name, "place": place})

    if len(reviews) != 3:
        raise RuntimeError(f"expected exactly 3 reviews, got {len(reviews)}")

    return reviews, all_warnings


def write_home_reviews(domain: str, reviews: list[dict]) -> Path:
    """Merge home_reviews into the site's home-overrides.json, preserving all
    other keys. Returns the path written."""
    overrides_path = SITES_DIR / domain / "home-overrides.json"
    if not overrides_path.exists():
        raise RuntimeError(f"home-overrides.json not found at {overrides_path}")

    # Read existing JSON (preserve key order)
    existing = json.loads(overrides_path.read_text(encoding="utf-8"))

    # Preserve original key order; if home_reviews isn't present yet, append it.
    new_data = {}
    for k, v in existing.items():
        if k == "home_reviews":
            new_data[k] = reviews  # replace
        else:
            new_data[k] = v
    if "home_reviews" not in new_data:
        new_data["home_reviews"] = reviews

    # Pretty-print with 2-space indent, preserve non-ASCII (matches existing
    # extract-home-overrides.py output style).
    overrides_path.write_text(
        json.dumps(new_data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return overrides_path


def process_site(domain: str) -> int:
    """Extract reviews for one site. Returns 0 on success, 1 on failure."""
    if domain in SKIP_SITES:
        print(f"SKIP {domain}: in skip list (already-Astro or excluded)")
        return 0

    overrides_path = SITES_DIR / domain / "home-overrides.json"
    fallback_city = derive_city_from_overrides(overrides_path)

    try:
        html = fetch_wp_html(domain)
        reviews, warnings = extract_reviews(html, fallback_city=fallback_city)
        path = write_home_reviews(domain, reviews)
        warn_str = f" [warnings: {'; '.join(warnings)}]" if warnings else ""
        print(f"OK   {domain}: 3 reviews -> {path.relative_to(ROOT)}{warn_str}")
        return 0
    except Exception as e:
        print(f"FAIL {domain}: {e}", file=sys.stderr)
        return 1


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 1

    if args[0] == "--all":
        # Process every site that has a src/sites/<domain>/ directory
        domains = sorted(
            d.name for d in SITES_DIR.iterdir()
            if d.is_dir() and (d / "home-overrides.json").exists()
        )
        if not domains:
            print("No sites found with home-overrides.json", file=sys.stderr)
            return 1
        print(f"Processing {len(domains)} sites...")
        ok = fail = skip = 0
        failed = []
        for d in domains:
            if d in SKIP_SITES:
                skip += 1
                continue
            rc = process_site(d)
            if rc == 0:
                ok += 1
            else:
                fail += 1
                failed.append(d)
        print(f"\nSummary: {ok} OK, {fail} FAIL, {skip} skipped")
        if failed:
            print("Failed sites (re-run to retry):")
            for d in failed:
                print(f"  python3 scripts/extract-wp-reviews.py {d}")
        return 1 if fail else 0

    # Single-site mode
    return process_site(args[0])


if __name__ == "__main__":
    sys.exit(main())
