// Per-site config for hamiltonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Hamilton, Hamilton. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "hamiltonplumbingpros.ca",
  url: "https://hamiltonplumbingpros.ca",
  brand: "Hamilton Plumbing Pros",
  brandHtml: "Hamilton Plumbing Pros",
  city: "Hamilton",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Hamilton",
  phone: { display: "(905) 555-0121", tel: "+19055550121" }, // PLACEHOLDER
  email: "contact@hamiltonplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street West", // PLACEHOLDER
    locality: "Hamilton",
    region: 'ON',
    postal: "L8N 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Hamilton', 'Stoney Creek', 'Dundas', 'Ancaster', 'Waterdown', 'Binbrook', 'Winona'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://hamiltonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
