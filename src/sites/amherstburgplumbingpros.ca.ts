// Per-site config for amherstburgplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Amherstburg, Essex County, on the
// Detroit River at the mouth of Lake Erie. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "amherstburgplumbingpros.ca",
  url: "https://amherstburgplumbingpros.ca",
  brand: "Amherstburg Plumbing Pros",
  brandHtml: "Amherstburg Plumbing Pros",
  city: "Amherstburg",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(519) 555-0158", tel: "+15195550158" }, // PLACEHOLDER
  email: "contact@amherstburgplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Amherstburg",
    region: 'ON',
    postal: "N9V 1T3", // PLACEHOLDER
  },
  serviceAreas: ['Amherstburg', 'McGregor', 'River Canard', 'Windsor', 'LaSalle', 'Essex', 'Harrow'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://amherstburgplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
