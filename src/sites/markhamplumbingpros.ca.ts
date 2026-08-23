// Per-site config for markhamplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Markham, York County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "markhamplumbingpros.ca",
  url: "https://markhamplumbingpros.ca",
  brand: "Markham Plumbing Pros",
  brandHtml: "Markham Plumbing Pros",
  city: "Markham",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "York",
  phone: { display: "(905) 472-3610", tel: "+19054723610" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@markhamplumbingpros.ca",
  address: {
    street: "160 Main St N",
    locality: "Markham",
    region: 'ON',
    postal: "L3P 1Y3",
  },
  serviceAreas: ['Markham', 'Unionville', 'Thornhill', 'Stouffville', 'Richmond Hill'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://markhamplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
