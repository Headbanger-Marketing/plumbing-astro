// Per-site config for bayfieldplumbing.ca
// Plumbing lead-gen (plumbing-astro). Bayfield, Huron County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "bayfieldplumbing.ca",
  url: "https://bayfieldplumbing.ca",
  brand: "Bayfield Plumbing",
  brandHtml: "Bayfield Plumbing",
  city: "Bayfield",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(519) 555-0176", tel: "+15195550176" }, // PLACEHOLDER
  email: "contact@bayfieldplumbing.ca",
  address: {
    street: "PLACEHOLDER Mill Street", // PLACEHOLDER
    locality: "Bayfield",
    region: 'ON',
    postal: "N0M 1G0", // PLACEHOLDER
  },
  serviceAreas: ['Bayfield', 'Goderich', 'Clinton', 'Zurich', 'Grand Bend', 'Egmondville', 'Kippen'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://bayfieldplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
