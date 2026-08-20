// Per-site config for whitbyplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Whitby, Durham County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "whitbyplumbingpros.ca",
  url: "https://whitbyplumbingpros.ca",
  brand: "Whitby Plumbing Pros",
  brandHtml: "Whitby Plumbing Pros",
  city: "Whitby",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Durham",
  phone: { display: "(905) 555-0167", tel: "+19055550167" }, // PLACEHOLDER
  email: "contact@whitbyplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Whitby",
    region: 'ON',
    postal: "L1N 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Whitby', 'Brooklin', 'Ashburn', 'Myrtle', 'Oshawa', 'Ajax'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://whitbyplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
