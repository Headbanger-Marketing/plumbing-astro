// Per-site config for goderichplumbing.ca
// Plumbing lead-gen (plumbing-astro). Goderich, Huron County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "goderichplumbing.ca",
  url: "https://goderichplumbing.ca",
  brand: "Goderich Plumbing",
  brandHtml: "Goderich Plumbing",
  city: "Goderich",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(519) 555-0143", tel: "+15195550143" }, // PLACEHOLDER
  email: "contact@goderichplumbing.ca",
  address: {
    street: "PLACEHOLDER Huron Road", // PLACEHOLDER
    locality: "Goderich",
    region: 'ON',
    postal: "N7A 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Goderich', 'Clinton', 'Bayfield', 'Vanastra', 'Holmesville', 'Blyth', 'Auburn'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://goderichplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
