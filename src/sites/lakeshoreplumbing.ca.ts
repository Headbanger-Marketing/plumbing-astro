// Per-site config for lakeshoreplumbing.ca
// Plumbing lead-gen (plumbing-astro). Lakeshore, Essex County, the string of
// Lake St. Clair communities from Belle River through Comber and Stoney Point.
// ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "lakeshoreplumbing.ca",
  url: "https://lakeshoreplumbing.ca",
  brand: "Lakeshore Plumbing",
  brandHtml: "Lakeshore Plumbing",
  city: "Lakeshore",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(519) 555-0171", tel: "+15195550171" }, // PLACEHOLDER
  email: "contact@lakeshoreplumbing.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Lakeshore",
    region: 'ON',
    postal: "N0R 1C6", // PLACEHOLDER
  },
  serviceAreas: ['Lakeshore', 'Belle River', 'Stoney Point', 'Comber', 'Tecumseh', 'Windsor', 'Ruscomb'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://lakeshoreplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
