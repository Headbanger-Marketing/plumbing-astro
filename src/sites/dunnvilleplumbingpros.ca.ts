// Per-site config for dunnvilleplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Dunnville, Haldimand County. ⚠️ NAP PARTIAL — phone real 2026-08-22 (NAP-WORKSHEET); street/postal still TO FILL (needs fulfiller Dunnville address).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "dunnvilleplumbingpros.ca",
  url: "https://dunnvilleplumbingpros.ca",
  brand: "Dunnville Plumbing Pros",
  brandHtml: "Dunnville Plumbing Pros",
  city: "Dunnville",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Haldimand",
  phone: { display: "(365) 661-7242", tel: "+13656617242" }, // real (NAP-WORKSHEET straggler sign-off 2026-08-22)
  email: "contact@dunnvilleplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER, TO FILL (no source address)
    locality: "Dunnville",
    region: 'ON',
    postal: "N1A 1A1", // PLACEHOLDER, TO FILL (no source address)
  },
  serviceAreas: ['Dunnville', 'Cayuga', 'Hagersville', 'Caledonia', 'Nanticoke', 'Port Dover', 'Simcoe'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://dunnvilleplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
