// Per-site config for ancasterplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Ancaster, Hamilton. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ancasterplumbingpros.ca",
  url: "https://ancasterplumbingpros.ca",
  brand: "Ancaster Plumbing Pros",
  brandHtml: "Ancaster Plumbing Pros",
  city: "Ancaster",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Hamilton",
  phone: { display: "(905) 555-0122", tel: "+19055550122" }, // PLACEHOLDER
  email: "contact@ancasterplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Ancaster",
    region: 'ON',
    postal: "L9G 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Ancaster', 'Dundas', 'Hamilton', 'Waterdown', 'Carlisle', 'Copetown'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ancasterplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
