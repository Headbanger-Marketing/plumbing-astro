// Per-site config for tecumsehplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Tecumseh, Essex County, on Lake St. Clair
// east of Windsor. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "tecumsehplumbingpros.ca",
  url: "https://tecumsehplumbingpros.ca",
  brand: "Tecumseh Plumbing Pros",
  brandHtml: "Tecumseh Plumbing Pros",
  city: "Tecumseh",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(548) 457-1225", tel: "+15484571225" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@tecumsehplumbingpros.ca",
  address: {
    street: "13430 Tecumseh Rd E",
    locality: "Tecumseh",
    region: 'ON',
    postal: "N8N 3T6",
  },
  serviceAreas: ['Tecumseh', 'Windsor', 'Lakeshore', 'LaSalle', 'Stoney Point', 'Belle River', 'Essex'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://tecumsehplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-tecumsehplumbingpros.ca.png", logo: "tecumsehplumbingpros.ca.png", technicianPhoto: "tecumsehplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/tecumsehplumbingpros.ca.webp" },
  noindex: false,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
