// Per-site config for newmarketplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Newmarket, York County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "newmarketplumbingpros.ca",
  url: "https://newmarketplumbingpros.ca",
  brand: "Newmarket Plumbing Pros",
  brandHtml: "Newmarket Plumbing Pros",
  city: "Newmarket",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "York",
  phone: { display: "(905) 555-0163", tel: "+19055550163" }, // PLACEHOLDER
  email: "contact@newmarketplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Newmarket",
    region: 'ON',
    postal: "L3Y 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Newmarket', 'Aurora', 'Sharon', 'Queensville', 'Holland Landing', 'Bradford'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://newmarketplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
