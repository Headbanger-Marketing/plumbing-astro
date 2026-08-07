// Environment-driven Astro config for the HVAC network.
// One project builds any site by setting HVAC_SITE=<domain>.
// Examples:
//   HVAC_SITE=londonheatingcooling.ca npm run build
//   HVAC_SITE=londonhvacpros.ca   npm run build
//
// Output goes to ./dist/<domain>/ so build-all.sh can iterate without clobbering.

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';

const SITE = process.env.HVAC_SITE;

if (!SITE) {
  console.error(
    '\n[astro.config] HVAC_SITE env var required.\n' +
      'Usage: HVAC_SITE=londonheatingcooling.ca npm run build\n'
  );
  process.exit(1);
}

// Dynamic import keeps each site's config file the single source of truth.
const mod = await import(`./src/sites/${SITE}.ts`);
const site = mod.site;

if (!site || !site.url) {
  console.error(`[astro.config] src/sites/${SITE}.ts did not export a valid site config.`);
  process.exit(1);
}

// Vertical sites (generator/geothermal) are homepage-only — exclude service
// and blog pages from the sitemap (they redirect to / but shouldn't be indexed).
const isVertical = site.vertical && site.vertical !== 'hvac';

export default defineConfig({
  site: site.url,
  integrations: [
    sitemap({
      filter: (page) => {
        if (isVertical) {
          // Exclude /services/ and /blog/ for vertical sites
          if (page.includes('/services/') || page.includes('/blog/')) return false;
        }
        // /thank-you/ is noindex (conversion page, not a ranking target).
        if (page.includes('/thank-you/')) return false;
        return true;
      },
    }),
  ],
  build: { format: 'directory' }, // /slug/index.html — preserves live permalinks
  outDir: fileURLToPath(new URL(`./dist/${SITE}/`, import.meta.url)),
  compressHTML: false, // match affiliate estate convention; easier parity diffs
});
