// Loader that resolves the active site's config + per-site content in one call.
// Pages call loadSite() once at the top of their frontmatter and get both back.
//
// The active site is selected by the HVAC_SITE env var (set by the build orchestrator
// and astro.config.mjs). Per-site content is auto-extracted from build_pages.py.

import type { SiteConfig } from './types';
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
  const site: SiteConfig = (await import(`../sites/${siteName}.ts`)).site;
  const c = await import(`../sites/${siteName}/content.ts`);
  const content: SiteContent = {
    SVC: c.SVC,
    BLOG: c.BLOG,
    REVIEW_POOL: c.REVIEW_POOL,
    HOME_SERVICES: c.HOME_SERVICES,
    HOME_FAQ: c.HOME_FAQ,
    SVC_PHOTO: c.SVC_PHOTO,
    LOCATIONS: c.LOCATIONS,
  };
  _cache = { site, content };
  return _cache;
}
