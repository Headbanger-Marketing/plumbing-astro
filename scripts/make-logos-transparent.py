#!/usr/bin/env python3
"""Make the solid background of each logo PNG transparent.

Each per-site logo in public/assets/img/logos/ is an opaque RGBA PNG whose
background is a near-uniform off-white. We flood-fill that background to
fully transparent, starting from the four corners, with a permissive RGB
tolerance so anti-aliased halo pixels around the mark are caught too.

Originals are kept as <name>.bak.png alongside the converted file so the
change is reversible. Re-running is idempotent (skips files that already
have transparent corners).
"""
from PIL import Image, ImageDraw
import os, glob

DIR = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "img", "logos")
TOL = 38  # per-channel RGB tolerance band around the sampled background


def corner_is_transparent(px, w, h):
    for (x, y) in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if px[x, y][3] != 0:
            return False
    return True


def bg_color(px, w, h):
    # sample the average of the four corners
    samples = [px[x, y] for (x, y) in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]]
    r = sum(s[0] for s in samples) // 4
    g = sum(s[1] for s in samples) // 4
    b = sum(s[2] for s in samples) // 4
    return (r, g, b)


def make_transparent(path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    if corner_is_transparent(px, w, h):
        return f"skip (already transparent)"
    bg = bg_color(px, w, h)

    # BFS flood-fill from every border pixel whose colour is within tolerance
    # of the sampled background. Marks hit pixels transparent.
    visited = bytearray(w * h)
    stack = []
    for x in range(w):
        for y in (0, h - 1):
            stack.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            stack.append((x, y))

    def near_bg(c):
        return (abs(c[0] - bg[0]) <= TOL and
                abs(c[1] - bg[1]) <= TOL and
                abs(c[2] - bg[2]) <= TOL)

    cleared = 0
    while stack:
        x, y = stack.pop()
        i = y * w + x
        if visited[i]:
            continue
        visited[i] = 1
        c = px[x, y]
        if c[3] == 0 or not near_bg(c):
            continue
        px[x, y] = (c[0], c[1], c[2], 0)
        cleared += 1
        if x > 0:
            stack.append((x - 1, y))
        if x < w - 1:
            stack.append((x + 1, y))
        if y > 0:
            stack.append((x, y - 1))
        if y < h - 1:
            stack.append((x, y + 1))

    # backup original, then save the converted image
    bak = path.replace(".png", ".bak.png")
    if not os.path.exists(bak):
        Image.open(path).save(bak)
    im.save(path)
    return f"cleared {cleared} px (bg ~{bg})"


def main():
    for f in sorted(glob.glob(os.path.join(DIR, "*.png"))):
        if f.endswith(".bak.png"):
            continue
        print(f"{os.path.basename(f):40s} {make_transparent(f)}")


if __name__ == "__main__":
    main()
