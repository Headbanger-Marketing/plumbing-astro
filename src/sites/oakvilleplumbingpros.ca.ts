// Per-site config for oakvilleplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Oakville, Halton County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "oakvilleplumbingpros.ca",
  url: "https://oakvilleplumbingpros.ca",
  brand: "Oakville Plumbing Pros",
  brandHtml: "Oakville Plumbing Pros",
  city: "Oakville",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Halton",
  phone: { display: "(905) 845-3072", tel: "+19058453072" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@oakvilleplumbingpros.ca",
  address: {
    street: "240 Lakeshore Rd E",
    locality: "Oakville",
    region: 'ON',
    postal: "L6J 1H8",
  },
  serviceAreas: ['Oakville', 'Burlington', 'Mississauga', 'Milton', 'Georgetown', 'Campbellville'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://oakvilleplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
