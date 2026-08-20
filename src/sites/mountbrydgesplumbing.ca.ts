// Per-site config for mountbrydgesplumbing.ca
// Plumbing lead-gen (plumbing-astro). Mount Brydges, Middlesex County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "mountbrydgesplumbing.ca",
  url: "https://mountbrydgesplumbing.ca",
  brand: "Mount Brydges Plumbing",
  brandHtml: "Mount Brydges Plumbing",
  city: "Mount Brydges",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 555-0198", tel: "+15195550198" }, // PLACEHOLDER
  email: "contact@mountbrydgesplumbing.ca",
  address: {
    street: "PLACEHOLDER Front Street", // PLACEHOLDER
    locality: "Mount Brydges",
    region: 'ON',
    postal: "N0N 1H0", // PLACEHOLDER
  },
  serviceAreas: ['Mount Brydges', 'Strathroy', 'Melbourne', 'Delaware', 'Komoka', 'Glencoe', 'London'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://mountbrydgesplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
