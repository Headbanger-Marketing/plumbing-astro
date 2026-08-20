// Per-site config for leamingtonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Leamington, Essex County, on Lake Erie.
// ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "leamingtonplumbingpros.ca",
  url: "https://leamingtonplumbingpros.ca",
  brand: "Leamington Plumbing Pros",
  brandHtml: "Leamington Plumbing Pros",
  city: "Leamington",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(519) 555-0179", tel: "+15195550179" }, // PLACEHOLDER
  email: "contact@leamingtonplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Leamington",
    region: 'ON',
    postal: "N8H 3C4", // PLACEHOLDER
  },
  serviceAreas: ['Leamington', 'Kingsville', 'Essex', 'Wheatley', 'Harrow', 'Amherstburg', 'Windsor'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://leamingtonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
