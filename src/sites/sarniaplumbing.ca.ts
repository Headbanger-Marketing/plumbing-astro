// Per-site config for sarniaplumbing.ca
// Plumbing lead-gen (plumbing-astro). Sarnia, Lambton County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "sarniaplumbing.ca",
  url: "https://sarniaplumbing.ca",
  brand: "Sarnia Plumbing",
  brandHtml: "Sarnia Plumbing",
  city: "Sarnia",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Lambton",
  phone: { display: "(519) 555-0140", tel: "+15195550140" }, // PLACEHOLDER
  email: "contact@sarniaplumbing.ca",
  address: {
    street: "PLACEHOLDER Street North", // PLACEHOLDER
    locality: "Sarnia",
    region: 'ON',
    postal: "N7T 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Sarnia', 'Point Edward', 'Corunna', "Bright's Grove", 'Petrolia', 'Forest', 'Wyoming'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://sarniaplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
