// Per-site config for glencoeplumbing.ca
// Plumbing lead-gen (plumbing-astro). Glencoe, Middlesex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "glencoeplumbing.ca",
  url: "https://glencoeplumbing.ca",
  brand: "Glencoe Plumbing",
  brandHtml: "Glencoe Plumbing",
  city: "Glencoe",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(548) 761-2123", tel: "+15487612123" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@glencoeplumbing.ca",
  address: {
    street: "37 Main St",
    locality: "Glencoe",
    region: 'ON',
    postal: "N0L 1M0",
  },
  serviceAreas: ['Glencoe', 'Bothwell', 'Wardsville', 'Newbury', 'Mount Brydges', 'Strathroy', 'West Lorne'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://glencoeplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "glencoeplumbing.ca.png", technicianPhoto: "glencoeplumbing.ca-home-tech.jpg",
    heroImage: "heroes/glencoeplumbing.ca.webp" },
  noindex: true,
};
