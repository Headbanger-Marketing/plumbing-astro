// Per-site config for elmiraplumbing.ca
// Plumbing lead-gen (plumbing-astro). Elmira, Waterloo County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "elmiraplumbing.ca",
  url: "https://elmiraplumbing.ca",
  brand: "Elmira Plumbing",
  brandHtml: "Elmira Plumbing",
  city: "Elmira",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo",
  phone: { display: "(519) 555-0126", tel: "+15195550126" }, // PLACEHOLDER
  email: "contact@elmiraplumbing.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Elmira",
    region: 'ON',
    postal: "N3B 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Elmira', 'St. Jacobs', 'Conestogo', 'Bloomingdale', 'Winterbourne', 'Maryhill', 'Waterloo'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://elmiraplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
