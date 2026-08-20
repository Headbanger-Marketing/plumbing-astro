// Per-site config for ildertonplumbing.ca
// Plumbing lead-gen (plumbing-astro). Ilderton, Middlesex County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ildertonplumbing.ca",
  url: "https://ildertonplumbing.ca",
  brand: "Ilderton Plumbing",
  brandHtml: "Ilderton Plumbing",
  city: "Ilderton",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 555-0169", tel: "+15195550169" }, // PLACEHOLDER
  email: "contact@ildertonplumbing.ca",
  address: {
    street: "PLACEHOLDER Ilderton Road", // PLACEHOLDER
    locality: "Ilderton",
    region: 'ON',
    postal: "N0M 2A0", // PLACEHOLDER
  },
  serviceAreas: ['Ilderton', 'Komoka', 'Denfield', 'Arva', 'Granton', 'London', 'Strathroy'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ildertonplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
