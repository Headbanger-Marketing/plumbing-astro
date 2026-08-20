// Per-site config for kitchenerplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Kitchener, Waterloo County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "kitchenerplumbingpros.ca",
  url: "https://kitchenerplumbingpros.ca",
  brand: "Kitchener Plumbing Pros",
  brandHtml: "Kitchener Plumbing Pros",
  city: "Kitchener",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo",
  phone: { display: "(519) 555-0121", tel: "+15195550121" }, // PLACEHOLDER
  email: "contact@kitchenerplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street South", // PLACEHOLDER
    locality: "Kitchener",
    region: 'ON',
    postal: "N2G 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Kitchener', 'Waterloo', 'Cambridge', 'Elmira', 'Ayr', 'New Hamburg', 'Baden'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://kitchenerplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
