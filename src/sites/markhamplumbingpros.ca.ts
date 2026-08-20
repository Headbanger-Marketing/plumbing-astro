// Per-site config for markhamplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Markham, York County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "markhamplumbingpros.ca",
  url: "https://markhamplumbingpros.ca",
  brand: "Markham Plumbing Pros",
  brandHtml: "Markham Plumbing Pros",
  city: "Markham",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "York",
  phone: { display: "(905) 555-0161", tel: "+19055550161" }, // PLACEHOLDER
  email: "contact@markhamplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Markham",
    region: 'ON',
    postal: "L3R 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Markham', 'Unionville', 'Thornhill', 'Stouffville', 'Richmond Hill'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://markhamplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
