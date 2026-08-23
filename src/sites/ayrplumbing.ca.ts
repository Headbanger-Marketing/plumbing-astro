// Per-site config for ayrplumbing.ca
// Plumbing lead-gen (plumbing-astro). Ayr, Waterloo County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ayrplumbing.ca",
  url: "https://ayrplumbing.ca",
  brand: "Ayr Plumbing",
  brandHtml: "Ayr Plumbing",
  city: "Ayr",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo",
  phone: { display: "(519) 632-8174", tel: "+15196328174" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@ayrplumbing.ca",
  address: {
    street: "15 Stanley St",
    locality: "Ayr",
    region: 'ON',
    postal: "N0B 1E0",
  },
  serviceAreas: ['Ayr', 'New Hamburg', 'Baden', 'St. George', 'Paris', 'Cambridge', 'Kitchener'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ayrplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-ayrplumbing.ca.png", logo: "ayrplumbing.ca.png", technicianPhoto: "ayrplumbing.ca-home-tech.jpg",
    heroImage: "heroes/ayrplumbing.ca.webp" },
  noindex: true,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
