// Per-site config for miltonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Milton, Halton County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "miltonplumbingpros.ca",
  url: "https://miltonplumbingpros.ca",
  brand: "Milton Plumbing Pros",
  brandHtml: "Milton Plumbing Pros",
  city: "Milton",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Halton",
  phone: { display: "(905) 555-0184", tel: "+19055550184" }, // PLACEHOLDER
  email: "contact@miltonplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Milton",
    region: 'ON',
    postal: "L9T 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Milton', 'Campbellville', 'Georgetown', 'Burlington', 'Oakville', 'Acton'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://miltonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
