// Per-site config for wallaceburgplumbing.ca
// Plumbing lead-gen (plumbing-astro). Wallaceburg, Chatham-Kent. ⚠️ PLACEHOLDER NAP (2026-08-19).
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
  phone: { display: "(519) 555-0138", tel: "+15195550138" }, // PLACEHOLDER
  email: "contact@wallaceburgplumbing.ca",
  address: {
    street: "PLACEHOLDER Street South", // PLACEHOLDER
    locality: "Wallaceburg",
    region: 'ON',
    postal: "N8A 1A1", // PLACEHOLDER
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
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
