# Plumbing Build Status — 2026-08-19

> ### Fully remote 2026-08-25
> Same model as HVAC. Source: `github.com/Headbanger-Marketing/plumbing-astro`. Live HTML: `github.com/Headbanger-Marketing/<domain>` GitHub Pages. Local `hvac-network/sites/` is empty on purpose. Shared photos stay in `public/assets/img/` (in this repo). Ship with `scripts/deploy-site.sh <domain>` (depth-1 clone, push, delete clone + `dist/<domain>`). Do not keep `dist/` on disk.

**68 / 68 sites built + verified** in this repo (`plumbing-astro`, forked from `hvac-astro` as a single-trade plumbing lead-gen template). 2 pilots (`strathroyplumbing.ca`, `stthomasplumbing.ca`, committed 2026-08-07) + 66 new sites authored and built 2026-08-19.

- **All sites verified:** `dist/` contains all 68 sites; every `index.html` carries the `noindex` robots tag (68/68, 0 missing); `scripts/qa-sweep.py` (structure + services + copy rules + pairwise duplicate detection across all 68 sources) reports **CLEAN, 0 warnings**.
- **All 68 domains registered 2026-08-22** (Porkbun Headbanger, manual) and **wired to Cloudflare** same day (zone + GH-Pages A/CNAME records + NS delegation — `plumbing-duct-cleaning/CF-ZONES-2026-08-22.csv`). Sites **deployed 2026-08-22 to GitHub Pages** (liamseopro org, per-site repo + CNAME; DNS via CF wiring above) — 136/136 serving HTTPS 200 at launch (strathroy Pages cert re-issued after DELETE+re-enable), all still `noindex: true` pre-index-flip. Deploy log: `plumbing-duct-cleaning/provision-all.log`.

## Missing-logo fix (2026-08-19)

All 68 site configs set `media.logo = "10-water-drop.png"`, but the asset itself was missing from `public/assets/img/logos/` (the dir was inherited from hvac-astro, which stops at `10-airflow-vortex.png`). **Created `10-water-drop.png` 2026-08-19** and rebuilt — the file now exists in all 68 `dist/<domain>/assets/img/logos/` trees (verified 68/68).

## Placeholder-NAP warning

Every site's NAP is placeholder data pending real fulfiller assignment. **Do not publish, cite, or submit to directories/citations as-is:**

- **Phones:** `(519)` / `(905)` area codes with fictional `555-01xx` numbers (e.g. `(519) 555-0112`). Area codes are real Ontario codes; the subscriber numbers are the reserved fictional range.
- **Streets:** every street starts with the literal word `PLACEHOLDER` (e.g. `PLACEHOLDER Dundas Street`, London).
- **Postal codes:** real, correct FSAs for each town (e.g. `N6A` London, `N9A` Windsor) with `1A1`-style completers — flagged `// PLACEHOLDER` in every config. Plausible-looking but not real addresses.

## Site inventory (by county/region)

All 68 sites, one line each. "Pilot" = the two original builds (fulfiller noted: Hayter/Premier).

### Middlesex (8)
- londonplumbingpros.ca (London, (519) 555-0112) — built + verified, noindex, placeholder NAP
- strathroyplumbing.ca (Strathroy, (519) 555-0148) — **PILOT** (fulfiller: Hayter Group / Premier) — built + verified, noindex, placeholder NAP
- dorchesterplumbing.ca (Dorchester, (519) 555-0154) — built + verified, noindex, placeholder NAP
- glencoeplumbing.ca (Glencoe, (519) 555-0126) — built + verified, noindex, placeholder NAP
- ildertonplumbing.ca (Ilderton, (519) 555-0169) — built + verified, noindex, placeholder NAP
- komokaplumbing.ca (Komoka, (519) 555-0176) — built + verified, noindex, placeholder NAP
- lucanplumbing.ca (Lucan, (519) 555-0183) — built + verified, noindex, placeholder NAP
- mountbrydgesplumbing.ca (Mount Brydges, (519) 555-0198) — built + verified, noindex, placeholder NAP

### Huron (6)
- bayfieldplumbing.ca (Bayfield, (519) 555-0176) — built + verified, noindex, placeholder NAP
- clintonplumbing.ca (Clinton, (519) 555-0187) — built + verified, noindex, placeholder NAP
- exeterplumbing.ca (Exeter, (519) 555-0132) — built + verified, noindex, placeholder NAP
- goderichplumbing.ca (Goderich, (519) 555-0143) — built + verified, noindex, placeholder NAP
- seaforthplumbing.ca (Seaforth, (519) 555-0121) — built + verified, noindex, placeholder NAP
- winghamplumbing.ca (Wingham, (519) 555-0122) — built + verified, noindex, placeholder NAP

