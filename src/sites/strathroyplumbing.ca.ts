// Per-site config for strathroyplumbing.ca
// Plumbing lead-gen (plumbing-astro). Fulfiller: Hayter Group / Premier plumbing.
// Strathroy-Caradoc, Middlesex County. ⚠️ PLACEHOLDER NAP (2026-08-07).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "strathroyplumbing.ca",
  url: "https://strathroyplumbing.ca",
  brand: "Strathroy Plumbing",
  brandHtml: "Strathroy Plumbing",
  city: "Strathroy",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 555-0148", tel: "+15195550148" }, // PLACEHOLDER
  email: "contact@strathroyplumbing.ca",
  address: {
    street: "PLACEHOLDER Street West", // PLACEHOLDER
    locality: "Strathroy",
    region: 'ON',
    postal: "N7V 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Strathroy', 'Mount Brydges', 'Komoka', 'Melbourne', 'Glencoe', 'Parkhill'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://strathroyplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
};
