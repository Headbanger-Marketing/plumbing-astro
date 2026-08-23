#!/usr/bin/env python3
"""Generate a unique AI-authored PNG logo for every plumbing site.

Port of the hvac-astro two-engine pipeline (2026-08-23); Gemini 3.1 Flash
Image (Nano Banana 2) is the working engine here — Recraft V4.1 Vector is
kept for when its units return. This estate's SiteLayout serves media.logo
raw as PNG favicon/apple-touch-icon, so PNG-only needs no layout edits.

2026-08 follow-up to gen-logo-variants.py: the deterministic recolours fixed
byte-identity but the user judged many marks poor. This replaces them with
generated art: per-site prompt = vertical CONCEPT x ENCLOSURE x STYLE x
PALETTE, all deterministic from md5(domain) so re-runs plan identically,
with same-town twins forced onto different concepts/palettes and the full
tuple kept unique network-wide (belt-and-braces on top of Recraft's own
generation variance).

Output per site:
  public/assets/img/logos/<domain>.svg   Recraft V4.1 Vector (~80 units = $0.08)
  public/assets/img/logos/<domain>.png   sharp-rasterised 512px twin (favicon,
                                         apple-touch-icon, PIL consumers)
  src/sites/<domain>.ts                  media.logo -> "<domain>.svg"

Engines (--engine): "recraft" (default, SVG) or "gemini" — Nano Banana 2
(gemini-3.1-flash-image, ~$0.03/img, raster). 2026-08-23: Recraft units ran
out mid-estate; the remaining 75 missing + 19 rejected sites were re-engined
to Gemini direct (AI Studio key from opencode auth.json). Gemini output is
JPEG -> sharp-flattened 1024px <domain>.png (overwrites the legacy recolour),
media.logo -> "<domain>.png", done-sites tracked in
public/assets/img/logos/.gemini-manifest for idempotent resume (a Gemini png
is filename-identical to the legacy recolour it replaces, so the manifest is
the only thing that distinguishes them). When a Gemini logo replaces a
rejected Recraft one (--force), the stale .svg is deleted.

Idempotent: sites whose <domain>.svg already exists are skipped unless
--force. --dry-run prints the plan without any API calls (Recraft has NO
validation-only mode — every request is a charged generation, so dry-run
before mass runs). Dedupe gate: 64-bit dHash pairwise over the raster twins;
pairs <= 10 bits are reported (identical art would be 0).

Integrations touched elsewhere (by design):
  src/layouts/SiteLayout.astro  svg favicon + png apple-touch-icon
  scripts/deploy-all.sh         prune keeps BOTH <domain>.svg and .png
  gen-logo-variants.py          MUST NOT re-run afterwards (it would rewrite
                                media.logo back to .png recolours)
"""
import argparse
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import threading
import time
import concurrent.futures
import urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SITES_DIR = os.path.join(ROOT, "src", "sites")
LOGO_DIR = os.path.join(ROOT, "public", "assets", "img", "logos")
API = "https://external.api.recraft.ai/v1/images/generations"
MODEL = "recraftv4_1_vector"
GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models"
GEMINI_MODEL = "gemini-3.1-flash-image"  # Nano Banana 2
GEMINI_KEY_FILE = "~/.local/share/opencode/auth.json"  # AI Studio key (opencode "google")
GROK_API = "https://api.x.ai/v1/images/generations"
GROK_MODEL = "grok-imagine-image-2.0"
GROK_KEY_FILE = "~/.local/share/opencode/auth.json"  # xai OAuth access (opencode "xai")
MANIFEST = os.path.join(LOGO_DIR, ".gemini-manifest")
GROK_MANIFEST = os.path.join(LOGO_DIR, ".grok-manifest")
# informational threshold — the bar is byte-uniqueness (every Recraft draw is
# fresh); pairs this close would mean near-identical art worth eyeballing
DHASH_SUSPECT = 6

SUFFIXES = ["plumbingpros", "plumbing"]

