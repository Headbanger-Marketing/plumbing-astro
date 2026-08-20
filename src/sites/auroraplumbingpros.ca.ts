// Per-site config for auroraplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Aurora, York County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "auroraplumbingpros.ca",
  url: "https://auroraplumbingpros.ca",
  brand: "Aurora Plumbing Pros",
  brandHtml: "Aurora Plumbing Pros",
  city: "Aurora",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "York",
  phone: { display: "(905) 555-0164", tel: "+19055550164" }, // PLACEHOLDER
  email: "contact@auroraplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Aurora",
    region: 'ON',
    postal: "L4G 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Aurora', 'Newmarket', 'Oak Ridges', 'King City', 'Sharon', 'Schomberg'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://auroraplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
