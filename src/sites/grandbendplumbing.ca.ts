// Per-site config for grandbendplumbing.ca
// Plumbing lead-gen (plumbing-astro). Grand Bend, Lambton County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "grandbendplumbing.ca",
  url: "https://grandbendplumbing.ca",
  brand: "Grand Bend Plumbing",
  brandHtml: "Grand Bend Plumbing",
  city: "Grand Bend",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Lambton",
  phone: { display: "(548) 554-3151", tel: "+15485543151" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@grandbendplumbing.ca",
  address: {
    street: "13 Main St W",
    locality: "Grand Bend",
    region: 'ON',
    postal: "N0M 1T0",
  },
  serviceAreas: ['Grand Bend', 'Bayfield', 'Forest', 'Thedford', 'Port Franks', 'Parkhill', 'Exeter'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://grandbendplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-grandbendplumbing.ca.png", logo: "grandbendplumbing.ca.png", technicianPhoto: "grandbendplumbing.ca-home-tech.jpg",
    heroImage: "heroes/grandbendplumbing.ca.webp" },
  noindex: true,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
