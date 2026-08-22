// Per-site config for chathamkentplumbing.ca
// Plumbing lead-gen (plumbing-astro). Chatham-Kent municipality-wide hub site. ⚠️ PLACEHOLDER NAP — still TO FILL (NAP-WORKSHEET; no HVAC-estate source).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "chathamkentplumbing.ca",
  url: "https://chathamkentplumbing.ca",
  brand: "Chatham-Kent Plumbing",
  brandHtml: "Chatham-Kent Plumbing",
  city: "Chatham-Kent",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Chatham-Kent",
  phone: { display: "(519) 555-0134", tel: "+15195550134" }, // PLACEHOLDER
  email: "contact@chathamkentplumbing.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Chatham-Kent",
    region: 'ON',
    postal: "N7M 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Chatham-Kent', 'Chatham', 'Wallaceburg', 'Ridgetown', 'Blenheim', 'Tilbury', 'Wheatley'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://chathamkentplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
