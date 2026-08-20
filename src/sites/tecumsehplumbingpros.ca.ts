// Per-site config for tecumsehplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Tecumseh, Essex County, on Lake St. Clair
// east of Windsor. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "tecumsehplumbingpros.ca",
  url: "https://tecumsehplumbingpros.ca",
  brand: "Tecumseh Plumbing Pros",
  brandHtml: "Tecumseh Plumbing Pros",
  city: "Tecumseh",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(519) 555-0163", tel: "+15195550163" }, // PLACEHOLDER
  email: "contact@tecumsehplumbingpros.ca",
  address: {
    street: "PLACEHOLDER County Road", // PLACEHOLDER
    locality: "Tecumseh",
    region: 'ON',
    postal: "N8N 2B6", // PLACEHOLDER
  },
  serviceAreas: ['Tecumseh', 'Windsor', 'Lakeshore', 'LaSalle', 'Stoney Point', 'Belle River', 'Essex'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://tecumsehplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
