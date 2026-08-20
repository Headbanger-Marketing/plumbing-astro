// Per-site config for stmarysplumbing.ca
// Plumbing lead-gen (plumbing-astro). St. Marys, Perth County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "stmarysplumbing.ca",
  url: "https://stmarysplumbing.ca",
  brand: "St. Marys Plumbing",
  brandHtml: "St. Marys Plumbing",
  city: "St. Marys",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Perth",
  phone: { display: "(519) 555-0165", tel: "+15195550165" }, // PLACEHOLDER
  email: "contact@stmarysplumbing.ca",
  address: {
    street: "PLACEHOLDER Queen Street", // PLACEHOLDER
    locality: "St. Marys",
    region: 'ON',
    postal: "N4X 1A1", // PLACEHOLDER
  },
  serviceAreas: ['St. Marys', 'Stratford', 'Kirkton', 'Thorndale', 'Embro', 'Thamesford', 'Sebringville'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://stmarysplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
