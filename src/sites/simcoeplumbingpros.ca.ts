// Per-site config for simcoeplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Simcoe, Norfolk County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "simcoeplumbingpros.ca",
  url: "https://simcoeplumbingpros.ca",
  brand: "Simcoe Plumbing Pros",
  brandHtml: "Simcoe Plumbing Pros",
  city: "Simcoe",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Norfolk",
  phone: { display: "(519) 555-0124", tel: "+15195550124" }, // PLACEHOLDER
  email: "contact@simcoeplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Simcoe",
    region: 'ON',
    postal: "N3Y 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Simcoe', 'Port Dover', 'Delhi', 'Waterford', 'Jarvis', 'Courtland', 'Vittoria'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://simcoeplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
