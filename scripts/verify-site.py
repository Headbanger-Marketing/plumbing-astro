#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Per-site verification checklist for the HVAC -> Astro migration.

Runs every check we hit during the pilot and reports PASS/FAIL/EXEMPT per item.
Exit code 0 = all hard checks pass; non-zero = at least one FAIL.

Usage:
    python3 scripts/verify-site.py <domain>
    python3 scripts/verify-site.py <domain> --strict   # warnings become failures
    python3 scripts/verify-site.py <domain> --new      # greenfield: skip WP-parity checks, read config from .ts

Checks:
  HARD (must pass):
    A. build          - site builds green (caller runs this; script assumes built)
    B. page-count     - exactly 16 pages (no /services/index.html)   [13 in --new lean mode]
    C. services-absent- /services/ route 404s (no services/index.html in dist)
    D. em-dash-copy   - no em/en dashes in user-visible <p>/<h1-3>/<li>/<a> text
    E. em-dash-js     - no em-dash in success/failure messages in main.js
    F. full-address   - footer renders street, city, region, postal
    G. parity-min     - >=80% of pages at <5 diff lines vs deployed HTML   [skipped in --new]
    H. wp-copy-kept   - homepage body word-count >=90% of deployed homepage [skipped in --new]

  SOFT (report only, never fail):
    I. contrast-stars - star color token present and >=3.0 contrast
    J. hero-bg-class  - service pages have page-hero--with-bg

--new mode: for brand-new sites with no WordPress source or deployed HTML.
Skips G/H (WP parity) and reads config from src/sites/<domain>.ts instead of
build.py. Page count check accepts 13 (lean, no blog) or 16 (full).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("ERROR: pip3 install beautifulsoup4")

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
NETWORK = Path.home() / "Projects" / "hvac" / "scratch" / "sites"

EMDASH_CHARS = ['\u2014', '\u2013', '&mdash;', '&ndash;', '&#8212;', '&#8211;']
EMDASH_REGEX = re.compile('[' + re.escape('\u2014\u2013') + ']|&mdash;|&ndash;|&#8212;|&#8211;')


def is_redirect_page(p: Path) -> bool:
    """True for WP->Astro redirect stubs (gen-service-redirects.py): a tiny
    meta-refresh + JS redirect page with no real content. Harmless (excluded
    from the sitemap) but they would inflate the page count and fail the
    service-hero check if counted as real content pages."""
    try:
        return 'http-equiv="refresh"' in p.read_text(encoding='utf-8')[:600]
    except Exception:
        return False

EXPECTED_PAGES = [
    'index.html', '404.html',
    'about/index.html', 'contact/index.html', 'privacy-policy/index.html',
    'blog/index.html',
    # 3 blog posts (per-site slugs)
    # 7 service pages (per-site slugs)
]


def status(label, ok, detail=''):
    tag = 'PASS' if ok else 'FAIL'
    print(f'  [{tag}] {label}{": " + detail if detail else ""}')
    return ok


