// Per-site config for burlingtonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Burlington, Halton County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "burlingtonplumbingpros.ca",
  url: "https://burlingtonplumbingpros.ca",
  brand: "Burlington Plumbing Pros",
  brandHtml: "Burlington Plumbing Pros",
  city: "Burlington",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Halton",
  phone: { display: "(905) 555-0173", tel: "+19055550173" }, // PLACEHOLDER
  email: "contact@burlingtonplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Burlington",
    region: 'ON',
    postal: "L7P 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Burlington', 'Oakville', 'Hamilton', 'Waterdown', 'Ancaster', 'Milton'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://burlingtonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
