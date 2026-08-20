// Per-site config for portdoverplumbing.ca
// Plumbing lead-gen (plumbing-astro). Port Dover, Norfolk County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "portdoverplumbing.ca",
  url: "https://portdoverplumbing.ca",
  brand: "Port Dover Plumbing",
  brandHtml: "Port Dover Plumbing",
  city: "Port Dover",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Norfolk",
  phone: { display: "(519) 555-0159", tel: "+15195550159" }, // PLACEHOLDER
  email: "contact@portdoverplumbing.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Port Dover",
    region: 'ON',
    postal: "N0A 1N0", // PLACEHOLDER
  },
  serviceAreas: ['Port Dover', 'Simcoe', 'Waterford', 'Delhi', 'Port Rowan', 'Turkey Point'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://portdoverplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
