// Per-site config for aylmerplumbing.ca
// Plumbing lead-gen (plumbing-astro). Aylmer, Elgin County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "aylmerplumbing.ca",
  url: "https://aylmerplumbing.ca",
  brand: "Aylmer Plumbing",
  brandHtml: "Aylmer Plumbing",
  city: "Aylmer",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Elgin",
  phone: { display: "(519) 555-0137", tel: "+15195550137" }, // PLACEHOLDER
  email: "contact@aylmerplumbing.ca",
  address: {
    street: "PLACEHOLDER Talbot Street", // PLACEHOLDER
    locality: "Aylmer",
    region: 'ON',
    postal: "N5H 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Aylmer', 'Springfield', 'Port Burwell', 'Vienna', 'Malahide', 'Tillsonburg', 'St. Thomas'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://aylmerplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
