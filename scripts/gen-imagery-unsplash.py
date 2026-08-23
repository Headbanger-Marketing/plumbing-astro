#!/usr/bin/env python3
"""Per-site stock imagery from the Unsplash API.

Companion to gen-logos-recraft.py: that one mints per-site LOGOS, this one
replaces the fork's shared HVAC-era photos with trade-correct per-site stock.
Slots (per plumbing site):

  home-tech         home "media-photo" split box  (config media.technicianPhoto)
  <service-slug>x7  service page svc-photo img + --hero-bg-url background
                    (content.ts SVC_PHOTO src)
  hero              home .hero.has-bg + locations .page-hero.has-bg background
                    (opt-in override via config media.heroImage, SiteLayout)

Files land beside the assets they replace:
  public/assets/img/wp/<domain>-<slot>.jpg      (tech + 7 services, imgix-cropped)
  public/assets/img/heroes/<domain>.webp        (hero, webp bytes via imgix fm=webp)

Pick pipeline: cached search per query -> relevance score (alt/tags keyword
weights) -> orientation filter -> cross-slot photo-id dedupe -> deterministic
pick (md5(domain:slot) over the top-scoring candidates, so the 68-site rollout
gets variety without re-searching). Downloads trigger the API's
download_location endpoint per Unsplash app guidelines, then fetch urls.raw
with imgix size params so the crop/resize/format is server-side.

Records (all under scripts/.unsplash-cache/ — deliberately NOT in public/:
photographer provenance is internal only, per the user's no-citation call):
  manifest.json   {domain: {slot: photo_id}} + _banned (rejected picks) —
                  idempotent-resume marker; written incrementally per slot
  credits.json    [{site,slot,photo_id,photographer,profile,url}]
  <query-slug>.json  raw search JSON (rate-limit shield — demo tier is 50 req/h)

Usage:
  scripts/gen-imagery-unsplash.py --site londonplumbingpros.ca            # all slots
  scripts/gen-imagery-unsplash.py --site <domain> --slots hero,home-tech  # subset
  scripts/gen-imagery-unsplash.py --site <domain> --dry-run               # picks only
  scripts/gen-imagery-unsplash.py --site <domain> --force                 # re-pick
  scripts/gen-imagery-unsplash.py --site <d> --replace sump-pumps         # ban + re-pick
  scripts/gen-imagery-unsplash.py --site <d> --pin hero=<photo_id>        # force one photo

Key: ~/.unsplash/credentials -> UNSPLASH_ACCESS_KEY (chmod 600).
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import sys
import urllib.request

UNSPLASH_SEARCH = "https://api.unsplash.com/search/photos"
UNSPLASH_PHOTOS = "https://api.unsplash.com/photos"
IMG_DIR = os.path.join("public", "assets", "img")
WP_DIR = os.path.join(IMG_DIR, "wp")
HERO_DIR = os.path.join(IMG_DIR, "heroes")
MANIFEST = os.path.join("scripts", ".unsplash-cache", "manifest.json")
CACHE_DIR = os.path.join("scripts", ".unsplash-cache")
# Credits AND manifest live OUTSIDE public/ deliberately: photographer
# provenance is an internal record (user: don't cite the source) and must not
# ship in dist — photo ids resolve to Unsplash pages, so they count as citing.
CREDITS = os.path.join(CACHE_DIR, "credits.json")
KEY_FILE = os.path.expanduser("~/.unsplash/credentials")

# slot -> (queries in priority order, keyword weights, width, height, format)
# Thin-coverage slots (sump-pumps, water-softeners, leak-detection) carry
# broader fallbacks so the query chain never comes up empty. `neg` subtracts
# (junk the demo dry-run actually surfaced: gas-station "pumps", corroded scrap
# piles for hero, 3D renders); `min_score` gates thin slots harder.
SLOTS = {
    "home-tech": {
        # "plumber working" leads: it surfaces the Shakerzianov on-the-job series
        # the very first credential test returned — person-at-work shots beat
        # tool flat-lays for this box.
        "queries": ["plumber working", "plumber fixing sink", "plumber wrench pipe"],
        "kw": {"plumber": 4, "man": 3, "technician": 3, "working": 3, "fix": 2, "person": 2,
               "wrench": 2, "pipe": 2, "sink": 2, "plumbing": 3, "tool": 1},
        "neg": {"flat": 1, "lay": 1},
        "min": 3,
        "w": 1350, "h": 1350, "fmt": "jpg",
    },
    "water-heaters": {
        "queries": ["water heater installation", "hot water tank", "water heater plumbing"],
        "kw": {"water heater": 5, "hot water": 4, "tank": 2, "boiler": 1, "basement": 1},
        "neg": {},
        "min": 3,
        "w": 1800, "h": 1200, "fmt": "jpg",
    },
    "drain-cleaning": {
        "queries": ["drain cleaning plumber", "plumbing snake drain", "clogged drain repair"],
        "kw": {"drain": 5, "snake": 3, "clog": 3, "pipe": 2, "plumb": 2, "sink": 1},
        "neg": {},
        "min": 3,
        "w": 1800, "h": 1200, "fmt": "jpg",
    },
    "repiping": {
        "queries": ["copper pipe plumbing installation", "plumbing pipes wall", "copper piping solder"],
        "kw": {"copper": 4, "pipe": 4, "plumb": 3, "solder": 3, "install": 2, "wall": 2, "man": 2,
               "working": 2},
        "neg": {"corroded": 4, "rust": 4, "old": 2, "abandoned": 3, "shadow": 3},
        "min": 3,
        "w": 1800, "h": 1200, "fmt": "jpg",
    },
    "fixtures-toilets": {
        "queries": ["plumber installing toilet", "toilet installation", "bathroom faucet install"],
        "kw": {"plumber": 4, "toilet": 3, "repair": 3, "install": 3, "glove": 2, "faucet": 2,
               "bathroom": 1, "sink": 1},
        "neg": {"urinal": 6, "commercial building": 3},  # residential estate
        "min": 3,
        "w": 1800, "h": 1200, "fmt": "jpg",
    },
    "leak-detection": {
        "queries": ["water leak pipe repair", "plumbing leak", "pipe leak water damage"],
        "kw": {"leak": 5, "pipe": 3, "water": 2, "plumb": 2, "repair": 1, "damage": 1},
        "neg": {},
        "min": 3,
        "w": 1800, "h": 1200, "fmt": "jpg",
    },
    "sump-pumps": {
        # Unsplash has no real sump-pump photos — clean basement-utility context
        # is the honest pool. Vision-audit 2026-08-23: the "flooded basement"
        # pool is abandoned-room shots (mattress-on-board, cords, bags) —
        # neg them hard, prefer drains/utility sinks/clean joists.
        "queries": ["basement floor drain", "utility sink", "crawl space", "sump pump",
                    "unfinished basement"],
        "kw": {"sump": 6, "drain": 4, "basement": 3, "utility": 4, "pipe": 3, "joist": 3,
               "sink": 3, "crawl": 3, "flood": 2, "pump": 2},
        "neg": {"gas": 4, "station": 4, "fuel": 4, "tuk": 6, "car": 3, "vehicle": 4, "lotion": 6,
                "soap": 4, "dispenser": 4, "bottle": 4, "rocks": 4, "gravel": 4, "rock": 3,
                "construction": 3, "door": 3, "staircase": 3, "mattress": 8, "storage": 5,
                "clutter": 6, "debris": 5, "dark room": 5, "bag": 4, "cord": 4, "paper": 4,
                "abandoned": 5, "old": 3},
        "min": 3,
        "fallback_to": "repiping",
        "w": 1800, "h": 1200, "fmt": "jpg",
    },
    "water-softeners": {
        # Literal softener coverage on Unsplash ≈ zero, and the RO/filtration
        # query pools are contaminated by a lab-equipment vendor (RephiLe:
        # bench units with branding — vision-audit 2026-08-23 IRRELEVANT).
        # Honest pool: person-installing under-sink filter/RO work shots.
        "queries": ["installing water filter under sink", "under sink water filter",
                    "water softener", "water filtration system"],
        "kw": {"install": 5, "filter": 5, "under sink": 5, "osmosis": 4, "softener": 5,
               "plumb": 3, "sink": 3, "person": 3, "man": 3, "working": 3, "filtration": 3},
        "neg": {"rephile": 9, "lab": 7, "laboratory": 8, "bench": 5, "drinking": 3, "glass": 3,
                "bottle": 4, "apple": 3, "faucet": 3, "turned off": 4, "machine": 3,
                "kitchen": 2},
        "min": 3,
        "fallback_to": "water-heaters",
        "w": 1800, "h": 1200, "fmt": "jpg",
    },
    "hero": {
        # User preference 2026-08-23: plumber-at-work reads better than abstract
        # pipe texture even under the navy overlay (London pilot pinned to the
        # Shakerzianov cabinet shot). At-work series leads the queries.
        "queries": ["plumber working", "copper pipes texture", "plumbing pipes industrial"],
        "kw": {"plumber": 4, "man": 3, "working": 3, "copper": 3, "pipe": 3, "plumb": 3,
               "tool": 2, "texture": 2},
        "neg": {"corroded": 5, "rust": 5, "abandoned": 4, "old": 2, "junk": 4, "scrap": 4,
                "radiator": 2},
        "min": 4,
        "w": 1920, "h": 1280, "fmt": "webp",
    },
}


def load_key():
    if os.environ.get("UNSPLASH_ACCESS_KEY"):
        return os.environ["UNSPLASH_ACCESS_KEY"]
    if not os.path.exists(KEY_FILE):
        sys.exit("no UNSPLASH_ACCESS_KEY in env and no ~/.unsplash/credentials")
    for line in open(KEY_FILE):
        if line.startswith("UNSPLASH_ACCESS_KEY="):
            return line.split("=", 1)[1].strip()
    sys.exit("UNSPLASH_ACCESS_KEY missing from ~/.unsplash/credentials")


class RateLimited(Exception):
    pass


def http_json(url, key):
    req = urllib.request.Request(url, headers={"Authorization": f"Client-ID {key}"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            rem = r.headers.get("X-Ratelimit-Remaining")
            if rem is not None:
                print(f"       [quota {rem} left]")
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        if e.code == 403:  # demo tier: 50 req/h — "Rate Limit Exceeded" comes as 403
            raise RateLimited(url)
        raise


def search_cached(query, key):
    """Search results cached on disk — the demo tier allows 50 req/h, and the
    68-site rollout must not re-search what the pilot already fetched.
    On rate-limit: serve stale cache if we have it, else raise (wave resumes
    after the hourly window resets; picks are deterministic)."""
    slug = re.sub(r"[^a-z0-9]+", "-", query.lower()).strip("-")
    path = os.path.join(CACHE_DIR, f"{slug}.json")
    if os.path.exists(path):
        return json.load(open(path))["results"]
    os.makedirs(CACHE_DIR, exist_ok=True)
    try:
        data = http_json(f"{UNSPLASH_SEARCH}?query={urllib.request.quote(query)}&per_page=30", key)
    except RateLimited:
        if os.path.exists(path):
            print(f"       rate-limited on '{query}' — serving stale cache")
            return json.load(open(path))["results"]
        raise
    json.dump(data, open(path, "w"))
    return data["results"]


# Applied to every slot on top of per-slot neg. Scored against alt + tags +
# photographer NAME — that's what catches the "Point3D Commercial Imaging"
# renders and the "Mockup Free" bottles the dry-run surfaced.
GLOBAL_NEG = {
    "mockup": 8, "3d": 8, "render": 6, "graphical user interface": 8, "sony": 5,
    "projector": 5, "bicycle": 5, "handle bar": 5, "tuk": 8, "lotion": 8,
}


def score(photo, kw, neg):
    text = " ".join(
        filter(None, [photo.get("alt_description") or "", photo.get("description") or "",
                      " ".join(t.get("title") or "" for t in photo.get("tags", [])),
                      photo.get("user", {}).get("name", "")])
    ).lower()
    s = sum(w for k, w in kw.items() if k in text)
    s -= sum(w for k, w in {**GLOBAL_NEG, **neg}.items() if k in text)
    if photo["width"] >= photo["height"]:
        s += 2  # landscape bonus: portrait crops harshly into 3:2/square boxes
    return s


def candidates_for(slot_cfg, used_ids):
    """ALL queries merged -> scored, deduped candidate list. No early exit:
    a later query often holds the best shot (the plumber-at-work series lives
    in 'plumber working', not 'plumber working tools')."""
    out = {}
    for q in slot_cfg["queries"]:
        for p in search_cached(q, KEY):
            if p["id"] in used_ids or p["id"] in out:
                continue
            s = score(p, slot_cfg["kw"], slot_cfg.get("neg", {}))
            if s >= slot_cfg.get("min", 1):
                out[p["id"]] = {"id": p["id"], "s": s, "p": p}
    return sorted(out.values(), key=lambda c: -c["s"])


def pick(domain, slot, cands):
    """Deterministic per-(domain,slot) pick over the top-5 scored candidates,
    stepping past ids another slot already claimed."""
    top = cands[:5]
    if not top:
        return None
    seed = int(hashlib.md5(f"{domain}:{slot}".encode()).hexdigest(), 16)
    for i in range(len(top)):
        c = top[(seed + i) % len(top)]
        if c["id"] not in PICKED_THIS_RUN:
            return c
    return top[seed % len(top)]


def download(chosen, slot_cfg, dest, key):
    # Byte-dedupe across sites (uniqueness regime = filenames + alt text, not
    # photo bytes): the rollout's deterministic picks land ~5 distinct photos
    # per slot across 68 sites — same (photo, size, format) already on disk is
    # a local copy, not a new API download. ~612 triggers become ~45.
    raw = chosen["p"]["urls"]["raw"]
    params = f"w={slot_cfg['w']}&h={slot_cfg['h']}&fit=crop&q=80&fm={slot_cfg['fmt']}"
    reg_path = os.path.join(CACHE_DIR, "dl-registry.json")
    registry = read_json(reg_path, {})
    reg_key = f"{chosen['id']}:{params}"
    if reg_key in registry and os.path.exists(registry[reg_key]):
        src_file = registry[reg_key]
        if os.path.abspath(src_file) != os.path.abspath(dest):
            shutil.copy(src_file, dest)
            print(f"copy   {os.path.basename(dest)} (byte-dedupe from {src_file})")
        else:
            print(f"have   {os.path.basename(dest)} (registry already points here)")
        return
    # Trigger the download endpoint per Unsplash API guidelines (also the
    # app-terms requirement for API-driven downloads).
    dl = chosen["p"]["links"]["download_location"]
    http_json(dl, key)  # noqa: response body unused; the trigger is the point
    url = raw + ("&" if "?" in raw else "?") + params
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=60) as r:
        blob = r.read()
    magic = blob[:2] == b"\xff\xd8" if slot_cfg["fmt"] == "jpg" else blob[:4] == b"RIFF"
    if not magic or len(blob) < 20_000:
        raise RuntimeError(f"bad bytes for {dest}: {len(blob)}B magic={blob[:4]!r}")
    open(dest, "wb").write(blob)
    registry[reg_key] = dest
    os.makedirs(CACHE_DIR, exist_ok=True)
    json.dump(registry, open(reg_path, "w"), indent=1)


def dest_for(domain, slot, slot_cfg):
    if slot == "hero":
        return os.path.join(HERO_DIR, f"{domain}.webp")
    return os.path.join(WP_DIR, f"{domain}-{slot}.jpg")


def fetch_photo(photo_id, key):
    """Photo object by id (for --pin). Cache-first: the rollout pins the same
    two vetted photos on all 68 sites and those ids live in the search caches,
    so no API call fires per site."""
    for name in os.listdir(CACHE_DIR):
        if not name.endswith(".json") or name in ("manifest.json", "credits.json"):
            continue
        try:
            d = json.load(open(os.path.join(CACHE_DIR, name)))
        except Exception:
            continue
        for p in d.get("results", []):
            if p["id"] == photo_id:
                return p
    return http_json(f"{UNSPLASH_PHOTOS}/{photo_id}", key)


def read_json(path, default):
    return json.load(open(path)) if os.path.exists(path) else default


PICKED_THIS_RUN = set()  # ids claimed by earlier slots in this invocation


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", required=True, help="domain, e.g. londonplumbingpros.ca")
    ap.add_argument("--slots", help="comma list; default = all")
    ap.add_argument("--force", action="store_true", help="re-pick even if manifest has the slot")
    ap.add_argument("--dry-run", action="store_true", help="show picks, download nothing")
    ap.add_argument("--replace", metavar="SLOTS",
                    help="comma list of slots whose CURRENT pick is rejected: the id is "
                         "banned persistently (manifest _banned) and the slot re-picks")
    ap.add_argument("--pin", action="append", default=[], metavar="SLOT=PHOTO_ID",
                    help="force a slot to a specific Unsplash photo id (repeatable); "
                         "e.g. --pin hero=wzIjLL4KB-4")
    args = ap.parse_args()

    global KEY
    KEY = load_key()

    wanted = args.slots.split(",") if args.slots else list(SLOTS)
    for s in wanted:
        if s not in SLOTS:
            sys.exit(f"unknown slot {s!r}; known: {', '.join(SLOTS)}")

    pins = {}
    for p in args.pin:
        slot, _, pid = p.partition("=")
        if slot not in SLOTS or not pid:
            sys.exit(f"bad --pin {p!r} (want SLOT=PHOTO_ID, slot in {', '.join(SLOTS)})")
        pins[slot] = pid
    # Pinned slots claim their id FIRST so later slots' pools exclude it —
    # pins-last bit us in the rollout: fixtures picked the softener pin's
    # photo (top of its pool) and the softener pin then byte-deduped to it,
    # putting identical photos on two pages of the SAME site.
    wanted = [s for s in wanted if s in pins] + [s for s in wanted if s not in pins]

    manifest = read_json(MANIFEST, {})
    site_rec = manifest.get(args.site, {})
    banned = set(manifest.get("_banned", []))
    if args.replace:
        for slot in args.replace.split(","):
            if slot not in SLOTS:
                sys.exit(f"unknown --replace slot {slot!r}")
            old = site_rec.get(slot)
            if old:
                banned.add(old)
                del site_rec[slot]  # falls through to the normal pick path
                print(f"ban   {slot}: {old} (rejected)")
            else:
                print(f"note  {slot}: nothing to replace in manifest — will pick fresh")
    # Uniqueness regime (user directive 2026-08-23): photos do NOT need to be
    # unique across sites — per-site FILENAMES + per-site ALT TEXT suffice.
    # So dedupe is within-site only (one photo can't serve two slots of the
    # same site) plus the persistent ban list; other sites' picks don't shrink
    # this site's pool. The deterministic per-(domain,slot) pick still spreads
    # photos across sites for free variety.
    used_ids = set(site_rec.values()) | banned

    os.makedirs(WP_DIR, exist_ok=True)
    os.makedirs(HERO_DIR, exist_ok=True)
    credits = read_json(CREDITS, [])
    credits = [c for c in credits if not (c["site"] == args.site and c["slot"] in wanted)]
    rate_limited = False

    for slot in wanted:
        cfg = SLOTS[slot]
        if not args.force and slot not in pins and slot in site_rec:
            dest = dest_for(args.site, slot, cfg)
            if os.path.exists(dest):
                print(f"skip   {slot}: manifest + file present ({os.path.basename(dest)})")
                continue
        if slot in pins:
            try:
                chosen = {"id": pins[slot], "s": 0, "p": fetch_photo(pins[slot], KEY)}
            except RateLimited:
                print("STOP   rate-limited fetching pin — re-run after the window resets")
                rate_limited = True
                break
            print(f"pin   {slot}: {chosen['id']}")
        else:
            chosen = None
        if chosen is None:
            src = slot
            try:
                cands = candidates_for(cfg, used_ids)
            except RateLimited:
                print("STOP   rate-limited on search (no cache) — re-run after the window resets")
                rate_limited = True
                break
            if not cands and cfg.get("fallback_to"):
                # Thin slot with an empty pool: borrow the named slot's
                # candidates. The seed differs per slot, so it lands on a
                # DIFFERENT photo than the source slot itself.
                cands = candidates_for(SLOTS[cfg["fallback_to"]], used_ids)
                src = cfg["fallback_to"]
            chosen = pick(args.site, slot, cands)
            if chosen is None:
                print(f"WARN   {slot}: no scored candidates in any query — left as-is")
                continue
            if src != slot:
                print(f"note   {slot}: pool empty, borrowing '{src}' candidates")
            print(f"pick   {slot}: {chosen['id']} (score {chosen['s']})")
            print(f"         alt: {(chosen['p'].get('alt_description') or '(none)')[:90]}")
        PICKED_THIS_RUN.add(chosen["id"])
        dest = dest_for(args.site, slot, cfg)
        u = chosen["p"]["user"]
        if args.dry_run:
            continue
        try:
            download(chosen, cfg, dest, KEY)
        except RateLimited:
            print("STOP   rate-limited mid-wave — re-run the SAME command after the "
                  "hourly window resets; done slots skip, picks are deterministic")
            rate_limited = True
            break
        except Exception as e:  # noqa: keep the wave alive; slot retries next run
            print(f"ERR    {slot}: {e}")
            continue
        used_ids.add(chosen["id"])
        site_rec[slot] = chosen["id"]
        credits.append({
            "site": args.site, "slot": slot, "photo_id": chosen["id"],
            "photographer": u["name"], "profile": u.get("links", {}).get("html"),
            "url": chosen["p"]["links"]["html"],
        })
        # Incremental persistence: a crash (or rate-limit break) must never lose
        # the slots already downloaded this wave.
        manifest[args.site] = site_rec
        if banned:
            manifest["_banned"] = sorted(banned)
        json.dump(manifest, open(MANIFEST, "w"), indent=1, sort_keys=True)
        json.dump(credits, open(CREDITS, "w"), indent=1)
        print(f"done   {slot}: {dest} ({os.path.getsize(dest) // 1024}KB)")

    if args.dry_run:
        return
    manifest[args.site] = site_rec
    if banned:
        manifest["_banned"] = sorted(banned)
    json.dump(manifest, open(MANIFEST, "w"), indent=1, sort_keys=True)
    json.dump(credits, open(CREDITS, "w"), indent=1)
    print(f"\nmanifest: {MANIFEST}\ncredits:  {CREDITS}")


if __name__ == "__main__":
    main()
