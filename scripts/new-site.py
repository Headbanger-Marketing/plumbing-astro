#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scaffold a BRAND-NEW HVAC site (no WordPress source).

Creates two files under hvac-astro/src/sites/:
  1. <domain>.ts          — SiteConfig (brand, city, phone, address, palette...)
  2. <domain>/content.ts  — SiteContent with template-fallback-friendly defaults
                            (7 services with lean-but-valid prose, empty BLOG,
                            generic reviews, default SVC_PHOTO mapping)

The emitted content BUILDS IMMEDIATELY and passes verify-site.py --new.
It is deliberately lean — real authoring is done by the author subagent
(prompts/author-site.md), which overwrites content.ts with full prose.

A site brief is a JSON object. Provide it via:
  --brief path/to/brief.json
  --brief-stdin          (read JSON from stdin)
  or individual flags: --brand "..." --city "..." --phone "..." ...

Brief schema (all required unless marked):
  domain        str   e.g. "exeterheatingcooling.ca"
  brand         str   e.g. "Exeter Heating & Cooling" (raw & is fine)
  city          str   e.g. "Exeter"
  county        str   e.g. "Lambton County"
  phone_display str   e.g. "(519) 555-0123"
  phone_tel     str   e.g. "+15195550123"
  email         str   e.g. "contact@exeterheatingcooling.ca"   (default contact@<domain>)
  street        str   e.g. "123 Main St"
  postal        str   e.g. "N0M 1S0"
  service_areas list  e.g. ["Exeter", "Seaforth", "Crediton"]   (default: [city])
  palette       obj   optional {navy, accent, accent2, themeColor}  (defaults to standard HVAC blue)
  technician_photo  str  optional filename under /assets/img/wp/  (default: default-technician.jpg)
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITES_DIR = ROOT / "src" / "sites"

# Default HVAC palette (used when brief doesn't specify one).
DEFAULT_PALETTE = {
    "navy": "#0f2544",
    "accent": "#2563eb",
    "accent2": "#0f2544",
    "themeColor": "#0f2544",
}

# Default technician photo (generic, unbranded — created for new sites).
DEFAULT_TECH_PHOTO = "default-technician.jpg"

# The 7 fixed service slugs (must match src/data/content.ts SERVICES).
SERVICE_SLUGS = [
    "furnace-repair",
    "ac-repair",
    "ductless-ac-installation",
    "heat-pump-repair-installation",
    "fireplace-installation",
    "thermostat-repair-replacement",
    "duct-cleaning",
]

# Generic (non-city-specific) service photos in public/assets/img/wp/.
# Fireplace has no dedicated photo; falls back to the technician photo (same
# pattern the migrated sites use).
SERVICE_PHOTOS = {
    "furnace-repair": "furnace.jpeg",
    "ac-repair": "air-conditioner.jpeg",
    "ductless-ac-installation": "ductless-ac.jpeg",
    "heat-pump-repair-installation": "a-heat-pump.png",
    "thermostat-repair-replacement": "thermostat.png",
    "duct-cleaning": "Duct-Cleaning.png",
    "fireplace-installation": None,  # falls back to technician photo
}


def to_ts_string(s: str) -> str:
    """Emit a TS string literal."""
    return json.dumps(s, ensure_ascii=False)


