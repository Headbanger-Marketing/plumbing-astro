// Per-site config for waterlooplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Waterloo, Waterloo County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "waterlooplumbingpros.ca",
  url: "https://waterlooplumbingpros.ca",
  brand: "Waterloo Plumbing Pros",
  brandHtml: "Waterloo Plumbing Pros",
  city: "Waterloo",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo Region",
  phone: { display: "(519) 555-0122", tel: "+15195550122" }, // PLACEHOLDER
  email: "contact@waterlooplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Waterloo",
    region: 'ON',
    postal: "N2J 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Waterloo', 'Kitchener', 'Elmira', 'St. Jacobs', 'Conestogo', 'Cambridge', 'Ayr'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://waterlooplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
