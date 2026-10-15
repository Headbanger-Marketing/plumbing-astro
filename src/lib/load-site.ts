// Loader that resolves the active site's config + per-site content in one call.
// Pages call loadSite() once at the top of their frontmatter and get both back.
//
// The active site is selected by the HVAC_SITE env var (set by the build orchestrator
// and astro.config.mjs). Per-site content is auto-extracted from build_pages.py.

import type { SiteConfig } from './types';
import { phoneVisibility } from './phone-visibility';
import type { SiteContent } from '../data/content';

export interface LoadedSite {
  site: SiteConfig;
  content: SiteContent;
}

// Cache per build (each page in the same build hits this once).
let _cache: LoadedSite | null = null;

export async function loadSite(): Promise<LoadedSite> {
  if (_cache) return _cache;
  const siteName = process.env.HVAC_SITE!;
  const site: SiteConfig = phoneVisibility((await import(`../sites/${siteName}.ts`)).site);
  const c = await import(`../sites/${siteName}/content.ts`);
  // Explicit local FAQs are shared by visible accordions and FAQPage schema.
  const faq = (await import(`../sites/${siteName}/faq-content.json`)).default;
  const pairs = (entries: { q: string; a: string }[]): [string, string][] =>
    entries.map(({ q, a }) => [q, a]);
  if (faq.home.length < 5) throw new Error(`${siteName}: at least five home FAQs are required`);
  const locations = Object.fromEntries(Object.entries(c.LOCATIONS || {}).map(([slug, location]) => {
    const entries = faq.locations[slug];
    if (!entries || entries.length < 5) throw new Error(`${siteName}/${slug}: missing local FAQs`);
    return [slug, { ...(location as object), faq: pairs(entries) }];
  })) as SiteContent['LOCATIONS'];
  const content: SiteContent = {
    HOME: c.HOME,
    SVC: c.SVC,
    BLOG: c.BLOG,
    REVIEW_POOL: [],
    HOME_SERVICES: c.HOME_SERVICES,
    HOME_FAQ: pairs(faq.home),
    SVC_PHOTO: c.SVC_PHOTO,
    LOCATIONS: locations,
  };
  _cache = { site, content };
  return _cache;
}
