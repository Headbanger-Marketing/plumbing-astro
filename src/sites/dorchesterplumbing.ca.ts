// Per-site config for dorchesterplumbing.ca
// Plumbing lead-gen (plumbing-astro). Dorchester, Middlesex County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "dorchesterplumbing.ca",
  url: "https://dorchesterplumbing.ca",
  brand: "Dorchester Plumbing",
  brandHtml: "Dorchester Plumbing",
  city: "Dorchester",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 555-0154", tel: "+15195550154" }, // PLACEHOLDER
  email: "contact@dorchesterplumbing.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Dorchester",
    region: 'ON',
    postal: "N0M 1L0", // PLACEHOLDER
  },
  serviceAreas: ['Dorchester', 'Thorndale', 'Thamesford', 'Belmont', 'Putnam', 'London', 'Ingersoll'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://dorchesterplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
