// Per-site config for exeterplumbing.ca
// Plumbing lead-gen (plumbing-astro). Exeter, Huron County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "exeterplumbing.ca",
  url: "https://exeterplumbing.ca",
  brand: "Exeter Plumbing",
  brandHtml: "Exeter Plumbing",
  city: "Exeter",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(519) 555-0132", tel: "+15195550132" }, // PLACEHOLDER
  email: "contact@exeterplumbing.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Exeter",
    region: 'ON',
    postal: "N0M 1S0", // PLACEHOLDER
  },
  serviceAreas: ['Exeter', 'Grand Bend', 'Seaforth', 'Dashwood', 'Crediton', 'Huron Park', 'Centralia'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://exeterplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
