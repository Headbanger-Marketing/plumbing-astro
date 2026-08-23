// Fulfiller: Premier (per NAP-WORKSHEET 2026-08-21).
// Per-site config for strathroyplumbing.ca
// Plumbing lead-gen (plumbing-astro).
// Strathroy-Caradoc, Middlesex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "strathroyplumbing.ca",
  url: "https://strathroyplumbing.ca",
  brand: "Strathroy Plumbing",
  brandHtml: "Strathroy Plumbing",
  city: "Strathroy",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(548) 708-7117", tel: "+15487087117" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@strathroyplumbing.ca",
  address: {
    street: "285 Metcalfe St E",
    locality: "Strathroy",
    region: 'ON',
    postal: "N7G 1P7",
  },
  serviceAreas: ['Strathroy', 'Mount Brydges', 'Komoka', 'Melbourne', 'Glencoe', 'Parkhill'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://strathroyplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-strathroyplumbing.ca.png", logo: "strathroyplumbing.ca.png", technicianPhoto: "strathroyplumbing.ca-home-tech.jpg",
    heroImage: "heroes/strathroyplumbing.ca.webp" },
  noindex: false,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
