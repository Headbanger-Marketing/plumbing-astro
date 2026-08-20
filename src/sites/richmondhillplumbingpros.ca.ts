// Per-site config for richmondhillplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Richmond Hill, York County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "richmondhillplumbingpros.ca",
  url: "https://richmondhillplumbingpros.ca",
  brand: "Richmond Hill Plumbing Pros",
  brandHtml: "Richmond Hill Plumbing Pros",
  city: "Richmond Hill",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "York",
  phone: { display: "(905) 555-0162", tel: "+19055550162" }, // PLACEHOLDER
  email: "contact@richmondhillplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Richmond Hill",
    region: 'ON',
    postal: "L4C 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Richmond Hill', 'Oak Ridges', 'Thornhill', 'King City', 'Aurora', 'Maple'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://richmondhillplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
