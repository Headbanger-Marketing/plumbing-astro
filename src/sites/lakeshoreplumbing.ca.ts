// Per-site config for lakeshoreplumbing.ca
// Plumbing lead-gen (plumbing-astro). Lakeshore, Essex County, the string of
// Lake St. Clair communities from Belle River through Comber and Stoney Point.
// NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "lakeshoreplumbing.ca",
  url: "https://lakeshoreplumbing.ca",
  brand: "Lakeshore Plumbing",
  brandHtml: "Lakeshore Plumbing",
  city: "Lakeshore",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(548) 708-6805", tel: "+15487086805" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@lakeshoreplumbing.ca",
  address: {
    street: "523 Advance Blvd",
    locality: "Lakeshore",
    region: 'ON',
    postal: "N8N 5G8",
  },
  serviceAreas: ['Lakeshore', 'Belle River', 'Stoney Point', 'Comber', 'Tecumseh', 'Windsor', 'Ruscomb'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://lakeshoreplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "lakeshoreplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
