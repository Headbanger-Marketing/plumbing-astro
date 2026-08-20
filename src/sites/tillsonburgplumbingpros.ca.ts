// Per-site config for tillsonburgplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Tillsonburg, Oxford County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "tillsonburgplumbingpros.ca",
  url: "https://tillsonburgplumbingpros.ca",
  brand: "Tillsonburg Plumbing Pros",
  brandHtml: "Tillsonburg Plumbing Pros",
  city: "Tillsonburg",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Oxford",
  phone: { display: "(519) 555-0128", tel: "+15195550128" }, // PLACEHOLDER
  email: "contact@tillsonburgplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Tillsonburg",
    region: 'ON',
    postal: "N4G 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Tillsonburg', 'Norwich', 'Otterville', 'Courtland', 'Delhi', 'Simcoe', 'Langton'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://tillsonburgplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
