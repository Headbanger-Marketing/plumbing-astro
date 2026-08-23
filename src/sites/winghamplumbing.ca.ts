// Per-site config for winghamplumbing.ca
// Plumbing lead-gen (plumbing-astro). Wingham, Huron County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "winghamplumbing.ca",
  url: "https://winghamplumbing.ca",
  brand: "Wingham Plumbing",
  brandHtml: "Wingham Plumbing",
  city: "Wingham",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(519) 357-0136", tel: "+15193570136" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@winghamplumbing.ca",
  address: {
    street: "178 Josephine St",
    locality: "Wingham",
    region: 'ON',
    postal: "N0G 2W0",
  },
  serviceAreas: ['Wingham', 'Blyth', 'Lucknow', 'Teeswater', 'Clinton', 'Goderich', 'Listowel'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://winghamplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "winghamplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
