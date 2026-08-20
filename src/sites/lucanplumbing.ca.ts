// Per-site config for lucanplumbing.ca
// Plumbing lead-gen (plumbing-astro). Lucan, Middlesex County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "lucanplumbing.ca",
  url: "https://lucanplumbing.ca",
  brand: "Lucan Plumbing",
  brandHtml: "Lucan Plumbing",
  city: "Lucan",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 555-0183", tel: "+15195550183" }, // PLACEHOLDER
  email: "contact@lucanplumbing.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Lucan",
    region: 'ON',
    postal: "N0M 2J0", // PLACEHOLDER
  },
  serviceAreas: ['Lucan', 'Parkhill', 'Ailsa Craig', 'Granton', 'Denfield', 'Exeter', 'London'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://lucanplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
