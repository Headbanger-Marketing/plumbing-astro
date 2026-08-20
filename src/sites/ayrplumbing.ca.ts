// Per-site config for ayrplumbing.ca
// Plumbing lead-gen (plumbing-astro). Ayr, Waterloo County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ayrplumbing.ca",
  url: "https://ayrplumbing.ca",
  brand: "Ayr Plumbing",
  brandHtml: "Ayr Plumbing",
  city: "Ayr",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo",
  phone: { display: "(519) 555-0125", tel: "+15195550125" }, // PLACEHOLDER
  email: "contact@ayrplumbing.ca",
  address: {
    street: "PLACEHOLDER Mill Street", // PLACEHOLDER
    locality: "Ayr",
    region: 'ON',
    postal: "N0B 1E0", // PLACEHOLDER
  },
  serviceAreas: ['Ayr', 'New Hamburg', 'Baden', 'St. George', 'Paris', 'Cambridge', 'Kitchener'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ayrplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