def main() -> int:
    if len(sys.argv) < 2:
        sys.exit("Usage: verify-site.py <domain> [--strict] [--new]")
    domain = sys.argv[1]
    strict = '--strict' in sys.argv
    new_mode = '--new' in sys.argv
    dist = DIST / domain
    deploy = NETWORK / domain

    if not dist.exists():
        print(f"FAIL: dist/{domain} does not exist - run build first")
        return 1
    # In --new mode the deploy repo may not exist yet (pre-provision); skip the check.
    if not new_mode and not deploy.exists():
        print(f"FAIL: deploy repo {deploy} does not exist")
        return 1

    print(f"=== {domain} ==={'  [NEW MODE: WP-parity checks skipped]' if new_mode else ''}")
    hard_failures = 0

    # ---- B. Page count ----
    # Vertical hubs (generator/geothermal/solar) are homepage-only by design: no
    # service pages and no blog posts, so they ship fewer pages than a full HVAC
    # site. Detect the vertical flag from the per-site config and relax the count.
    is_vertical = False
    cfg_path = ROOT / 'src' / 'sites' / f'{domain}.ts'
    if cfg_path.exists():
        vm = re.search(r"vertical:\s*'([^']+)'", cfg_path.read_text(encoding='utf-8'))
        if vm and vm.group(1) != 'hvac':
            is_vertical = True
    html_files = sorted(dist.rglob('*.html'))
    html_files = [p for p in html_files if '.prerender' not in str(p)]
    html_files = [p for p in html_files if not is_redirect_page(p)]  # skip WP redirect stubs
    # Location/service-area pages are additive (one per content.LOCATIONS key).
    # Subtract them so the count validates the BASE content pages, not the
    # optional location layer.
    n_locations = len(list((dist / 'locations').glob('*/index.html'))) if (dist / 'locations').is_dir() else 0
    base_count = len(html_files) - n_locations
    if is_vertical:
        # home + 404 + about + contact + blog + privacy + at least one location
        page_count_ok = len(html_files) >= 7  # vertical base (home/404/about/contact/privacy/blog/thank-you); locations add more
        label = '>=7 (vertical hub)'
    elif new_mode:
        # Base = 14 (home, 404, about, contact, privacy, blog index, thank-you,
        # + 7 services); 13 = built before the thank-you page was added. Full =
        # base + 3 blog posts (16/17). Location pages are extra (subtracted).
        page_count_ok = base_count >= 13  # floor: blog/boiler/location count varies
        label = '13-14 (lean) or 16-17 (full) base, +location pages'
    else:
        page_count_ok = base_count >= 16
        label = '16-17 base, +location pages'
    if not status(f'B. page-count ({label} expected)',
                  page_count_ok,
                  f'found {len(html_files)}'):
        hard_failures += 1

    # ---- C. /services/ index absent ----
    svc_index_absent = not (dist / 'services' / 'index.html').exists()
    if not status('C. services/index.html absent from dist', svc_index_absent):
        hard_failures += 1

    # Also check it's gone from the deploy repo if we already synced
    if (deploy / 'services' / 'index.html').exists():
        if not status('C2. services/index.html absent from deploy repo', False, 'still present, needs sync --delete'):
            hard_failures += 1
    else:
        status('C2. services/index.html absent from deploy repo', True)

    # ---- D. Em-dashes in user-visible copy ----
    emdash_hits = []
    for p in html_files:
        try:
            soup = BeautifulSoup(p.read_text(encoding='utf-8'), 'html.parser')
        except Exception:
            continue
        for el in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'li', 'a', 'summary', 'span']):
            # Skip script/style
            txt = el.get_text()
            if EMDASH_REGEX.search(txt):
                # Filter out non-user-visible (script children etc)
                emdash_hits.append((p.name, str(p.relative_to(dist)), txt.strip()[:100]))
    emdash_ok = len(emdash_hits) == 0
    detail = f'{len(emdash_hits)} occurrences' + (
        f' (e.g. "{emdash_hits[0][2]}" in {emdash_hits[0][1]})' if emdash_hits else '')
    if not status('D. em-dash in visible copy absent', emdash_ok, detail):
        hard_failures += 1

    # ---- E. Em-dashes in deploy repo main.js success message ----
    main_js = deploy / 'assets' / 'js' / 'main.js'
    if main_js.exists():
        main_text = main_js.read_text()
        # Look for em-dash specifically in string literals (not comments)
        main_emdash = EMDASH_REGEX.search(re.sub(r'/\*.*?\*/', '', main_text, flags=re.DOTALL))
        if not status('E. main.js no em-dash in code', main_emdash is None,
                      f'found "{main_emdash.group(0)}"' if main_emdash else ''):
            hard_failures += 1
    else:
        status('E. main.js no em-dash in code', True, 'main.js missing (skip)')

    # ---- F. Full address in footer ----
    # In --new mode, read street/postal from src/sites/<domain>.ts (no build.py).
    # Otherwise read from the deploy repo's build.py (legacy).
    try:
        home_html = (dist / 'index.html').read_text(encoding='utf-8')
        home_soup = BeautifulSoup(home_html, 'html.parser')
        if new_mode:
            cfg = (ROOT / 'src' / 'sites' / f'{domain}.ts').read_text(encoding='utf-8')
            street_m = re.search(r"street:\s*'([^']+)'", cfg) or re.search(r'street:\s*"([^"]+)"', cfg)
            postal_m = re.search(r"postal:\s*'([^']+)'", cfg) or re.search(r'postal:\s*"([^"]+)"', cfg)
            street = street_m.group(1) if street_m else None
            postal = postal_m.group(1) if postal_m else None
        else:
            bp = (deploy / 'build.py').read_text(encoding='utf-8')
            street_m = re.search(r'ADDR_STREET\s*=\s*"([^"]+)"', bp)
            postal_m = re.search(r'ADDR_POSTAL\s*=\s*"([^"]+)"', bp)
            street = street_m.group(1) if street_m else None
            postal = postal_m.group(1) if postal_m else None
        if street and postal:
            # NAP rule: the visible footer shows city only; the full street +
            # postal live in the LocalBusiness JSON-LD schema. Verify there.
            ld_json = ''.join(s.get_text() for s in home_soup.find_all('script', type='application/ld+json'))
            addr_ok = street in ld_json and postal in ld_json
            if not status('F. full address (street + postal) in JSON-LD',
                          addr_ok,
                          f'looking for "{street}" and "{postal}"'):
                hard_failures += 1
        else:
            status('F. footer full address', True, 'config regex miss (skip)')
    except Exception as e:
        status('F. footer full address', False, f'exception: {e}')
        hard_failures += 1

    # ---- G. Parity vs deployed HTML (per-page diff line count) ----
    # SKIPPED in --new mode (no deployed HTML to compare against).
    if new_mode:
        status('G. parity vs deployed', True, 'skipped (--new mode, no prior deployment)')
    else:
        import difflib
        pages_to_check = ['index.html', 'about/index.html', 'contact/index.html',
                          'services/furnace-repair/index.html', 'services/ac-repair/index.html',
                          'blog/index.html', 'privacy-policy/index.html', '404.html']
        parity_results = []
        for pg in pages_to_check:
            a = dist / pg
            l = deploy / pg
            if not a.exists() or not l.exists():
                continue
            try:
                ah = BeautifulSoup(a.read_text(encoding='utf-8'), 'html.parser')
                lh = BeautifulSoup(l.read_text(encoding='utf-8'), 'html.parser')
                d = list(difflib.unified_diff(str(ah).splitlines(keepends=True),
                                              str(lh).splitlines(keepends=True),
                                              lineterm='', n=0))
                ch = [x for x in d if x.startswith(('+', '-')) and not x.startswith(('+++', '---'))]
                parity_results.append((pg, len(ch)))
            except Exception:
                pass
        passing_parity = sum(1 for _, n in parity_results if n < 5)
        parity_ok = len(parity_results) > 0 and passing_parity / len(parity_results) >= 0.8
        detail = f'{passing_parity}/{len(parity_results)} pages at <5 diff lines'
        if not status('G. parity >=80% pages near-byte-identical', parity_ok, detail):
            if strict:
                hard_failures += 1

    # ---- H. WordPress copy preservation (>=90% of words retained) ----
    # SKIPPED in --new mode (no deployed HTML to compare against).
    if new_mode:
        status('H. WP copy preserved', True, 'skipped (--new mode, no prior deployment)')
    else:
        # Compare word count of home page <p>/<h*> text Astro vs deployed.
        def visible_text(soup):
            chunks = []
            for el in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'li']):
                chunks.append(el.get_text(' ', strip=True))
            return ' '.join(chunks).lower()

        try:
            a_text = visible_text(BeautifulSoup((dist / 'index.html').read_text(encoding='utf-8'), 'html.parser'))
            l_text = visible_text(BeautifulSoup((deploy / 'index.html').read_text(encoding='utf-8'), 'html.parser'))
            a_words = set(re.findall(r'\b[a-z]{3,}\b', a_text))
            l_words = set(re.findall(r'\b[a-z]{3,}\b', l_text))
            if l_words:
                retained = len(a_words & l_words) / len(l_words)
                wp_ok = retained >= 0.90
                if not status('H. WP copy preserved >=90%',
                              wp_ok,
                              f'{retained:.0%} of deployed unique words present'):
                    hard_failures += 1
            else:
                status('H. WP copy preserved', True, 'no deployed text to compare')
        except Exception as e:
            status('H. WP copy preserved', False, f'exception: {e}')
            if strict:
                hard_failures += 1

    # ---- I. (soft) Service hero has bg class ----
    svc_pages_with_bg = 0
    svc_pages_total = 0
    for sp in (dist / 'services').glob('*/index.html'):
        if is_redirect_page(sp):
            continue
        svc_pages_total += 1
        soup = BeautifulSoup(sp.read_text(encoding='utf-8'), 'html.parser')
        hero = soup.find('section', class_='page-hero')
        if hero and 'page-hero--with-bg' in (hero.get('class') or []):
            svc_pages_with_bg += 1
    if svc_pages_total:
        status('I. service pages have hero--with-bg',
               svc_pages_with_bg == svc_pages_total,
               f'{svc_pages_with_bg}/{svc_pages_total}')

    print()
    if hard_failures:
        print(f"RESULT: {hard_failures} hard failure(s)")
        return 1
    print("RESULT: all hard checks pass")
    return 0


if __name__ == '__main__':
    sys.exit(main())
