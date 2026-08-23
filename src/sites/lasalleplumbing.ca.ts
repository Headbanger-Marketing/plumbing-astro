// Per-site config for lasalleplumbing.ca
// Plumbing lead-gen (plumbing-astro). LaSalle, Essex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "lasalleplumbing.ca",
  url: "https://lasalleplumbing.ca",
  brand: "LaSalle Plumbing",
  brandHtml: "LaSalle Plumbing",
  city: "LaSalle",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(548) 457-0509", tel: "+15484570509" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@lasalleplumbing.ca",
  address: {
    street: "5840 Malden Rd",
    locality: "LaSalle",
    region: 'ON',
    postal: "N9H 1S4",
  },
  serviceAreas: ['LaSalle', 'Windsor', 'Amherstburg', 'Tecumseh', 'McGregor', 'Essex', 'Lakeshore'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://lasalleplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-lasalleplumbing.ca.png", logo: "lasalleplumbing.ca.png", technicianPhoto: "lasalleplumbing.ca-home-tech.jpg",
    heroImage: "heroes/lasalleplumbing.ca.webp" },
  noindex: false,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
