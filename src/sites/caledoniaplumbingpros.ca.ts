// Per-site config for caledoniaplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Caledonia, Haldimand County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "caledoniaplumbingpros.ca",
  url: "https://caledoniaplumbingpros.ca",
  brand: "Caledonia Plumbing Pros",
  brandHtml: "Caledonia Plumbing Pros",
  city: "Caledonia",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Haldimand",
  phone: { display: "(905) 555-0127", tel: "+19055550127" }, // PLACEHOLDER
  email: "contact@caledoniaplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Caledonia",
    region: 'ON',
    postal: "N3A 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Caledonia', 'Hagersville', 'Dunnville', 'Cayuga', 'Fisherville', 'Jarvis', 'Townsend'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://caledoniaplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
