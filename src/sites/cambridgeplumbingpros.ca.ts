// Per-site config for cambridgeplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Cambridge, Waterloo County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "cambridgeplumbingpros.ca",
  url: "https://cambridgeplumbingpros.ca",
  brand: "Cambridge Plumbing Pros",
  brandHtml: "Cambridge Plumbing Pros",
  city: "Cambridge",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo",
  phone: { display: "(519) 555-0123", tel: "+15195550123" }, // PLACEHOLDER
  email: "contact@cambridgeplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Cambridge",
    region: 'ON',
    postal: "N1R 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Cambridge', 'Kitchener', 'Ayr', 'Paris', 'Brantford', 'Guelph', 'Waterloo'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://cambridgeplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
