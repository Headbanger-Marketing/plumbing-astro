// Shared content for the HVAC network.
// Per-site content (SVC, BLOG, REVIEW_POOL, HOME_SERVICES, HOME_FAQ) lives in
// src/sites/<domain>/content.ts (auto-extracted from build_pages.py).
// This module holds only the truly shared catalog data, types, and helpers.

// ---- Service catalog (matches build.py::SERVICES) ----
// Same 7 services on every site; only the per-service prose differs.
export interface ServiceRef {
  slug: string;
  nav: string; // HTML-safe label (&amp; for &)
  icon: string;
}

export const SERVICES: ServiceRef[] = [
  { slug: 'water-heaters', nav: 'Water Heaters', icon: 'flame' },
  { slug: 'drain-cleaning', nav: 'Drain Cleaning', icon: 'refresh' },
  { slug: 'repiping', nav: 'Repiping', icon: 'wrench' },
  { slug: 'fixtures-toilets', nav: 'Fixtures &amp; Toilets', icon: 'home' },
  { slug: 'leak-detection', nav: 'Leak Detection &amp; Repair', icon: 'droplets' },
  { slug: 'sump-pumps', nav: 'Sump Pumps &amp; Backwater', icon: 'shield' },
  { slug: 'water-softeners', nav: 'Water Softeners &amp; Filtration', icon: 'gauge' },
];

// ---- Shared types (per-site content.ts files conform to these) ----
export interface ServiceDetail {
  icon: string;
  kicker: string;
  h1: string;
  intro: string;
  meta: string;
  problem_h: string;
  problem_p: string;
  features: [icon: string, title: string, body: string][];
  rev: [number, number, number];
}

export interface ServicePhoto {
  src: string;
  alt: string;
  w: number;
  h: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  seo_title: string;
  date: string;
  date_h: string;
  img: 'cool' | 'warm';
  icon: string;
  photo: string;
  photo_h: number;
  photo_alt: string;
  excerpt: string;
  meta: string;
  body: string; // HTML
}

// Location-page content for hub sites (service-area sub-pages).
export interface LocationDetail {
  name: string;         // Display name, e.g. "Hensall"
  intro: string;        // ~60 word intro paragraph (HTML, brand auto-linked)
  meta: string;         // ~20 word meta description (plain text)
  nearby: string[];     // Nearby communities for context
  faq: [q: string, a: string][]; // 2-4 location-specific Q/A pairs
}

export interface SiteContent {
  SVC: Record<string, ServiceDetail>;
  BLOG: BlogPost[];
  REVIEW_POOL: [text: string, name: string, place: string][];
  HOME_SERVICES: [icon: string, title: string, text: string, url: string][];
  HOME_FAQ?: [q: string, a: string][]; // may be partial (f-string entries skipped)
  SVC_PHOTO?: Record<string, [src: string, alt: string, w: number, h: number]>;
  LOCATIONS?: Record<string, LocationDetail>; // location sub-pages for hub sites
}

// ---- Related-service matcher (build_pages.py::related_service) ----
export function relatedService(post: { slug: string; title: string }): [url: string, label: string] {
  const hay = `${post.slug} ${post.title}`.toLowerCase();
  const hints: [kw: string, slugHint: string][] = [
    ['ductless', 'ductless-ac'],
    ['heat pump', 'heat-pump'],
    ['heat-pump', 'heat-pump'],
    ['furnace', 'furnace'],
    ['boiler', 'boiler-service'],
    ['heating', 'furnace'],
    ['air conditioner', 'ac-repair'],
    ['air-condition', 'ac-repair'],
    ['cooling', 'ac-repair'],
    ['humid', 'ac-repair'],
    ['summer', 'ac-repair'],
    ['duct', 'duct-cleaning'],
    ['air quality', 'duct-cleaning'],
    ['thermostat', 'thermostat'],
    ['fireplace', 'fireplace'],
  ];
  for (const [kw, slugHint] of hints) {
    if (hay.includes(kw)) {
      for (const s of SERVICES) {
        if (s.slug.includes(slugHint)) {
          return [`/services/${s.slug}/`, s.nav.replace(/&amp;/g, '&')];
        }
      }
    }
  }
  return ['/services/', 'HVAC service'];
}