def emit_config(brief: dict) -> str:
    """Emit the SiteConfig TS file. Mirrors extract-config.emit_config shape."""
    domain = brief["domain"]
    brand = brief["brand"]
    brand_html = brand.replace("&", "&amp;")
    city = brief["city"]
    county = brief["county"]
    url = f"https://{domain}"
    phone_display = brief["phone_display"]
    phone_tel = brief["phone_tel"]
    email = brief.get("email", f"contact@{domain}")
    street = brief["street"]
    postal = brief["postal"]
    service_areas = brief.get("service_areas", [city])
    palette = {**DEFAULT_PALETTE, **brief.get("palette", {})}
    og = f"{url}/assets/img/og-default.png"
    tech_photo = brief.get("technician_photo", DEFAULT_TECH_PHOTO)

    lines = [
        f"// Per-site config for {domain}",
        f"// SCAFFOLDED by scripts/new-site.py. Brand: \"{brand}\".",
        f"// Real authoring happens in content.ts (see hvac-site-builder skill).",
        "import type { SiteConfig } from '../lib/types';",
        "",
        "export const site: SiteConfig = {",
        f"  domain: {to_ts_string(domain)},",
        f"  url: {to_ts_string(url)},",
        f"  brand: {to_ts_string(brand)},",
        f"  brandHtml: {to_ts_string(brand_html)},",
        f"  city: {to_ts_string(city)},",
        "  region: 'Ontario',",
        "  regionAbbr: 'ON',",
        f"  county: {to_ts_string(county)},",
        f"  phone: {{ display: {to_ts_string(phone_display)}, tel: {to_ts_string(phone_tel)} }},",
        f"  email: {to_ts_string(email)},",
        "  address: {",
        f"    street: {to_ts_string(street)},",
        f"    locality: {to_ts_string(city)},",
        "    region: 'ON',",
        f"    postal: {to_ts_string(postal)},",
        "  },",
        f"  serviceAreas: {json.dumps(service_areas, ensure_ascii=False)},",
        "  palette: {",
        f"    navy: {to_ts_string(palette['navy'])},",
        f"    accent: {to_ts_string(palette['accent'])},",
        f"    accent2: {to_ts_string(palette['accent2'])},",
        f"    themeColor: {to_ts_string(palette['themeColor'])},",
        "  },",
        f"  ogImage: {to_ts_string(og)},",
        "  tracking: {",
        "    webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites',",
        "  },",
        f"  media: {{ technicianPhoto: {to_ts_string(tech_photo)} }},",
        "};",
        "",
    ]
    return "\n".join(lines)


