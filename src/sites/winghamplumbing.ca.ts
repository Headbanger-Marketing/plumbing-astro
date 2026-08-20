// Per-site config for winghamplumbing.ca
// Plumbing lead-gen (plumbing-astro). Wingham, Huron County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "winghamplumbing.ca",
  url: "https://winghamplumbing.ca",
  brand: "Wingham Plumbing",
  brandHtml: "Wingham Plumbing",
  city: "Wingham",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(519) 555-0122", tel: "+15195550122" }, // PLACEHOLDER
  email: "contact@winghamplumbing.ca",
  address: {
    street: "PLACEHOLDER Josephine Street", // PLACEHOLDER
    locality: "Wingham",
    region: 'ON',
    postal: "N0G 2W0", // PLACEHOLDER
  },
  serviceAreas: ['Wingham', 'Blyth', 'Lucknow', 'Teeswater', 'Clinton', 'Goderich', 'Listowel'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://winghamplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
