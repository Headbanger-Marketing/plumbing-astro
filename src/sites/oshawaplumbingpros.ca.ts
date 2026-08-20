// Per-site config for oshawaplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Oshawa, Durham County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "oshawaplumbingpros.ca",
  url: "https://oshawaplumbingpros.ca",
  brand: "Oshawa Plumbing Pros",
  brandHtml: "Oshawa Plumbing Pros",
  city: "Oshawa",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Durham",
  phone: { display: "(905) 555-0166", tel: "+19055550166" }, // PLACEHOLDER
  email: "contact@oshawaplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Oshawa",
    region: 'ON',
    postal: "L1G 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Oshawa', 'Whitby', 'Courtice', 'Brooklin', 'Bowmanville', 'Newcastle'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://oshawaplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