def emit_content(brief: dict) -> str:
    """Emit a lean but valid content.ts that builds immediately.

    The service prose here is deliberately minimal placeholder copy that the
    page templates will render. The author subagent replaces it with full,
    differentiated prose. Em-dash-free and HTML-escaped per the constraints.
    """
    brand = brief["brand"]
    brand_html = brand.replace("&", "&amp;")
    city = brief["city"]
    county = brief["county"]

    # Build SVC entries: lean placeholder prose per service.
    # The kicker/h1/intro use city + brandHtml so they render sensibly even
    # before the author agent writes real copy. NO em-dashes.
    svc_labels = {
        "furnace-repair": ("Furnace Repair", "furnace", "flame"),
        "ac-repair": ("AC Repair", "air conditioner", "snowflake"),
        "ductless-ac-installation": ("Ductless AC Installation", "ductless mini-split", "fan"),
        "heat-pump-repair-installation": ("Heat Pump Repair &amp; Installation", "heat pump", "refresh"),
        "fireplace-installation": ("Fireplace Installation", "fireplace", "fireplace"),
        "thermostat-repair-replacement": ("Thermostat Repair &amp; Replacement", "thermostat", "gauge"),
        "duct-cleaning": ("Duct Cleaning", "air duct", "air-vent"),
    }

    svc_entries = []
    for slug in SERVICE_SLUGS:
        label_plain, noun, icon = svc_labels[slug]
        # label for prose (strip the &amp; back to & for natural sentences)
        label_natural = label_plain.replace("&amp;", "&")
        kicker = f"{label_natural} in {city}, Ontario"
        h1 = f"Dependable {label_natural} From a Local Team"
        intro = (
            f"{brand_html} provides {label_natural.lower()} services for homeowners in {city}, "
            f"Ontario and the surrounding {county} area. Our technicians diagnose the issue, "
            f"explain your options in plain language, and get your {noun} running right."
        )
        meta = (
            f"{label_natural} in {city}, Ontario. Honest diagnostics, lasting repairs, "
            f"and professional service from a licensed, insured HVAC team. Free quotes."
        )
        problem_h = f"Need {label_natural.lower()} in {city}?"
        problem_p = (
            f"{brand_html} handles {label_natural.lower()} across {city}, ON and nearby communities, "
            f"with honest pricing and work done right the first time."
        )
        features = [
            [icon, f"Done Right the First Time",
             f"We find the actual cause and fix it properly, so you are not calling us back about the same {noun} problem next week."],
            ["settings", "Maintenance That Prevents Breakdowns",
             f"Regular upkeep extends the life of your {noun} and heads off failures before they leave you uncomfortable."],
            ["shield", "A Team You Can Keep",
             f"As a licensed, insured HVAC company in {city}, our certified technicians service all brands with honest pricing."],
        ]
        entry = (
            f'  "{slug}": {{\n'
            f'    icon: "{icon}",\n'
            f'    kicker: {to_ts_string(kicker)},\n'
            f'    h1: {to_ts_string(h1)},\n'
            f'    intro: {to_ts_string(intro)},\n'
            f'    meta: {to_ts_string(meta)},\n'
            f'    problem_h: {to_ts_string(problem_h)},\n'
            f'    problem_p: {to_ts_string(problem_p)},\n'
            f'    features: {json.dumps(features, ensure_ascii=False)},\n'
            f'    rev: [0, 1, 2],\n'
            f'  }}'
        )
        svc_entries.append(entry)

    svc_block = ",\n".join(svc_entries)

    # Review pool: 6 generic, honest testimonials (name + place placeholders).
    # These are deliberately generic and will be refreshed by the author agent.
    reviews = [
        ["They showed up on time, found the real problem, and fixed it without trying to upsell me. Honest team.",
         "Homeowner", city],
        ["Quick response when our furnace stopped in the middle of winter. Grateful for the fast service.",
         "Local Resident", city],
        ["Professional, tidy, and explained everything clearly. We will use them again for maintenance.",
         "Customer", city],
        ["Fair pricing and quality workmanship. Our AC has never run better after their tune-up.",
         "Homeowner", city],
        ["They diagnosed a problem two other companies missed. Knowledgeable and trustworthy.",
         "Resident", city],
        ["Easy to reach, friendly technicians, and the work was done right the first time.",
         "Customer", city],
    ]

    # Home service cards (6 of 7 — drop fireplace, matching the migrated sites).
    home_services = []
    for slug in SERVICE_SLUGS:
        if slug == "fireplace-installation":
            continue
        label_natural = svc_labels[slug][0].replace("&amp;", "&")
        _, noun, icon = svc_labels[slug]
        home_services.append([
            icon,
            label_natural,
            f"Expert {label_natural.lower()} for {city} homes, done right and built to last.",
            f"/services/{slug}/",
        ])

    # Home FAQ: 6 lean Q/A pairs (template auto-appends a service-area Q).
    nearby = [a for a in brief.get("service_areas", [city]) if a != city][:4]
    nearby_str = ", ".join(nearby) if nearby else f"the wider {county} area"
    home_faq = [
        ["Do you offer emergency HVAC service in " + city + "?",
         f"Yes. We offer emergency heating and cooling service across {city} and the surrounding area."],
        ["Are you licensed and insured?",
         "Yes. We are a fully licensed and insured HVAC company serving Ontario homeowners."],
        ["How much does a service call cost?",
         "We offer free, no-obligation quotes. Diagnosing the issue is straightforward, and we explain all pricing before any work begins."],
        ["Do you work on all brands of furnace and AC?",
         f"Yes. Our certified technicians service, repair, and maintain all major furnace and air conditioner brands common in {city} homes."],
        ["Do you offer financing?",
         "Yes, we offer financing options on installations and major equipment. Ask us about current plans when you request a quote."],
        ["Do you serve areas outside of " + city + "?",
         f"Yes. We serve {city} and nearby communities including {nearby_str}."],
    ]

    # SVC_PHOTO: map each service to its generic photo (fireplace -> technician).
    tech_photo = brief.get("technician_photo", DEFAULT_TECH_PHOTO)
    svc_photo_entries = []
    for slug in SERVICE_SLUGS:
        fname = SERVICE_PHOTOS[slug]
        if fname is None:
            fname = tech_photo
        svc_photo_entries.append(
            f'  "{slug}": ["/assets/img/wp/{fname}", "{svc_labels[slug][0].replace("&amp;", "&")} in {city}, Ontario", 1800, 1200]'
        )
    svc_photo_block = ",\n".join(svc_photo_entries)

    content = f"""// Per-site content for {brief['domain']}
// SCAFFOLDED by scripts/new-site.py (lean placeholder copy).
// The author subagent (hvac-site-builder/prompts/author-site.md) replaces this
// with full, differentiated prose. NO em-dashes; & -> &amp; in HTML fields.

export const SVC = {{
{svc_block}
}};

export const BLOG = [];

export const REVIEW_POOL = {json.dumps(reviews, ensure_ascii=False)};

export const HOME_SERVICES = {json.dumps(home_services, ensure_ascii=False)};

export const HOME_FAQ = {json.dumps(home_faq, ensure_ascii=False)};

export const SVC_PHOTO = {{
{svc_photo_block}
}};
"""
    return content