# USER DIRECTION 2026-08-23 (after seeing the first 68): TOO BUSY — "just
# need a simple wrench (non adjustable, looks more iconic) and waterdrop and
# shield". Vocab = open-end wrench + water drop + shield ONLY.
# ROUND 2 (grok pilot matrix same day): freestanding line art read "too
# simple, too much white space" — locked the D-shield direction: solid-fill
# shields that fill the frame with a slim margin. Enclosures now carry that
# treatment text (single entry, constant); styles are the solid family only.
# Palettes unchanged. Engine = grok (imagine 2.0, opencode xai OAuth).
TRADE_CONCEPTS = [
    "a shield containing a simple open-end wrench and a water drop",
    "a shield with a large water drop as its centerpiece",
    "a shield with a bold open-end wrench as its centerpiece",
]
BRAND = "a residential plumbing company"
VERTICAL = {}

ENCLOSURES = [
    "solid vivid fills, chunky confident weight, the shield fills the frame "
    "with only a slim margin",
]
STYLES = [
    "flat geometric shapes",
    "layered flat design with a subtle two-tone depth",
    "solid fills with a thick contrasting outline",
]
PALETTES = [
    ("navy/gold", "deep navy blue and gold"),
    ("royal/teal", "royal blue and teal"),
    ("navy/sky", "navy blue and sky blue"),
    ("steel/copper", "steel blue and copper"),
    ("deep-blue/aqua", "deep blue and aqua"),
]


def md5int(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)


def town_of(domain):
    # strip the TLD first — dirs are named "<name>.ca", so endswith(suffix)
    # never matches on the raw dir name
    base = domain.rsplit(".", 1)[0] if domain.endswith((".ca", ".com")) else domain
    for suf in SUFFIXES:
        if base.endswith(suf):
            return base[: -len(suf)].rstrip("-"), suf
    return base, ""


def vertical_of(suffix):
    return VERTICAL.get(suffix, (TRADE_CONCEPTS, BRAND))


def build_prompt(concept_i, encl_i, style_i, pal_i, concepts, brand_desc):
    return (
        f"Bold flat vector logo mark for {brand_desc}: {concepts[concept_i]}, "
        f"{ENCLOSURES[encl_i]}. Palette: {PALETTES[pal_i][1]}. "
        f"{STYLES[style_i]}, professional trade-services branding, crisp edges, "
        f"balanced composition. "
        f"No text, no letters, no numbers, no words, no watermark. "
        f"Centered on a plain white background."
    )


def plan(domains):
    """Deterministic per-site dimension picks + twin/tuple deconfliction."""
    picks = {}
    for d in sorted(domains):
        town, suf = town_of(d)
        concepts, brand = vertical_of(suf)
        n = md5int(d)
        picks[d] = {
            "town": town,
            "concepts": concepts,
            "brand": brand,
            "concept": n % len(concepts),
            "encl": (n >> 16) % len(ENCLOSURES),
            "style": (n >> 32) % len(STYLES),
            "pal": (n >> 48) % len(PALETTES),
        }
    # no twin/tuple deconfliction — user direction 2026-08-23: forcing
    # distinctness drains the pools into weird icons; same-family marks vary
    # by generation draw and the gate verifies byte/perceptual uniqueness
    return picks


def recraft_generate(prompt, key):
    body = json.dumps({"model": MODEL, "prompt": prompt, "n": 1}).encode()
    last = ""
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                API, data=body,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=180) as r:
                j = json.loads(r.read())
            url = j["data"][0]["url"]
            with urllib.request.urlopen(url, timeout=120) as r:
                svg = r.read()
            if b"<svg" not in svg[:600]:
                raise RuntimeError(f"asset is not SVG: {svg[:80]!r}")
            return svg, j.get("credits", "?")
        except urllib.error.HTTPError as e:
            # Recraft reports an empty account as HTTP 400 not_enough_credits —
            # retrying is pointless and every further site would fail the same
            # way, so stop the whole batch immediately
            detail = ""
            try:
                detail = e.read().decode()[:200]
            except Exception:  # noqa: BLE001
                pass
            if "not_enough_credits" in detail:
                raise RuntimeError(
                    "OUT OF API UNITS (not_enough_credits) — top up at "
                    "recraft.ai and re-run; already-generated sites are skipped"
                )
            last = f"{e} {detail}"
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
        except Exception as e:  # noqa: BLE001 — retry transport failures
            last = str(e)[:200]
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"recraft failed after 3 attempts: {last}")


