// Per-site config for stthomasplumbing.ca
// Plumbing lead-gen (plumbing-astro). Fulfiller: Hayter Group / Premier plumbing.
// St. Thomas, Elgin County. ⚠️ PLACEHOLDER NAP (2026-08-07).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "stthomasplumbing.ca",
  url: "https://stthomasplumbing.ca",
  brand: "St. Thomas Plumbing",
  brandHtml: "St. Thomas Plumbing",
  city: "St. Thomas",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Elgin",
  phone: { display: "(519) 555-0148", tel: "+15195550148" }, // PLACEHOLDER
  email: "contact@stthomasplumbing.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "St. Thomas",
    region: 'ON',
    postal: "N5R 1A1", // PLACEHOLDER
  },
  serviceAreas: ['St. Thomas', 'London', 'Aylmer', 'Belmont', 'Port Stanley'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://stthomasplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
};
