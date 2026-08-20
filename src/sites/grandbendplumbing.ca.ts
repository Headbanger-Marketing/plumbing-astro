// Per-site config for grandbendplumbing.ca
// Plumbing lead-gen (plumbing-astro). Grand Bend, Lambton County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "grandbendplumbing.ca",
  url: "https://grandbendplumbing.ca",
  brand: "Grand Bend Plumbing",
  brandHtml: "Grand Bend Plumbing",
  city: "Grand Bend",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Lambton",
  phone: { display: "(519) 555-0198", tel: "+15195550198" }, // PLACEHOLDER
  email: "contact@grandbendplumbing.ca",
  address: {
    street: "PLACEHOLDER Main Street West", // PLACEHOLDER
    locality: "Grand Bend",
    region: 'ON',
    postal: "N0M 1T0", // PLACEHOLDER
  },
  serviceAreas: ['Grand Bend', 'Bayfield', 'Forest', 'Thedford', 'Port Franks', 'Parkhill', 'Exeter'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://grandbendplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
