// Per-site config for listowelplumbing.ca
// Plumbing lead-gen (plumbing-astro). Listowel, Perth County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "listowelplumbing.ca",
  url: "https://listowelplumbing.ca",
  brand: "Listowel Plumbing",
  brandHtml: "Listowel Plumbing",
  city: "Listowel",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Perth",
  phone: { display: "(519) 555-0154", tel: "+15195550154" }, // PLACEHOLDER
  email: "contact@listowelplumbing.ca",
  address: {
    street: "PLACEHOLDER Main Street West", // PLACEHOLDER
    locality: "Listowel",
    region: 'ON',
    postal: "N4W 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Listowel', 'Palmerston', 'Atwood', 'Monkton', 'Moorefield', 'Drayton', 'Harriston'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://listowelplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
