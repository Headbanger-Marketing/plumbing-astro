// Per-site config for clintonplumbing.ca
// Plumbing lead-gen (plumbing-astro). Clinton, Huron County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "clintonplumbing.ca",
  url: "https://clintonplumbing.ca",
  brand: "Clinton Plumbing",
  brandHtml: "Clinton Plumbing",
  city: "Clinton",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(519) 555-0187", tel: "+15195550187" }, // PLACEHOLDER
  email: "contact@clintonplumbing.ca",
  address: {
    street: "PLACEHOLDER Victoria Street", // PLACEHOLDER
    locality: "Clinton",
    region: 'ON',
    postal: "N0M 1L0", // PLACEHOLDER
  },
  serviceAreas: ['Clinton', 'Seaforth', 'Goderich', 'Bayfield', 'Vanastra', 'Holmesville', 'Londesborough'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://clintonplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
