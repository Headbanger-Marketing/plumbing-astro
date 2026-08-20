// Per-site config for forestplumbing.ca
// Plumbing lead-gen (plumbing-astro). Forest, Lambton County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "forestplumbing.ca",
  url: "https://forestplumbing.ca",
  brand: "Forest Plumbing",
  brandHtml: "Forest Plumbing",
  city: "Forest",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Lambton",
  phone: { display: "(519) 555-0144", tel: "+15195550144" }, // PLACEHOLDER
  email: "contact@forestplumbing.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Forest",
    region: 'ON',
    postal: "N0N 1J0", // PLACEHOLDER
  },
  serviceAreas: ['Forest', 'Thedford', 'Arkona', 'Grand Bend', 'Petrolia', 'Sarnia'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://forestplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
