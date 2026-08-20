// Per-site config for saugeenshoresplumbing.ca
// Plumbing lead-gen (plumbing-astro). Saugeen Shores, Bruce County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "saugeenshoresplumbing.ca",
  url: "https://saugeenshoresplumbing.ca",
  brand: "Saugeen Shores Plumbing",
  brandHtml: "Saugeen Shores Plumbing",
  city: "Saugeen Shores",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Bruce",
  phone: { display: "(519) 555-0124", tel: "+15195550124" }, // PLACEHOLDER
  email: "contact@saugeenshoresplumbing.ca",
  address: {
    street: "PLACEHOLDER Goderich Street", // PLACEHOLDER
    locality: "Saugeen Shores",
    region: 'ON',
    postal: "N0H 2C0", // PLACEHOLDER
  },
  serviceAreas: ['Saugeen Shores', 'Port Elgin', 'Southampton', 'Inverhuron', 'Northport', 'Tara', 'Paisley'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://saugeenshoresplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
