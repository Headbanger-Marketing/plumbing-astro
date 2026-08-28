#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract bespoke home page copy from a deployed site's index.html and emit a
per-site override file consumed by the Astro home page.

Each site's home page has unique sections written separately (not token-
substitutable from a shared template). Rather than trying to fit each into a
rigid schema, we capture each major section's inner HTML verbatim and let
the Astro template render the override when present.

Output: src/sites/<domain>/home-overrides.json

Usage:
    python3 scripts/extract-home-overrides.py londonhvacpros.ca
    python3 scripts/extract-home-overrides.py --all
"""
import json
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup, NavigableString
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
    """Return the inner HTML of an element as a string (preserving child tags)."""
    if el is None:
        return ""
    return el.decode_contents()


def find_section_by_h2(soup, *h2_contains_options):
    """Find the first <section> whose h2 contains any of the given substrings."""
    for sec in soup.find_all("section"):
        h2 = sec.find("h2")
        if not h2:
            continue
        txt = h2.get_text().lower()
        for opt in h2_contains_options:
            if opt.lower() in txt:
                return sec
    return None


def find_section_by_eyebrow(soup, *eyebrow_options):
    """Find the first <section> whose eyebrow contains any of the given substrings."""
    for sec in soup.find_all("section"):
        eb = sec.select_one(".eyebrow")
        if not eb:
            continue
        txt = eb.get_text().lower()
        for opt in eyebrow_options:
            if opt.lower() in txt:
                return sec
    return None


def extract_home_overrides(deploy_dir: Path) -> dict:
    """Pull the bespoke home page copy from deploy_dir/index.html."""
    html = (deploy_dir / "index.html").read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "html.parser")
    overrides: dict = {}

    # ---- HERO ----
    hero = soup.find("section", class_="hero")
    if hero:
        overrides["hero_class"] = " ".join(hero.get("class", []))
        eb = hero.select_one(".eyebrow")
        if eb:
            overrides["hero_eyebrow"] = inner_html(eb)
        h1 = hero.find("h1")
        if h1:
            overrides["hero_h1"] = inner_html(h1)
        sub = hero.select_one("p.hero__sub")
        if sub:
            overrides["hero_sub"] = inner_html(sub)

    # ---- "Who We Are" / "Installation Specialists" / etc ----
    # Match by the section-head eyebrow OR h2 to be robust across sites.
    who = find_section_by_eyebrow(
        soup, "Who We Are", "Installation Specialists", "About Us", "Our Story", "Why Choose"
    ) or find_section_by_h2(
        soup, "Established Name", "High-Efficiency System", "Home Comfort", "London's Trusted"
    )
    if who:
        reveal = who.select_one(".reveal") or who
        lead = reveal.find("p", class_="lead")
        if lead:
            overrides["who_we_are_lead"] = inner_html(lead)
        ps = [p for p in reveal.find_all("p") if "lead" not in (p.get("class") or [])]
        # Filter out the badge caption (small muted text)
        body_ps = [
            p for p in ps
            if p.get("style") is None or "var(--muted)" not in (p.get("style") or "")
        ]
        if body_ps:
            overrides["who_we_are_paragraphs"] = [inner_html(p) for p in body_ps]
        # Capture the whole reveal block as fallback (eyebrow + h2 + paragraphs)
        head = reveal.select_one(".section-head") or reveal
        # The h2 + eyebrow often live directly in reveal (no .section-head wrapper)
        h2 = reveal.find("h2")
        if h2:
            overrides["who_we_are_h2"] = inner_html(h2)
        eb = reveal.select_one(".eyebrow")
        if eb:
            overrides["who_we_are_eyebrow"] = inner_html(eb)

    # ---- "Full Service" / "Installations & Upgrades" ----
    full_svc = find_section_by_h2(
        soup, "Everything Your Home Comfort", "High-Efficiency Heating", "Full Range"
    ) or find_section_by_eyebrow(soup, "Full Service", "Installations", "Our Services")
    if full_svc:
        head = full_svc.select_one(".section-head")
        if head:
            eb = head.select_one(".eyebrow")
            if eb:
                overrides["full_service_eyebrow"] = inner_html(eb)
            h2 = head.find("h2")
            if h2:
                overrides["full_service_h2"] = inner_html(h2)
            ps = head.find_all("p")
            if ps:
                overrides["full_service_intro"] = inner_html(ps[0])
        cards = full_svc.select(".svc-card")
        if cards:
            card_data = []
            for c in cards:
                h3 = c.find("h3")
                p = c.find("p")
                link = c.find("a", class_="svc-card__link")
                if h3 and p and link:
                    card_data.append({
                        "title": h3.decode_contents(),
                        "text": p.decode_contents(),
                        "url": link.get("href", ""),
                    })
            if card_data:
                overrides["home_service_cards"] = card_data

    # ---- "Our Process" / "How We Plan Your System Upgrade" ----
    process = find_section_by_eyebrow(soup, "Our Process", "How We Plan") or find_section_by_h2(
        soup, "Why Choose", "How We Plan", "What Every Customer"
    )
    if process:
        head = process.select_one(".section-head")
        if head:
            eb = head.select_one(".eyebrow")
            if eb:
                overrides["process_eyebrow"] = inner_html(eb)
            h2 = head.find("h2")
            if h2:
                overrides["process_h2"] = inner_html(h2)
            ps = head.find_all("p")
            if ps:
                overrides["process_intro"] = inner_html(ps[0])
        # Step boxes (3 of them) — extract h3 + p for each
        steps = process.select(".step")
        step_data = []
        for st in steps:
            h3 = st.find("h3")
            p = st.find("p")
            if h3 and p:
                step_data.append({"h3": h3.decode_contents(), "p": p.decode_contents()})
        if step_data:
            overrides["process_steps"] = step_data

    # ---- media-photo (technician) alt is bespoke per site ----
    media_photo = soup.select_one("img.media-photo")
    if media_photo:
        overrides["media_photo_alt"] = media_photo.get("alt", "")

    # ---- Reviews section ----
    rev_section = find_section_by_h2(soup, "Homeowners Are Saying", "What London", "Testimonials")
    if rev_section:
        head = rev_section.select_one(".section-head")
        if head:
            h2 = head.find("h2")
            if h2:
                overrides["reviews_h2"] = inner_html(h2)
            ps = head.find_all("p")
            if ps:
                overrides["reviews_intro"] = inner_html(ps[0])
        revs = rev_section.select(".review")
        rev_data = []
        for r in revs:
            p = r.find("p")
            by = r.select_one(".review__by")
            if p and by:
                text = p.decode_contents().strip()
                # Strip nested curly quotes (live HTML has them double-wrapped
                # from patch_wptext.py re-wrapping; reviewCard re-adds one pair).
                while True:
                    stripped = False
                    for left, right in [("&ldquo;", "&rdquo;"), ("\u201c", "\u201d")]:
                        if text.startswith(left) and text.endswith(right) and len(text) >= len(left) + len(right):
                            text = text[len(left):-len(right)].strip()
                            stripped = True
                            break
                    if not stripped:
                        break
                name_b = by.find("b")
                spans = by.find_all("span")
                place_span = spans[-1] if spans else None
                place = place_span.get_text() if place_span else ""
                if place.endswith(", ON"):
                    place = place[:-4].strip()
                rev_data.append({
                    "text": text,
                    "name": name_b.decode_contents() if name_b else "",
                    "place": place,
                })
        if rev_data:
            overrides["home_reviews"] = rev_data

    # ---- CTA band after reviews ----
    for band in soup.select(".cta-band"):
        h2 = band.find("h2")
        if h2 and "ready to improve your home comfort" in h2.get_text().lower():
            p = band.find("p")
            if p:
                overrides["home_cta_text"] = p.decode_contents()
            break

    # ---- wp-copy-preserve (extra WP-injected section) ----
    wp_section = soup.find(id="wp-copy-preserve")
    if wp_section:
        overrides["wp_preserve_section_html"] = str(wp_section)

    # ---- FAQs ----
    faq_section = find_section_by_h2(soup, "Frequently Asked Questions")
    if faq_section:
        head = faq_section.select_one(".section-head")
        if head:
            h2 = head.find("h2")
            if h2:
                overrides["faqs_h2"] = inner_html(h2)
            ps = head.find_all("p")
            if ps:
                overrides["faqs_intro"] = inner_html(ps[0])
        items = faq_section.select(".faq__item")
        faq_data = []
        for item in items:
            summary = item.find("summary", class_="faq__q")
            ans_p = item.select_one(".faq__a p")
            if summary and ans_p:
                q_text = "".join(
                    str(c) for c in summary.contents
                    if isinstance(c, NavigableString)
                ).strip()
                faq_data.append({"q": q_text, "a": ans_p.decode_contents()})
        if faq_data:
            overrides["home_faqs"] = faq_data

    return overrides


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: extract-home-overrides.py <domain> | --all")
        sys.exit(1)
    arg = sys.argv[1]
    domains = PILOTS if arg == "--all" else [arg]
    for d in domains:
        deploy_dir = NETWORK / d
        if not deploy_dir.exists():
            print(f"SKIP {d}: not checked out at {deploy_dir}")
            continue
        overrides = extract_home_overrides(deploy_dir)
        out_dir = ROOT / "src" / "sites" / d
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "home-overrides.json"
        out_path.write_text(json.dumps(overrides, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"OK  {d}: {len(overrides)} override keys -> {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
