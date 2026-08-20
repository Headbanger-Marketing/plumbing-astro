// Per-site config for petroliaplumbing.ca
// Plumbing lead-gen (plumbing-astro). Petrolia, Lambton County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "petroliaplumbing.ca",
  url: "https://petroliaplumbing.ca",
  brand: "Petrolia Plumbing",
  brandHtml: "Petrolia Plumbing",
  city: "Petrolia",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Lambton",
  phone: { display: "(519) 555-0142", tel: "+15195550142" }, // PLACEHOLDER
  email: "contact@petroliaplumbing.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Petrolia",
    region: 'ON',
    postal: "N0N 1R0", // PLACEHOLDER
  },
  serviceAreas: ['Petrolia', 'Oil Springs', 'Wyoming', 'Forest', 'Sarnia', 'Courtright'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://petroliaplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
