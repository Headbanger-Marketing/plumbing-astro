#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Deterministic QA sweep over all greenfield plumbing site sources.

Checks every src/sites/<domain>.ts + src/sites/<domain>/content.ts pair for:
  1. structure   - config fields present, noindex, url/domain match, phone digits
  2. services    - exactly the 7 plumbing SVC keys; HOME_SERVICES length 7;
                   HOME_FAQ 6-8; REVIEW_POOL 6; SVC_PHOTO all 7
  3. copy rules  - no em/en dashes, no raw ' & ' (must be &amp;), no wrong-trade
                   terms (hvac, furnace, air condition, duct, heating & cooling)
  4. cross-site  - pairwise 5-gram Jaccard similarity of SVC prose + HOME_FAQ
                   answers; flags near-duplicate copy between sites
  5. dist-dupe   - same Jaccard on RENDERED dist/ pages (home, about, contact,
                   privacy, thank-you, blog) with brand/city/county/service-area
                   tokens neutralized, so templated copy reads as duplicate the
                   way a crawler sees it. Content.ts checks never see template
                   fallbacks; this one does.
                   Defaults to WARN (templated pages are a known issue until
                   per-site variant work). With --launch-gate, >= 0.85 on any
                   rendered page is a hard failure (publish gate).

Exit 0 = clean (warnings allowed); exit 1 = hard failures.