### Essex (6)
- windsorplumbing.ca (Windsor, (519) 555-0126) — built + verified, noindex, placeholder NAP
- amherstburgplumbingpros.ca (Amherstburg, (519) 555-0158) — built + verified, noindex, placeholder NAP
- lakeshoreplumbing.ca (Lakeshore, (519) 555-0171) — built + verified, noindex, placeholder NAP
- lasalleplumbing.ca (LaSalle, (519) 555-0137) — built + verified, noindex, placeholder NAP
- leamingtonplumbingpros.ca (Leamington, (519) 555-0179) — built + verified, noindex, placeholder NAP
- tecumsehplumbingpros.ca (Tecumseh, (519) 555-0163) — built + verified, noindex, placeholder NAP

### York / GTA north (5)
- markhamplumbingpros.ca (Markham, (905) 555-0161) — built + verified, noindex, placeholder NAP
- richmondhillplumbingpros.ca (Richmond Hill, (905) 555-0162) — built + verified, noindex, placeholder NAP
- newmarketplumbingpros.ca (Newmarket, (905) 555-0163) — built + verified, noindex, placeholder NAP
- auroraplumbingpros.ca (Aurora, (905) 555-0164) — built + verified, noindex, placeholder NAP
- keswickplumbingpros.ca (Keswick, (905) 555-0165) — built + verified, noindex, placeholder NAP

### Waterloo Region (5)
- kitchenerplumbingpros.ca (Kitchener, (519) 555-0121) — built + verified, noindex, placeholder NAP
- waterlooplumbingpros.ca (Waterloo, (519) 555-0122) — built + verified, noindex, placeholder NAP
- cambridgeplumbingpros.ca (Cambridge, (519) 555-0123) — built + verified, noindex, placeholder NAP
- ayrplumbing.ca (Ayr, (519) 555-0125) — built + verified, noindex, placeholder NAP
- elmiraplumbing.ca (Elmira, (519) 555-0126) — built + verified, noindex, placeholder NAP

### Chatham-Kent (4)
- chathamplumbingpros.ca (Chatham, (519) 555-0132) — built + verified, noindex, placeholder NAP
- chathamkentplumbing.ca (Chatham-Kent, (519) 555-0134) — built + verified, noindex, placeholder NAP
- ridgetownplumbing.ca (Ridgetown, (519) 555-0136) — built + verified, noindex, placeholder NAP
- wallaceburgplumbing.ca (Wallaceburg, (519) 555-0138) — built + verified, noindex, placeholder NAP

### Lambton (4)
- sarniaplumbing.ca (Sarnia, (519) 555-0140) — built + verified, noindex, placeholder NAP
- petroliaplumbing.ca (Petrolia, (519) 555-0142) — built + verified, noindex, placeholder NAP
- forestplumbing.ca (Forest, (519) 555-0144) — built + verified, noindex, placeholder NAP
- grandbendplumbing.ca (Grand Bend, (519) 555-0198) — built + verified, noindex, placeholder NAP

### Perth (4)
- stratfordplumbing.ca (Stratford, (519) 555-0121) — built + verified, noindex, placeholder NAP
- listowelplumbing.ca (Listowel, (519) 555-0154) — built + verified, noindex, placeholder NAP
- mitchellplumbingpros.ca (Mitchell, (519) 555-0127) — built + verified, noindex, placeholder NAP
- stmarysplumbing.ca (St. Marys, (519) 555-0165) — built + verified, noindex, placeholder NAP

### Durham / GTA east (4)
- oshawaplumbingpros.ca (Oshawa, (905) 555-0166) — built + verified, noindex, placeholder NAP
- whitbyplumbingpros.ca (Whitby, (905) 555-0167) — built + verified, noindex, placeholder NAP
- ajaxplumbingpros.ca (Ajax, (905) 555-0168) — built + verified, noindex, placeholder NAP
- pickeringplumbingpros.ca (Pickering, (905) 555-0169) — built + verified, noindex, placeholder NAP

### Halton / GTA west (4)
- oakvilleplumbingpros.ca (Oakville, (905) 555-0162) — built + verified, noindex, placeholder NAP
- burlingtonplumbingpros.ca (Burlington, (905) 555-0173) — built + verified, noindex, placeholder NAP
- miltonplumbingpros.ca (Milton, (905) 555-0184) — built + verified, noindex, placeholder NAP
- georgetownplumbingpros.ca (Georgetown, (905) 555-0195) — built + verified, noindex, placeholder NAP

