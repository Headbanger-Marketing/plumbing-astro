// Per-site config for oakvilleplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Oakville, Halton County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "oakvilleplumbingpros.ca",
  url: "https://oakvilleplumbingpros.ca",
  brand: "Oakville Plumbing Pros",
  brandHtml: "Oakville Plumbing Pros",
  city: "Oakville",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Halton",
  phone: { display: "(905) 555-0162", tel: "+19055550162" }, // PLACEHOLDER
  email: "contact@oakvilleplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Oakville",
    region: 'ON',
    postal: "L6J 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Oakville', 'Burlington', 'Mississauga', 'Milton', 'Georgetown', 'Campbellville'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://oakvilleplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
