#!/usr/bin/env python3
"""Generate a per-site guarantee-badge variant for every site.

dupe-audit follow-up: every homepage trust strip ships the same
/assets/img/wp/quality-guarantee.png (gold "PREMIUM QUALITY 100% GUARANTEED"
seal) — the last md5-shared image referenced network-wide. Same treatment as
gen-logo-variants.py: hue-rotate the gold ring to a per-site seal colourway
(deterministic from the domain; blacks/whites untouched), keep native 320px.

Also rewrites src/sites/*.ts to carry media.guaranteeBadge (existing logo /
technicianPhoto keys survive). Idempotent: re-running regenerates the same
variants and leaves already-correct configs alone.
"""
from PIL import Image
import glob
import hashlib
import os
import re
import sys

import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..")
SITES_DIR = os.path.join(ROOT, "src", "sites")
WP_DIR = os.path.join(ROOT, "public", "assets", "img", "wp")
BASE = os.path.join(WP_DIR, "quality-guarantee.png")

# Seal-appropriate targets (degrees): keeps some golds (jittered) so the badge
# family still reads "premium seal", rotates the rest to trust colours.
HUES = [
    38, 46, 52,          # gold family
    4, 350,              # deep red / crimson
    142, 152,            # forest / emerald
    176, 186,            # teal
    214, 224,            # navy / royal
    262, 272,            # violet / plum
    196, 206,            # steel blues
    332, 340,            # burgundy
    62, 68,              # olive golds
]

# Dominant hue of the base badge's gold ring — measured once, hardcoded.
BASE_DOMINANT_HUE = 46.4


def md5int(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)


def rgb_to_hsv(arr):
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mx = arr.max(-1)
    mn = arr.min(-1)
    diff = np.maximum(mx - mn, 1e-9)
    rc = (mx - r) / diff
    gc = (mx - g) / diff
    bc = (mx - b) / diff
    h = np.select([mx == r, mx == g], [bc - gc, 2.0 + rc - bc], default=4.0 + gc - rc)
    h = (h / 6.0) % 1.0
    s = np.where(mx > 0, diff / np.maximum(mx, 1e-9), 0)
    return h, s, mx


def hsv_to_rgb(h, s, v):
    i = np.floor(h * 6.0)
    f = h * 6.0 - i
    p = v * (1 - s)
    q = v * (1 - s * f)
    t = v * (1 - s * (1 - f))
    i = i.astype(int) % 6
    r = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [v, q, p, p, t, v])
    g = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [t, v, v, q, p, p])
    b = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [p, p, t, v, v, q])
    return np.stack([r, g, b], -1)


def make_variant(out_path, target_hue, sat_mult):
    im = np.asarray(Image.open(BASE).convert("RGBA")).astype(np.float32) / 255.0
    rgb, alpha = im[..., :3], im[..., 3]
    h, s, v = rgb_to_hsv(rgb)
    shift = (target_hue - BASE_DOMINANT_HUE) / 360.0
    h = (h + shift) % 1.0
    s = np.clip(s * sat_mult, 0, 1)
    out = hsv_to_rgb(h, s, v)
    out = np.dstack([out, alpha])
    Image.fromarray((out * 255).round().astype(np.uint8), "RGBA").save(out_path, optimize=True)


def main():
    if not os.path.exists(BASE):
        sys.exit(f"FATAL: base badge missing: {BASE}")
    rows = []
    for ts in sorted(glob.glob(os.path.join(SITES_DIR, "*.ts"))):
        domain = os.path.basename(ts)[:-3]
        rows.append((domain, ts))
    changed = 0
    for i, (dom, ts) in enumerate(rows):
        fname = f"guarantee-{dom}.png"
        # Existing output wins: cross-estate dedupe (media-audit 2026-08-23
        # cross_dedupe_badges.py) may have re-rolled bytes this repo's own math
        # would clobber. Regenerate only when the file is missing.
        if not os.path.exists(os.path.join(WP_DIR, fname)):
            k = md5int(dom)
            hue = HUES[(i * 7 + k) % len(HUES)] + (k % 9) - 4
            sat = 0.95 + ((k >> 6) % 4) * 0.04
            make_variant(os.path.join(WP_DIR, fname), hue, sat)
        text = open(ts).read()
        if f'guaranteeBadge: "{fname}"' in text:
            continue
        if re.search(r'guaranteeBadge:\s*"[^"]+"', text):
            new = re.sub(r'guaranteeBadge:\s*"[^"]+"', f'guaranteeBadge: "{fname}"', text)
        elif re.search(r"media:\s*\{", text):
            new = re.sub(r"media:\s*\{\s*", f'media: {{ guaranteeBadge: "{fname}", ', text, count=1)
        else:
            print(f"[{dom}] WARN: no media block to hang guaranteeBadge on")
            continue
        open(ts, "w").write(new)
        changed += 1

    # Byte-level dedupe: nearby target hues can quantize to identical output.
    # Deterministically nudge duplicates (sorted order keeps the first of each
    # hash group) until every badge file is byte-unique.
    def path_for(dom):
        return os.path.join(WP_DIR, f"guarantee-{dom}.png")

    idx = {dom: i for i, (dom, _) in enumerate(rows)}

    def hue_for(dom, attempt):
        k = md5int(dom)
        return (HUES[(idx[dom] * 7 + k) % len(HUES)] + (k % 9) - 4
                + 11 * attempt) % 360

    attempt = {dom: 0 for dom, _ in rows}
    nudged = 0
    while True:
        seen = {}
        dups = []
        for dom, _ in rows:
            hsh = hashlib.md5(open(path_for(dom), "rb").read()).hexdigest()
            if hsh in seen:
                dups.append(dom)
            else:
                seen[hsh] = dom
        if not dups:
            break
        for dom in dups:
            attempt[dom] += 1
            k = md5int(dom)
            make_variant(path_for(dom), hue_for(dom, attempt[dom]),
                         0.95 + ((k >> 6) % 4) * 0.04)
            nudged += 1
    print(f"{len(rows)} badges generated | {changed} configs rewritten"
          f" | {nudged} nudged for byte-uniqueness")


if __name__ == "__main__":
    main()
