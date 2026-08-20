// Per-site config for londonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). London, Middlesex County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "londonplumbingpros.ca",
  url: "https://londonplumbingpros.ca",
  brand: "London Plumbing Pros",
  brandHtml: "London Plumbing Pros",
  city: "London",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 555-0112", tel: "+15195550112" }, // PLACEHOLDER
  email: "contact@londonplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Dundas Street", // PLACEHOLDER
    locality: "London",
    region: 'ON',
    postal: "N6A 1A1", // PLACEHOLDER
  },
  serviceAreas: ['London', 'Byron', 'Lambeth', 'Hyde Park', 'Masonville', 'Dorchester', 'St. Thomas'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://londonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
