// Per-site config for komokaplumbing.ca
// Plumbing lead-gen (plumbing-astro). Komoka, Middlesex County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "komokaplumbing.ca",
  url: "https://komokaplumbing.ca",
  brand: "Komoka Plumbing",
  brandHtml: "Komoka Plumbing",
  city: "Komoka",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 555-0176", tel: "+15195550176" }, // PLACEHOLDER
  email: "contact@komokaplumbing.ca",
  address: {
    street: "PLACEHOLDER Oxford Street West", // PLACEHOLDER
    locality: "Komoka",
    region: 'ON',
    postal: "N0M 2M0", // PLACEHOLDER
  },
  serviceAreas: ['Komoka', 'Kilworth', 'Delaware', 'London', 'Strathroy', 'Ilderton', 'Mount Brydges'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://komokaplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