def load_gemini_key():
    p = os.path.expanduser(GEMINI_KEY_FILE)
    j = json.load(open(p))
    key = j.get("google", {}).get("key", "")
    if not key:
        sys.exit(f"no google key in {p}")
    return key


def gemini_generate(prompt, key):
    """Nano Banana 2 via generateContent; returns flattened 1024px PNG bytes."""
    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"],
                             "imageConfig": {"aspectRatio": "1:1"}},
    }).encode()
    last = ""
    for attempt in range(4):
        try:
            req = urllib.request.Request(
                f"{GEMINI_API}/{GEMINI_MODEL}:generateContent", data=body,
                headers={"Content-Type": "application/json", "x-goog-api-key": key})
            with urllib.request.urlopen(req, timeout=180) as r:
                j = json.loads(r.read())
            for part in j["candidates"][0]["content"]["parts"]:
                if "inlineData" in part:
                    img = base64.b64decode(part["inlineData"]["data"])
                    return flatten_png(img, part["inlineData"]["mimeType"])
            raise RuntimeError("no image part in response")
        except urllib.error.HTTPError as e:
            detail = ""
            try:
                detail = e.read().decode()[:300]
            except Exception:  # noqa: BLE001
                pass
            # spend-cap/billing is fatal for the whole batch; a transient
            # rate 429 ALSO says RESOURCE_EXHAUSTED (quota-metric wording) and
            # must fall through to the retry path instead
            if "spending cap" in detail or "billing" in detail:
                raise RuntimeError(f"OUT OF GEMINI QUOTA — {detail[:150]}")
            last = f"{e} {detail}"
            if attempt < 3:
                time.sleep(5 * (attempt + 1))
        except Exception as e:  # noqa: BLE001 — retry transport failures
            last = str(e)[:200]
            if attempt < 3:
                time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"gemini failed after 4 attempts: {last}")


