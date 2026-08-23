// Per-site config for wallaceburgplumbing.ca
// Plumbing lead-gen (plumbing-astro). Wallaceburg, Chatham-Kent. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "wallaceburgplumbing.ca",
  url: "https://wallaceburgplumbing.ca",
  brand: "Wallaceburg Plumbing",
  brandHtml: "Wallaceburg Plumbing",
  city: "Wallaceburg",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Chatham-Kent",
  phone: { display: "(519) 627-4183", tel: "+15196274183" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@wallaceburgplumbing.ca",
  address: {
    street: "120 James St",
    locality: "Wallaceburg",
    region: 'ON',
    postal: "N8A 2N1",
  },
  serviceAreas: ['Wallaceburg', 'Chatham', 'Chatham-Kent', 'Ridgetown', 'Dresden', 'Port Lambton'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://wallaceburgplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "wallaceburgplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