### Elgin (2)
- stthomasplumbing.ca (St. Thomas, (519) 555-0148) — **PILOT** (fulfiller: Hayter Group / Premier) — built + verified, noindex, placeholder NAP
- aylmerplumbing.ca (Aylmer, (519) 555-0137) — built + verified, noindex, placeholder NAP

### Norfolk (3)
- simcoeplumbingpros.ca (Simcoe, (519) 555-0124) — built + verified, noindex, placeholder NAP
- norfolkplumbing.ca (Norfolk, (519) 555-0125) — built + verified, noindex, placeholder NAP
- portdoverplumbing.ca (Port Dover, (519) 555-0159) — built + verified, noindex, placeholder NAP

### Oxford (3)
- woodstockplumbingpros.ca (Woodstock, (519) 555-0125) — built + verified, noindex, placeholder NAP
- ingersollplumbing.ca (Ingersoll, (519) 555-0127) — built + verified, noindex, placeholder NAP
- tillsonburgplumbingpros.ca (Tillsonburg, (519) 555-0128) — built + verified, noindex, placeholder NAP

### Haldimand (3)
- caledoniaplumbingpros.ca (Caledonia, (905) 555-0127) — built + verified, noindex, placeholder NAP
- dunnvilleplumbingpros.ca (Dunnville, (905) 555-0126) — built + verified, noindex, placeholder NAP
- nanticokeplumbing.ca (Nanticoke, (905) 555-0137) — built + verified, noindex, placeholder NAP

### Hamilton (2)
- hamiltonplumbingpros.ca (Hamilton, (905) 555-0121) — built + verified, noindex, placeholder NAP
- ancasterplumbingpros.ca (Ancaster, (905) 555-0122) — built + verified, noindex, placeholder NAP

### Brant (2)
- brantfordplumbingpros.ca (Brantford, (519) 555-0123) — built + verified, noindex, placeholder NAP
- parisplumbingpros.ca (Paris, (519) 555-0126) — built + verified, noindex, placeholder NAP

### Wellington (1)
- guelphplumbingpros.ca (Guelph, (519) 555-0124) — built + verified, noindex, placeholder NAP

### Grey (1)
- owensoundplumbingpros.ca (Owen Sound, (519) 555-0123) — built + verified, noindex, placeholder NAP

### Bruce (1)
- saugeenshoresplumbing.ca (Saugeen Shores, (519) 555-0124) — built + verified, noindex, placeholder NAP

Count check: 8+6+6+5+5+4+4+4+4+4+2+3+3+3+2+2+1+1+1 = **68**.

## Rebuilding a site

```bash
HVAC_SITE=<domain> ./scripts/build-site.sh --no-sync
# e.g. HVAC_SITE=londonplumbingpros.ca ./scripts/build-site.sh --no-sync
```

Runs astro build + HTML normalize + service-slug redirects, output to `dist/<domain>/`, skipping the deploy-repo sync. (Without `--no-sync` it also pushes into the deploy repo — not wanted until domains exist.) QA: `python3 scripts/qa-sweep.py`.

## Next steps

1. **Buy the 68 plumbing domains at Porkbun (Headbanger account)** — the plumbing half of `plumbing-duct-cleaning/bulk-batch-1.txt` (94 names) + `bulk-batch-2.txt` (42 names), which also hold the 68 duct-cleaning names. `.ca` is not API-registerable at Porkbun (CIRA `requiresValidatedAddress`) → manual dashboard registration; fund the HB account first ($0 balance); re-verify availability immediately before buying.
2. **Replace placeholder NAP when fulfiller numbers are assigned** — real phone/street/postal per site (only ~12 towns have confirmed fulfillment via Jayden's acquired companies: Hoffmeyer — Goderich/Huron, Premier — Strathroy/St Thomas, Hayter — Sarnia/Lambton; the rest assign as rolls out).
3. **Deploy via GitHub Pages (liamseopro org) + Cloudflare DNS**, same pattern as the HVAC estate (per-site repo, custom domain CNAME, CF DNS pointing at Pages).
4. **Author BLOG content later** — `BLOG` is intentionally `[]` on all 68 sites (lean 13-page build); blog posts are a post-launch content task.
5. **Flip `noindex` → index when a site goes live** (`noindex: true` in `src/sites/<domain>.ts`, then rebuild), one site at a time as domains + DNS + real NAP land.