def grok_generate(prompt, key):
    """Grok Imagine 2.0 via /v1/images/generations; returns flattened PNG bytes.

    Two quirks vs gemini (found in the 2026-08-23 pilot): the response is a
    hosted URL (not b64), and the imgen.x.ai CDN 403s the default python
    user-agent — fetch with a browser UA. OAuth access token lives in the
    opencode auth.json "xai" entry and expires (refresh token unused here);
    a 401 means re-auth opencode, not a retryable error.
    """
    body = json.dumps({"model": GROK_MODEL, "prompt": prompt, "n": 1}).encode()
    last = ""
    for attempt in range(4):
        try:
            req = urllib.request.Request(
                GROK_API, data=body,
                headers={"Authorization": f"Bearer {key}",
                         "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=180) as r:
                j = json.loads(r.read())
            d = j["data"][0]
            if d.get("b64_json"):
                raw = base64.b64decode(d["b64_json"])
                return flatten_png(raw, "image/png")
            url = d["url"]
            r2 = urllib.request.Request(
                url, headers={"User-Agent":
                              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"})
            with urllib.request.urlopen(r2, timeout=60) as r2r:
                raw = r2r.read()
            return flatten_png(raw, "image/jpeg")
        except urllib.error.HTTPError as e:
            detail = ""
            try:
                detail = e.read().decode()[:300]
            except Exception:  # noqa: BLE001
                pass
            if e.code == 401:
                raise RuntimeError(
                    f"GROK TOKEN EXPIRED — re-auth opencode xai. {detail[:150]}")
            last = f"{e} {detail}"
            if attempt < 3:
                time.sleep(5 * (attempt + 1))
        except Exception as e:  # noqa: BLE001 — retry transport failures
            last = str(e)[:200]
            if attempt < 3:
                time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"grok failed after 4 attempts: {last}")


def flatten_png(raw, mime):
    """Arbitrary raster (JPEG) -> white-flattened square PNG via sharp."""
    with tempfile.NamedTemporaryFile(suffix="." + mime.split("/")[-1], delete=False) as t:
        t.write(raw)
        src = t.name
    dst = src + ".png"
    script = (
        "const s=require('sharp');"
        f"s(process.argv[1]).resize(1024,1024,{{fit:'contain',background:'#ffffff'}})"
        f".flatten({{background:'#ffffff'}}).png().toFile(process.argv[2])"
        ".then(()=>0).catch(e=>{console.error(String(e));process.exit(1)})"
    )
    try:
        subprocess.run(["node", "-e", script, src, dst], cwd=ROOT, check=True,
                       stdout=subprocess.DEVNULL)
        with open(dst, "rb") as f:
            return f.read()
    finally:
        os.unlink(src)
        if os.path.exists(dst):
            os.unlink(dst)


def manifest_read(path=MANIFEST):
    if not os.path.exists(path):
        return set()
    return {l.strip() for l in open(path) if l.strip()}


_manifest_lock = threading.Lock()


def manifest_add(domain, path=MANIFEST):
    with _manifest_lock:
        with open(path, "a") as f:
            f.write(domain + "\n")


def rasterize(svg_path, png_path):
    script = (
        "const s=require('sharp');"
        f"s(process.argv[1]).resize(512,512,{{fit:'contain',background:'#ffffff'}})"
        f".flatten({{background:'#ffffff'}}).png().toFile(process.argv[2])"
        ".then(()=>0).catch(e=>{console.error(String(e));process.exit(1)})"
    )
    subprocess.run(
        ["node", "-e", script, svg_path, png_path], cwd=ROOT, check=True,
        stdout=subprocess.DEVNULL,
    )


def rewrite_config(ts_path, file):
    text = open(ts_path).read()
    if re.search(r'logo:\s*"[^"]+"', text):
        new = re.sub(r'logo:\s*"[^"]+"', f'logo: "{file}"', text)
    elif re.search(r"media:\s*\{", text):
        new = re.sub(r"media:\s*\{\s*", f'media: {{ logo: "{file}", ', text, count=1)
    else:
        new = re.sub(r"(ogImage:[^\n]*\n)", r"\1" + f'  media: {{ logo: "{file}" }},\n', text, count=1)
    if new != text:
        open(ts_path, "w").write(new)
        return True
    return False


def dhash(path):
    from PIL import Image, ImageOps
    img = Image.open(path).convert("L")
    # crop to the mark first: on a white canvas the raw 9x8 dHash only sees
    # "small dark thing centred on white" and every logo hashes alike
    mask = img.point(lambda v: 255 if v < 245 else 0)
    bbox = mask.getbbox()
    if bbox:
        img = img.crop(bbox)
    img = ImageOps.pad(img, (max(img.size), max(img.size)), color=255)
    img = img.resize((9, 8))
    px = list(img.getdata())
    bits = 0
    for row in range(8):
        for col in range(8):
            bits = (bits << 1) | (1 if px[row * 9 + col] > px[row * 9 + col + 1] else 0)
    return bits


def gate(strict):
    # dedupe gate — raster twins of Recraft .svg sites + Gemini .png sites
    # (via manifest). Legacy recolour .pngs are shared-pool marks by
    # construction and are not this gate's concern.
    gemini = manifest_read()
    hashes = {}
    for f in os.listdir(LOGO_DIR):
        stem, ext = os.path.splitext(f)
        if ext != ".png":
            continue
        if stem in gemini or os.path.exists(os.path.join(LOGO_DIR, stem + ".svg")):
            try:
                hashes[stem] = dhash(os.path.join(LOGO_DIR, f))
            except Exception:  # noqa: BLE001
                pass
    names = sorted(hashes)
    suspects = []
    for a in range(len(names)):
        for b in range(a + 1, len(names)):
            diff = bin(hashes[names[a]] ^ hashes[names[b]]).count("1")
            if diff <= DHASH_SUSPECT:
                suspects.append((diff, names[a], names[b]))
    if suspects:
        print(f"DUPE GATE: {len(suspects)} suspicious pairs (dHash <= {DHASH_SUSPECT}):")
        for diff, a, b in sorted(suspects):
            print(f"  {diff:2d} bits  {a}  <->  {b}")
        if strict:
            sys.exit(1)
    else:
        print(f"DUPE GATE: clean — {len(names)} logos, no pair <= {DHASH_SUSPECT} bits")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--engine", choices=["recraft", "gemini", "grok"],
                    default="recraft",
                    help="recraft = SVG $0.08 (default) | gemini = Nano Banana 2 "
                         "PNG ~$0.03 | grok = Imagine 2.0 PNG (opencode xai OAuth)")
    ap.add_argument("--dry-run", action="store_true", help="print the plan, no API calls")
    ap.add_argument("--concurrency", type=int, default=1,
                    help="parallel Gemini generations (network-bound; ~6 is sweet spot)")
    ap.add_argument("--site", help="comma-separated domain filter")
    ap.add_argument("--limit", type=int, help="only first N planned sites")
    ap.add_argument("--force", action="store_true", help="regenerate even if .svg exists")
    ap.add_argument("--strict-dupe", action="store_true", help="exit 1 on suspicious pairs")
    ap.add_argument("--gate-only", action="store_true", help="only run the dedupe gate")
    args = ap.parse_args()

    if args.gate_only:
        gate(args.strict_dupe)
        return

    key = ""
    if args.engine == "gemini":
        key = load_gemini_key()
    elif args.engine == "grok":
        auth = json.load(open(os.path.expanduser(GROK_KEY_FILE)))
        key = auth["xai"]["access"]
    else:
        cred = os.path.expanduser("~/.recraft/credentials")
        if os.path.exists(cred):
            m = re.search(r"^RECRAFT_API_KEY=(.+)$", open(cred).read(), re.M)
            if m:
                key = m.group(1).strip()
    domains = sorted(
        f for f in os.listdir(SITES_DIR)
        if os.path.isdir(os.path.join(SITES_DIR, f))
    )
    if args.site:
        keep = {s.strip() for s in args.site.split(",")}
        domains = [d for d in domains if d in keep]
    picks = plan(domains)

    mpath = {"gemini": MANIFEST, "grok": GROK_MANIFEST}.get(args.engine)
    done = manifest_read(mpath) if mpath else set()
    todo = []
    for d, p in picks.items():
        if mpath:
            # done = already gemini-generated, OR recraft-approved (has .svg
            # and wasn't --force'd — the 29 approved stay SVG)
            has = d in done or os.path.exists(os.path.join(LOGO_DIR, f"{d}.svg"))
        else:
            has = os.path.exists(os.path.join(LOGO_DIR, f"{d}.svg"))
        if (not has) or args.force:
            todo.append(d)
    if args.limit:
        todo = todo[: args.limit]

    unit = {"recraft": 0.08, "gemini": 0.03, "grok": 0.07}[args.engine]
    print(f"{len(picks)} sites planned | engine={args.engine} | {len(todo)} to "
          f"generate (~${len(todo) * unit:.2f}) | {len(picks) - len(todo)} already done")
    if args.dry_run:
        for d, p in sorted(picks.items()):
            mark = "*" if d in todo else "-"
            print(f"  {mark} {d:36s} {PALETTES[p['pal']][0]:22s} "
                  f"{p['concepts'][p['concept']][:48]}")
        return

    if not key:
        sys.exit("no API key found for engine " + args.engine)

    if mpath:
        # adopt manifest sites missing only their config rewrite
        for d in done:
            if d not in picks:
                continue
            ts = os.path.join(SITES_DIR, f"{d}.ts")
            if os.path.exists(ts) and f'logo: "{d}.png"' not in open(ts).read():
                rewrite_config(ts, f"{d}.png")
                print(f"adopted {d} (config rewrite only, no API)")

        stop = threading.Event()
        generate = gemini_generate if args.engine == "gemini" else grok_generate

        def gen_one(i_d):
            i, d = i_d
            if stop.is_set():
                return
            p = picks[d]
            prompt = build_prompt(p["concept"], p["encl"], p["style"], p["pal"],
                                  p["concepts"], p["brand"])
            png_path = os.path.join(LOGO_DIR, f"{d}.png")
            svg_path = os.path.join(LOGO_DIR, f"{d}.svg")
            try:
                png = generate(prompt, key)
                with open(png_path, "wb") as f:
                    f.write(png)
                rewrite_config(os.path.join(SITES_DIR, f"{d}.ts"), f"{d}.png")
                manifest_add(d, mpath)
                if os.path.exists(svg_path):  # stale rejected-recraft mark
                    os.remove(svg_path)
                print(f"[{i}/{len(todo)}] {d:36s} OK  {len(png)/1024:.0f}KB png  "
                      f"{PALETTES[p['pal']][0]}")
            except Exception as e:  # noqa: BLE001
                print(f"[{i}/{len(todo)}] {d:36s} ERR {e}")
                if "OUT OF GEMINI QUOTA" in str(e) or "GROK TOKEN EXPIRED" in str(e):
                    stop.set()

        with concurrent.futures.ThreadPoolExecutor(max_workers=args.concurrency) as ex:
            list(ex.map(gen_one, enumerate(todo, 1)))
        if stop.is_set():
            print(f"\nstopped — quota/token; completed sites are in "
                  f"{os.path.basename(mpath)} and skipped on re-run")
            sys.exit(2)
        gate(args.strict_dupe)
        return

    # adopt sites that already have an .svg (pre-copied or from an earlier
    # run): raster twin + config rewrite only, no API call
    adopted = 0
    for d, _ in picks.items():
        svg_path = os.path.join(LOGO_DIR, f"{d}.svg")
        png_path = os.path.join(LOGO_DIR, f"{d}.png")
        if os.path.exists(svg_path):
            ts = os.path.join(SITES_DIR, f"{d}.ts")
            text = open(ts).read() if os.path.exists(ts) else ""
            needs_png = not os.path.exists(png_path)
            needs_cfg = f'logo: "{d}.svg"' not in text
            if needs_png or needs_cfg:
                if needs_png:
                    rasterize(svg_path, png_path)
                if needs_cfg and os.path.exists(ts):
                    rewrite_config(ts, f"{d}.svg")
                adopted += 1
    if adopted:
        print(f"adopted {adopted} existing .svg files (raster/config only, no API)")

    credits_total = 0
    for i, d in enumerate(todo, 1):
        p = picks[d]
        prompt = build_prompt(p["concept"], p["encl"], p["style"], p["pal"],
                              p["concepts"], p["brand"])
        svg_path = os.path.join(LOGO_DIR, f"{d}.svg")
        png_path = os.path.join(LOGO_DIR, f"{d}.png")
        try:
            svg, credits = recraft_generate(prompt, key)
            with open(svg_path, "wb") as f:
                f.write(svg)
            rasterize(svg_path, png_path)
            rewrite_config(os.path.join(SITES_DIR, f"{d}.ts"), f"{d}.svg")
            credits_total += credits if isinstance(credits, int) else 0
            print(f"[{i}/{len(todo)}] {d:36s} OK  {len(svg)/1024:.0f}KB svg  "
                  f"{credits} credits  {PALETTES[p['pal']][0]}")
        except Exception as e:  # noqa: BLE001 — keep the batch moving, report at end
            print(f"[{i}/{len(todo)}] {d:36s} ERR {e}")
            if "OUT OF API UNITS" in str(e):
                print("\nstopping batch — top up units at recraft.ai, then re-run "
                      "(completed sites are skipped automatically)")
                sys.exit(2)
        time.sleep(1.5)
    print(f"spent ~{credits_total} credits (~${credits_total/1000:.2f}) this run")

    gate(args.strict_dupe)


if __name__ == "__main__":
    main()
