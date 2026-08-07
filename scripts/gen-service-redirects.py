#!/usr/bin/env python3
"""Generate static redirect HTML pages for old WP service slugs -> Astro slugs.

Emits dist/<domain>/services/<old-slug>/index.html for each old slug, doing a
meta-refresh + JS redirect to the new slug. Works on GitHub Pages (no CF proxy
required), is in source control, applies uniformly to every site.

Why this exists: WP sites used varied service-page slugs (e.g. /services/ductless-ac/,
/services/fireplace-repair-installation-services/). The Astro build standardizes on
7 canonical slugs. When migrating WP sites to Astro via DNS flip, indexed/external
links to the old slugs would 404. Cloudflare redirect rules don't help because GH
Pages requires dns-only records (CF proxy is bypassed). So we emit real HTML pages
at the old slugs that redirect client-side.

Usage: HVAC_SITE=<domain> python3 scripts/gen-service-redirects.py
"""
import json
import os
import sys

# old slug -> new slug (23 mappings, covers all old WP variants across the fleet)
MAPPING = {
    'ac-repair-installation-services': 'ac-repair',
    'air-conditioning-installation-repair-services': 'ac-repair',
    'air-conditioning-repair': 'ac-repair',
    'air-conditioning-repair-installation-services': 'ac-repair',
    'air-duct-cleaning-services': 'duct-cleaning',
    'duct-cleaning-services': 'duct-cleaning',
    'ductless-ac': 'ductless-ac-installation',
    'ductless-ac-repair-installation': 'ductless-ac-installation',
    'ductless-air-conditioning-installation-service': 'ductless-ac-installation',
    'ductless-air-conditioning-repair-installation': 'ductless-ac-installation',
    'ductless-air-conditioning-services': 'ductless-ac-installation',
    'fireplace-installation-repair': 'fireplace-installation',
    'fireplace-installation-service': 'fireplace-installation',
    'fireplace-repair': 'fireplace-installation',
    'fireplace-repair-installation': 'fireplace-installation',
    'fireplace-repair-installation-services': 'fireplace-installation',
    'furnace-repair-installation-services': 'furnace-repair',
    'heat-pump-installation-service': 'heat-pump-repair-installation',
    'heat-pump-repair': 'heat-pump-repair-installation',
    'heat-pump-repair-installation-services': 'heat-pump-repair-installation',
    'thermostat-repair': 'thermostat-repair-replacement',
    'thermostat-repair-replacement-services': 'thermostat-repair-replacement',
    'thermostat-repair-replacement-strathroy-heating-cooling': 'thermostat-repair-replacement',
}

REDIRECT_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting...</title>
<link rel="canonical" href="{new_url}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url={new_url}">
<script>window.location.replace("{new_url}");</script>
</head>
<body>
<p>This page has moved. <a href="{new_url}">Redirecting you...</a></p>
</body>
</html>
"""


def main():
    domain = os.environ.get('HVAC_SITE')
    if not domain:
        sys.exit('HVAC_SITE env var required')
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dist = os.path.join(root, 'dist', domain)
    if not os.path.isdir(dist):
        sys.exit(f'dist/{domain} not found. Run astro build first.')

    created = 0
    skipped = 0
    for old, new in MAPPING.items():
        # skip if old == new (no redirect needed)
        if old == new:
            continue
        out_dir = os.path.join(dist, 'services', old)
        out_file = os.path.join(out_dir, 'index.html')
        new_url = f'/services/{new}/'
        # skip if the canonical target page doesn't exist on this site.
        # Vertical (homepage-only) sites generate no service pages, so emitting
        # HVAC redirect stubs here would point at /services/<new>/ that 404.
        if not os.path.exists(os.path.join(dist, 'services', new, 'index.html')):
            skipped += 1
            continue
        # skip if the old slug happens to be a real page (it isn't, but be safe)
        if os.path.exists(os.path.join(dist, 'services', old, 'index.html')) and old in [
            'ac-repair', 'duct-cleaning', 'ductless-ac-installation', 'fireplace-installation',
            'furnace-repair', 'heat-pump-repair-installation', 'thermostat-repair-replacement'
        ]:
            skipped += 1
            continue
        os.makedirs(out_dir, exist_ok=True)
        with open(out_file, 'w') as f:
            f.write(REDIRECT_HTML.format(new_url=new_url))
        created += 1
    print(f'[redirects] {domain}: created {created} redirect pages ({skipped} skipped)')


if __name__ == '__main__':
    main()