Usage: python3 scripts/qa-sweep.py [--skip-dupes] [--skip-dist] [--launch-gate]
"""
import re
import sys
from collections import defaultdict
from itertools import combinations
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITES_DIR = ROOT / "src" / "sites"

SLUGS = {
    "water-heaters", "drain-cleaning", "repiping", "fixtures-toilets",
    "leak-detection", "sump-pumps", "water-softeners",
}
BANNED = [
    "hvac", "heating & cooling", "heating and cooling", "furnace",
    "air condition", "air-condition", "duct clean", "ductwork", "a/c",
    "indoor air",
]
EMDASH = re.compile("[–—]|&mdash;|&ndash;|&#8211;|&#8212;")

# Rendered pages checked by dist-dupe. Pages that render noindex at LAUNCH
# (page-level robots) are excluded: they never enter an index, so their
# shared copy is not a duplicate-content issue. That covers thank-you.astro
# (always) and the blog index while BLOG is empty — blog/index.astro flips
# robots to indexable when posts exist; re-add "blog" here at that point.
DIST_PAGES = ["", "about", "contact", "privacy-policy"]

fails = []
warns = []


def extract_block(text, key):
    """Raw text of the `key: { ... }` or `key = [ ... ]` value (exports included)."""
    m = re.search(rf"\b{key}\s*(?::|=)\s*(\{{|\[)", text)
    if not m:
        return None
    open_ch = m.group(1)
    close_ch = "}" if open_ch == "{" else "]"
    depth, i = 1, m.end()
    while i < len(text) and depth:
        if text[i] == open_ch:
            depth += 1
        elif text[i] == close_ch:
            depth -= 1
        i += 1
    return text[m.end():i - 1]


def strip_comments(text):
    return "\n".join(
        ln for ln in text.splitlines()
        if not ln.lstrip().startswith("//")
    )


def flat_strings(block):
    return [a or b for a, b in re.findall(
        r'"((?:[^"\\]|\\.)*)"' + r"|'((?:[^'\\]|\\.)*)'", block)]


def ngrams(text, n=5):
    toks = re.sub(r"[^a-z0-9 ]", " ", text.lower()).split()
    return {" ".join(toks[i:i + n]) for i in range(len(toks) - n + 1)}


def page_text(html):
    """Visible text of <main> (falls back to whole doc), tags stripped."""
    m = re.search(r"<main\b.*?</main>", html, re.S)
    body = m.group(0) if m else html
    body = re.sub(r"<(script|style|noscript|svg|template)\b.*?</\1>", " ", body, flags=re.S)
    txt = re.sub(r"<[^>]+>", " ", body)
    txt = txt.replace("&amp;", "&").replace("&#39;", "'").replace("&quot;", '"')
    return re.sub(r"\s+", " ", txt).strip()


def neutralize(text, toks):
    """Blank out brand/city/county/service-area/phone/domain tokens so
    templated copy with swapped cities reads as the duplicate it is."""
    brand, city, county, areas = toks
    for s in sorted({brand, city, county, "Ontario", *areas} - {""}, key=len, reverse=True):
        text = re.sub(re.escape(s), "«X»", text, flags=re.I)
    text = re.sub(r"\d[\d\-()/.\s]{6,}\d", "«N»", text)
    return re.sub(r"\b[\w.-]+\.ca\b", "«D»", text)


def dist_dupe(tokens_by_site, launch_gate):
    """Pairwise 5-gram Jaccard across RENDERED dist/ pages per page type.
    Summarized per page type (pair lists would be thousands of lines)."""
    by_ptype = defaultdict(dict)
    missing = []
    for dom, toks in tokens_by_site.items():
        root = ROOT / "dist" / dom
        if not root.is_dir():
            missing.append(dom)
            continue
        for rel in DIST_PAGES:
            f = root / rel / "index.html" if rel else root / "index.html"
            if not f.exists():
                continue
            html = f.read_text(encoding="utf-8", errors="replace")
            by_ptype[rel or "home"][dom] = ngrams(neutralize(page_text(html), toks))
    if missing:
        warns.append(f"dist-dupe: {len(missing)} site(s) have no dist/ output, skipped "
                     f"({missing[0]} …) — build with ./scripts/build-all.sh --no-sync")
    for ptype in sorted(by_ptype):
        sites = by_ptype[ptype]
        if len(sites) < 2:
            continue
        js = []
        for a, b in combinations(sorted(sites), 2):
            sa, sb = sites[a], sites[b]
            if sa and sb:
                js.append(len(sa & sb) / len(sa | sb))
        if not js:
            continue
        js.sort()
        hot = sum(1 for j in js if j > 0.30)
        near = js[-1] >= 0.85
        med = js[len(js) // 2]
        if near and launch_gate:
            fails.append(f"DIST-DUPE {ptype}: med {med:.2f}, max {js[-1]:.2f} — "
                         f"near-identical rendered page across sites (launch gate)")
        elif near or hot:
            warns.append(f"dist-dupe {ptype}: {hot}/{len(js)} pairs > 0.30 "
                         f"(med {med:.2f}, max {js[-1]:.2f}){' — HARD under --launch-gate' if near else ''}")


def main():
    skip_dupes = "--skip-dupes" in sys.argv
    skip_dist = "--skip-dist" in sys.argv
    launch_gate = "--launch-gate" in sys.argv
    domains = sorted(
        p.stem for p in SITES_DIR.glob("*.ts")
        if p.stem.endswith(".ca")
    )
    if not domains:
        fails.append("no site configs found")
        return report()

    fingerprints = {}
    dist_tokens = {}
    for dom in domains:
        tag = dom
        cfg = (SITES_DIR / f"{dom}.ts").read_text(encoding="utf-8")
        cnt_p = SITES_DIR / dom / "content.ts"
        if not cnt_p.exists():
            fails.append(f"{tag}: missing {dom}/content.ts")
            continue
        cnt = cnt_p.read_text(encoding="utf-8")

        # ---- config checks ----
        # noindex must be an EXPLICIT true|false: `true` pre-launch, `false`
        # once a site is intentionally launched — absent/typo'd still fails.
        if not re.search(r"noindex:\s*(true|false)\b", cfg):
            fails.append(f"{tag}: config missing explicit `noindex: true|false`")
        for needle in ("webhookUrl:", "serviceAreas:", "county:"):
            if needle not in cfg:
                fails.append(f"{tag}: config missing `{needle}`")
        if f'url: "https://{dom}"' not in cfg and f"url: 'https://{dom}'" not in cfg:
            fails.append(f"{tag}: url does not match domain")
        pm = re.search(r"display:\s*\"?\(?(\d{3})\)?[\s-]*(\d{3})-(\d{4})", cfg)
        pt = re.search(r"tel:\s*\"\+1(\d{10})\"", cfg)
        if pm and pt:
            digits = pm.group(1) + pm.group(2) + pm.group(3)
            if digits != pt.group(1):
                fails.append(f"{tag}: phone display/tel mismatch")
        else:
            fails.append(f"{tag}: phone display/tel not parseable")
        if re.search(r"\bvertical\b", cfg):
            warns.append(f"{tag}: sets vertical (should be unset for full site)")

        # ---- content structure ----
        svc = extract_block(cnt, "SVC")
        if svc is None:
            fails.append(f"{tag}: no SVC export")
            continue
        found = set(re.findall(r'"([a-z-]+)":\s*\{', svc))
        missing, extra = SLUGS - found, found - SLUGS
        if missing:
            fails.append(f"{tag}: SVC missing {sorted(missing)}")
        if extra:
            fails.append(f"{tag}: SVC unexpected {sorted(extra)}")
        for f_ in ("kicker", "h1", "intro", "meta", "problem_h", "problem_p", "features"):
            if f_ not in svc:
                fails.append(f"{tag}: SVC field `{f_}` absent somewhere")
        n_features = len(re.findall(r"\[\s*\"(?:[a-z-]+)\",", svc))
        if n_features != 21:
            fails.append(f"{tag}: SVC has {n_features} feature tuples (want 21 = 7x3)")

        hs = extract_block(cnt, "HOME_SERVICES")
        n_hs = len(re.findall(r"/services/[a-z-]+/", hs or ""))
        if n_hs != 7:
            fails.append(f"{tag}: HOME_SERVICES has {n_hs} service links (want 7)")

        rp = extract_block(cnt, "REVIEW_POOL")
        n_rp = len(re.findall(r"\[\s*\"", rp or ""))
        if n_rp != 6:
            fails.append(f"{tag}: REVIEW_POOL has {n_rp} entries (want 6)")

        hf = extract_block(cnt, "HOME_FAQ")
        n_hf = len(re.findall(r"\[\s*\"", hf or ""))
        if not 6 <= n_hf <= 8:
            fails.append(f"{tag}: HOME_FAQ has {n_hf} entries (want 6-8)")

        sp = extract_block(cnt, "SVC_PHOTO")
        sp_keys = set(re.findall(r'"([a-z-]+)":', sp or ""))
        if sp_keys != SLUGS:
            fails.append(f"{tag}: SVC_PHOTO keys differ: {sorted(sp_keys ^ SLUGS)}")
        # Imagery regime 2026-08-23: the shared default-technician.jpg is still
        # valid, and per-site stock (gen-imagery-unsplash.py) is now equally
        # valid — what must hold either way is that every referenced file
        # actually exists under public/assets/img/wp/.
        for src in set(re.findall(r'"(/assets/img/wp/[^"]+)"', sp or "")):
            if not (ROOT / "public" / src.lstrip("/")).exists():
                fails.append(f"{tag}: SVC_PHOTO src missing on disk: {src}")
        if not re.search(r"BLOG\s*(?::|=)\s*\[\s*\]", cnt):
            fails.append(f"{tag}: BLOG is not []")

        # ---- copy rules (comments stripped; webhook URL is legitimately 'hvac-sites') ----
        cfg_chk = strip_comments(cfg).replace(
            "https://auto.sdagents.ai/webhook/hvac-sites", "")
        cnt_chk = strip_comments(cnt)
        for label, text in (("config", cfg_chk), ("content", cnt_chk)):
            if EMDASH.search(text):
                fails.append(f"{tag}: em/en dash in {label}")
            if re.search(r"\s&\s", text.replace("&amp;", "")):
                fails.append(f"{tag}: raw ' & ' in {label}")
            low = text.lower()
            for term in BANNED:
                if term in low:
                    fails.append(f"{tag}: banned term `{term}` in {label}")
                    break

        city_m = re.search(r"city:\s*\"([^\"]+)\"", cfg)
        if city_m and city_m.group(1).lower() not in cnt.lower():
            fails.append(f"{tag}: city `{city_m.group(1)}` never mentioned in content")

        dist_tokens[dom] = (
            (re.search(r"brand:\s*\"([^\"]+)\"", cfg) or [None, ""])[1],
            city_m.group(1) if city_m else "",
            (re.search(r"county:\s*\"([^\"]+)\"", cfg) or [None, ""])[1],
            re.findall(r"'([A-Za-z][^']+)'",
                       "".join(re.findall(r"serviceAreas:\s*\[([^\]]*)\]", cfg))),
        )

        fingerprints[dom] = (
            ngrams(" ".join(flat_strings(svc))),
            ngrams(" ".join(flat_strings(hf or ""))),
        )

    # ---- pairwise similarity ----
    if not skip_dupes:
        for a, b in combinations(sorted(fingerprints), 2):
            ga, fa = fingerprints[a]
            gb, fb = fingerprints[b]
            for label, sa, sb in (("SVC prose", ga, gb), ("FAQ", fa, fb)):
                if not sa or not sb:
                    continue
                j = len(sa & sb) / len(sa | sb)
                if j > 0.30:
                    fails.append(f"DUPE {a} vs {b}: {label} Jaccard {j:.2f} > 0.30")
                elif j > 0.18:
                    warns.append(f"dupe-ish {a} vs {b}: {label} Jaccard {j:.2f}")

    # ---- rendered-dist duplicate check ----
    if not skip_dist:
        dist_dupe(dist_tokens, launch_gate)

    return report()


def report():
    for w in warns:
        print(f"[warn] {w}")
    if fails:
        for f_ in fails:
            print(f"[FAIL] {f_}")
        print(f"\nqa-sweep: {len(fails)} hard failure(s), {len(warns)} warning(s)")
        sys.exit(1)
    print(f"\nqa-sweep: CLEAN ({len(warns)} warning(s))")
    sys.exit(0)


if __name__ == "__main__":
    main()
