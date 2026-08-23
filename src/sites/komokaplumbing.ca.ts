// Per-site config for komokaplumbing.ca
// Plumbing lead-gen (plumbing-astro). Komoka, Middlesex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
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
  phone: { display: "(519) 657-0133", tel: "+15196570133" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@komokaplumbing.ca",
  address: {
    street: "81 Queen St",
    locality: "Komoka",
    region: 'ON',
    postal: "N0L 1R0",
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
  media: { logo: "komokaplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
