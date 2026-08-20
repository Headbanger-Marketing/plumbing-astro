// Per-site config for keswickplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Keswick, York County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "keswickplumbingpros.ca",
  url: "https://keswickplumbingpros.ca",
  brand: "Keswick Plumbing Pros",
  brandHtml: "Keswick Plumbing Pros",
  city: "Keswick",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "York",
  phone: { display: "(905) 555-0165", tel: "+19055550165" }, // PLACEHOLDER
  email: "contact@keswickplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Keswick",
    region: 'ON',
    postal: "L4L 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Keswick', 'Sutton', "Jackson's Point", 'Pefferlaw', 'Virginia', 'Mount Albert'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://keswickplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
