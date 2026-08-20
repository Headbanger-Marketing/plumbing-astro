// Per-site config for norfolkplumbing.ca
// Plumbing lead-gen (plumbing-astro). Norfolk, Norfolk County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "norfolkplumbing.ca",
  url: "https://norfolkplumbing.ca",
  brand: "Norfolk Plumbing",
  brandHtml: "Norfolk Plumbing",
  city: "Norfolk",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Norfolk",
  phone: { display: "(519) 555-0125", tel: "+15195550125" }, // PLACEHOLDER
  email: "contact@norfolkplumbing.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Norfolk",
    region: 'ON',
    postal: "N0E 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Norfolk', 'Simcoe', 'Delhi', 'Port Dover', 'Waterford', 'Langton', 'Port Rowan'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://norfolkplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