def load_brief(args) -> dict:
    """Load the site brief from --brief, --brief-stdin, or individual flags."""
    if args.brief:
        brief = json.loads(Path(args.brief).read_text(encoding="utf-8"))
    elif args.brief_stdin:
        brief = json.loads(sys.stdin.read())
    else:
        # Build from individual flags
        if not (args.brand and args.city and args.county and args.phone and args.tel
                and args.street and args.postal):
            print("ERROR: provide --brief <file>, --brief-stdin, or all of "
                  "--brand --city --county --phone --tel --street --postal", file=sys.stderr)
            sys.exit(2)
        brief = {
            "domain": args.domain,
            "brand": args.brand,
            "city": args.city,
            "county": args.county,
            "phone_display": args.phone,
            "phone_tel": args.tel,
            "street": args.street,
            "postal": args.postal,
            "email": args.email or f"contact@{args.domain}",
            "service_areas": args.service_areas or [args.city],
        }
    # Validate required keys
    required = ["domain", "brand", "city", "county", "phone_display", "phone_tel", "street", "postal"]
    missing = [k for k in required if not brief.get(k)]
    if missing:
        print(f"ERROR: brief missing required keys: {', '.join(missing)}", file=sys.stderr)
        sys.exit(2)
    return brief


def main() -> None:
    p = argparse.ArgumentParser(description="Scaffold a new HVAC site (no WP source).")
    p.add_argument("domain", nargs="?", help="Site domain (e.g. exeterheatingcooling.ca)")
    p.add_argument("--brief", help="Path to a JSON brief file")
    p.add_argument("--brief-stdin", action="store_true", help="Read JSON brief from stdin")
    # Individual flag fallbacks
    p.add_argument("--brand")
    p.add_argument("--city")
    p.add_argument("--county")
    p.add_argument("--phone", dest="phone", help="Display phone e.g. (519) 555-0123")
    p.add_argument("--tel", dest="tel", help="tel: phone e.g. +15195550123")
    p.add_argument("--email")
    p.add_argument("--street")
    p.add_argument("--postal")
    p.add_argument("--service-areas", nargs="*", dest="service_areas")
    args = p.parse_args()

    brief = load_brief(args)
    domain = brief["domain"]

    # Sanity: domain must look like a .ca domain
    if "." not in domain:
        print(f"ERROR: '{domain}' doesn't look like a domain", file=sys.stderr)
        sys.exit(2)

    config_path = SITES_DIR / f"{domain}.ts"
    content_dir = SITES_DIR / domain
    content_path = content_dir / "content.ts"

    # Don't clobber an existing site
    if config_path.exists():
        print(f"ERROR: {config_path.relative_to(ROOT)} already exists. Remove it first to re-scaffold.",
              file=sys.stderr)
        sys.exit(1)

    # De-confliction: refuse to build a town already covered under a different
    # domain variant. Prevents duplicate-content cannibalization (e.g. building
    # listowelhvacpro.ca when listowelheatingcooling.ca already exists). Checks
    # the `city` field across all existing configs for a case-insensitive match.
    import re
    brief_city = brief.get("city", "").strip().lower()
    if brief_city:
        city_re = re.compile(r'^\s*city:\s*"([^"]+)"', re.MULTILINE | re.IGNORECASE)
        for cfg in sorted(SITES_DIR.glob("*.ts")):
            try:
                text = cfg.read_text(encoding="utf-8")
            except OSError:
                continue
            m = city_re.search(text)
            if m and m.group(1).strip().lower() == brief_city:
                print(f"ERROR: town '{brief['city']}' is already covered by "
                      f"{cfg.name} (de-confliction). Building a second site for "
                      f"the same town creates duplicate-content cannibalization. "
                      f"To override, remove that guard check explicitly.",
                      file=sys.stderr)
                sys.exit(1)

    content_dir.mkdir(parents=True, exist_ok=True)

    config_ts = emit_config(brief)
    content_ts = emit_content(brief)

    config_path.write_text(config_ts, encoding="utf-8")
    content_path.write_text(content_ts, encoding="utf-8")

    print(f"OK  {domain}")
    print(f"  config:  {config_path.relative_to(ROOT)}")
    print(f"  content: {content_path.relative_to(ROOT)}")
    print(f"  brand:   {brief['brand']}")
    print(f"  city:    {brief['city']}, {brief['county']}")
    print()
    print("Next: build with")
    print(f"  HVAC_SITE={domain} ./scripts/build-site.sh")
    print("Then author real content (see hvac-site-builder skill).")


if __name__ == "__main__":
    main()
