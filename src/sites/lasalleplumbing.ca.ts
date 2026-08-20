// Per-site config for lasalleplumbing.ca
// Plumbing lead-gen (plumbing-astro). LaSalle, Essex County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "lasalleplumbing.ca",
  url: "https://lasalleplumbing.ca",
  brand: "LaSalle Plumbing",
  brandHtml: "LaSalle Plumbing",
  city: "LaSalle",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(519) 555-0137", tel: "+15195550137" }, // PLACEHOLDER
  email: "contact@lasalleplumbing.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "LaSalle",
    region: 'ON',
    postal: "N9H 2G8", // PLACEHOLDER
  },
  serviceAreas: ['LaSalle', 'Windsor', 'Amherstburg', 'Tecumseh', 'McGregor', 'Essex', 'Lakeshore'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://lasalleplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
