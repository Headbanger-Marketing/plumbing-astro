#!/usr/bin/env python3
"""Make transparent footer twins of the white-background PNG logos.

For every logo in public/assets/img/logos/*.png whose border is opaque
near-white, flood-fills the white background to alpha (border-connected only,
so enclosed whites inside the mark survive), erodes 1px to kill the halo, and
writes public/assets/img/logos-trans/<same-name>.png (max 512px, footer
renders at 64px). Skips already-transparent, colored-badge, .bak, and .svg
files. Footer.astro prefers the logos-trans twin; the header, favicon, and
schema.org markup keep the white original untouched.

Usage (from a repo root, e.g. hvac-astro/):
  python3 scripts/make-logos-transparent.py [--force] [--dry-run]

Idempotent: existing twins are skipped unless --force. Exits 1 if any
converted file fails its navy-composite validation.
"""
from __future__ import annotations

import argparse
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

SRC_DIR = Path("public/assets/img/logos")
OUT_DIR = Path("public/assets/img/logos-trans")
NAVY = (15, 37, 68)  # --navy in styles.css; the footer the twin must sit on
WHITE_MIN = 140     # channel >= this counts as background (white/dirty white)
WHITE_SAT = 48      # max channel spread for a background pixel
FUZZ = 38           # per-channel distance from the ring's median bg color
TRIM = 3            # px shaved off each edge first: kills 1-2px frames
MAX_SIZE = 512
ERODE = ImageFilter.MinFilter(3)  # 1px alpha erosion: removes white fringe


def ring_base(im: Image.Image) -> tuple[int, int, int] | None:
    """Median color of the border ring, or None if it isn't a uniform
    near-white/gray opaque background (colored badges are left alone)."""
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    pts: list[tuple[int, int, int]] = []
    for x in range(0, w, max(1, w // 32)):
        for y in (0, h - 1):
            r, g, b, a = px[x, y]
            if a != 255 or min(r, g, b) < WHITE_MIN or max(r, g, b) - min(r, g, b) > WHITE_SAT:
                return None
            pts.append((r, g, b))
    for y in range(0, h, max(1, h // 32)):
        for x in (0, w - 1):
            r, g, b, a = px[x, y]
            if a != 255 or min(r, g, b) < WHITE_MIN or max(r, g, b) - min(r, g, b) > WHITE_SAT:
                return None
            pts.append((r, g, b))
    pts.sort()
    return pts[len(pts) // 2]


def flood_bg_to_alpha(im: Image.Image, base: tuple[int, int, int]) -> Image.Image:
    """Zero the alpha of background-colored pixels connected to the border ring."""
    im = im.copy()
    w, h = im.size
    px = im.load()
    br, bg_, bb = base
    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        i = y * w + x
        if seen[i]:
            return
        seen[i] = 1
        r, g, b, a = px[x, y]
        if (
            a != 0
            and min(r, g, b) >= WHITE_MIN
            and max(r, g, b) - min(r, g, b) <= WHITE_SAT
            and abs(r - br) <= FUZZ
            and abs(g - bg_) <= FUZZ
            and abs(b - bb) <= FUZZ
        ):
            px[x, y] = (r, g, b, 0)
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)
    while q:
        x, y = q.popleft()
        if x > 0:
            push(x - 1, y)
        if x < w - 1:
            push(x + 1, y)
        if y > 0:
            push(x, y - 1)
        if y < h - 1:
            push(x, y + 1)
    return im


def validate(twin_path: Path) -> bool:
    """Corner of the twin composited on navy must read back as navy."""
    im = Image.open(twin_path).convert("RGBA")
    bg = Image.new("RGBA", im.size, NAVY + (255,))
    bg.alpha_composite(im)
    px = bg.convert("RGB").load()
    w, h = bg.size
    for x, y in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]:
        r, g, b = px[x, y]
        if abs(r - NAVY[0]) > 4 or abs(g - NAVY[1]) > 4 or abs(b - NAVY[2]) > 4:
            return False
    return True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="rebuild existing twins")
    ap.add_argument("--dry-run", action="store_true", help="report only, write nothing")
    args = ap.parse_args()

    if not SRC_DIR.is_dir():
        print(f"no logo dir at {SRC_DIR} — run from a repo root", file=sys.stderr)
        return 2

    converted = skipped = failed = 0
    failures: list[str] = []
    for src in sorted(SRC_DIR.glob("*.png")):
        if ".bak." in src.name:
            continue
        out = OUT_DIR / src.name
        if out.exists() and not args.force:
            converted += 1
            continue
        im = Image.open(src)
        if min(im.size) <= 2 * TRIM + 8:
            skipped += 1
            continue
        im = im.crop((TRIM, TRIM, im.width - TRIM, im.height - TRIM)).convert("RGBA")
        base = ring_base(im)
        if base is None:
            skipped += 1
            continue
        if args.dry_run:
            print(f"would convert {src.name}")
            converted += 1
            continue

        if max(im.size) > MAX_SIZE:
            im = im.resize(
                (MAX_SIZE, round(im.height * MAX_SIZE / im.width))
                if im.width >= im.height
                else (round(im.width * MAX_SIZE / im.height), MAX_SIZE),
                Image.LANCZOS,
            )
        im = flood_bg_to_alpha(im, base)
        r, g, b, a = im.split()
        im = Image.merge("RGBA", (r, g, b, a.filter(ERODE)))

        OUT_DIR.mkdir(parents=True, exist_ok=True)
        im.save(out, optimize=True)
        if validate(out):
            converted += 1
        else:
            failed += 1
            failures.append(src.name)
            out.unlink(missing_ok=True)

    print(
        f"done: {converted} transparent twins in {OUT_DIR}, "
        f"{skipped} skipped (transparent/badge/svg), {failed} failed"
    )
    for name in failures:
        print(f"  FAILED: {name}", file=sys.stderr)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
