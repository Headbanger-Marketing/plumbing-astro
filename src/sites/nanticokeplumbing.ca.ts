// Per-site config for nanticokeplumbing.ca
// Plumbing lead-gen (plumbing-astro). Nanticoke, Haldimand County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "nanticokeplumbing.ca",
  url: "https://nanticokeplumbing.ca",
  brand: "Nanticoke Plumbing",
  brandHtml: "Nanticoke Plumbing",
  city: "Nanticoke",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Haldimand",
  phone: { display: "(519) 587-3164", tel: "+15195873164" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@nanticokeplumbing.ca",
  address: {
    street: "3 Rainham Rd",
    locality: "Nanticoke",
    region: 'ON',
    postal: "N0A 1L0",
  },
  serviceAreas: ['Nanticoke', 'Hagersville', 'Cayuga', 'Dunnville', 'Jarvis', 'Port Dover'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://nanticokeplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "nanticokeplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
