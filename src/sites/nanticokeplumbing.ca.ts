// Per-site config for nanticokeplumbing.ca
// Plumbing lead-gen (plumbing-astro). Nanticoke, Haldimand County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "nanticokeplumbing.ca",
  url: "https://nanticokeplumbing.ca",
  brand: "Nanticoke Plumbing",
  brandHtml: "Nanticoke Plumbing",
  city: "Nanticoke",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Haldimand",
  phone: { display: "(905) 555-0137", tel: "+19055550137" }, // PLACEHOLDER
  email: "contact@nanticokeplumbing.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Nanticoke",
    region: 'ON',
    postal: "N0A 1L0", // PLACEHOLDER
  },
  serviceAreas: ['Nanticoke', 'Hagersville', 'Cayuga', 'Dunnville', 'Jarvis', 'Port Dover'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://nanticokeplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
