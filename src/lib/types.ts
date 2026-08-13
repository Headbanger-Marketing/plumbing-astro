// Shared type for all per-site config objects.
// Each src/sites/<domain>.ts exports an object satisfying this shape.

export interface SiteConfig {
  domain: string;
  url: string;
  brand: string; // raw brand, e.g. "London Heating & Cooling"
  brandHtml: string; // HTML-escaped brand, e.g. "London Heating &amp; Cooling"
  city: string;
  region: string;
  regionAbbr: string;
  county: string;
  phone: { display: string; tel: string };
  // Optional override for the number that appears in JSON-LD schema (NAP
  // citation consistency). Falls back to `phone` when unset. Use this when
  // the visible/dialable number (footer, meta text) needs to differ from
  // the number already cited in existing local-SEO citations.
  citationPhone?: { display: string; tel: string };
  email: string;
  address: {
    street: string;
    locality: string;
    region: string;
    postal: string;
  };
  serviceAreas: string[];
  palette: {
    navy: string;
    accent: string;
    accent2: string;
    themeColor: string;
  };
  ogImage: string;
  tracking: {
    webhookUrl: string;
  };
  // Per-site media. technicianPhoto = filename under /assets/img/wp/ (no path
  // prefix). Falls back to 'wp/default-hvac-technician.jpg' so brand-new sites
  // with no assets still render a real photo instead of a broken London ref.
  media?: {
    technicianPhoto?: string;
    // Logo filename under /assets/img/logos/. Falls back to /assets/img/logo.png
    // (the shared default) for sites without a per-site logo.
    logo?: string;
  };
  // Vertical flag: 'hvac' (or undefined = default HVAC behavior) gets full
  // service + blog pages. 'generator' or 'geothermal' = homepage-only site
  // (no service/blog pages generated; homepage is the money page).
  vertical?: 'hvac' | 'generator' | 'geothermal' | 'solar';
  // When true, every page emits <meta name="robots" content="noindex, nofollow">.
  // Set on sites built but not yet live on their real registered domain.
  noindex?: boolean;
}
