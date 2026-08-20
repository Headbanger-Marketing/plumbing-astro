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

Exit 0 = clean (warnings allowed); exit 1 = hard failures.

Usage: python3 scripts/qa-sweep.py [--skip-dupes]
"""
import re
import sys
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
]
EMDASH = re.compile("[–—]|&mdash;|&ndash;|&#8211;|&#8212;")

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


def main():
    skip_dupes = "--skip-dupes" in sys.argv
    domains = sorted(
        p.stem for p in SITES_DIR.glob("*.ts")
        if p.stem.endswith(".ca")
    )
    if not domains:
        fails.append("no site configs found")
        return report()

    fingerprints = {}
    for dom in domains:
        tag = dom
        cfg = (SITES_DIR / f"{dom}.ts").read_text(encoding="utf-8")
        cnt_p = SITES_DIR / dom / "content.ts"
        if not cnt_p.exists():
            fails.append(f"{tag}: missing {dom}/content.ts")
            continue
        cnt = cnt_p.read_text(encoding="utf-8")

        # ---- config checks ----
        for needle in ("noindex: true", "webhookUrl:", "serviceAreas:", "county:"):
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
        if "default-technician.jpg" not in (sp or ""):
            fails.append(f"{tag}: SVC_PHOTO not using default-technician.jpg")
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
