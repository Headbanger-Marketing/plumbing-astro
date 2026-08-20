// Per-site config for glencoeplumbing.ca
// Plumbing lead-gen (plumbing-astro). Glencoe, Middlesex County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "glencoeplumbing.ca",
  url: "https://glencoeplumbing.ca",
  brand: "Glencoe Plumbing",
  brandHtml: "Glencoe Plumbing",
  city: "Glencoe",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 555-0126", tel: "+15195550126" }, // PLACEHOLDER
  email: "contact@glencoeplumbing.ca",
  address: {
    street: "PLACEHOLDER Station Street", // PLACEHOLDER
    locality: "Glencoe",
    region: 'ON',
    postal: "N0L 1M0", // PLACEHOLDER
  },
  serviceAreas: ['Glencoe', 'Bothwell', 'Wardsville', 'Newbury', 'Mount Brydges', 'Strathroy', 'West Lorne'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://glencoeplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
