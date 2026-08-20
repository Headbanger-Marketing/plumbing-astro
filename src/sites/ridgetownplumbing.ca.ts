// Per-site config for ridgetownplumbing.ca
// Plumbing lead-gen (plumbing-astro). Ridgetown, Chatham-Kent. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ridgetownplumbing.ca",
  url: "https://ridgetownplumbing.ca",
  brand: "Ridgetown Plumbing",
  brandHtml: "Ridgetown Plumbing",
  city: "Ridgetown",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Chatham-Kent",
  phone: { display: "(519) 555-0136", tel: "+15195550136" }, // PLACEHOLDER
  email: "contact@ridgetownplumbing.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Ridgetown",
    region: 'ON',
    postal: "N0P 2P0", // PLACEHOLDER
  },
  serviceAreas: ['Ridgetown', 'Chatham', 'Chatham-Kent', 'Blenheim', 'Highgate', 'Wheatley'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ridgetownplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
