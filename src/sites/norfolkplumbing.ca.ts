// Per-site config for norfolkplumbing.ca
// Plumbing lead-gen (plumbing-astro). Norfolk, Norfolk County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "norfolkplumbing.ca",
  url: "https://norfolkplumbing.ca",
  brand: "Norfolk Plumbing",
  brandHtml: "Norfolk Plumbing",
  city: "Norfolk",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Norfolk",
  phone: { display: "(548) 708-8109", tel: "+15487088109" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@norfolkplumbing.ca",
  address: {
    street: "12 Alice St",
    locality: "Norfolk",
    region: 'ON',
    postal: "N3Y 1W5",
  },
  serviceAreas: ['Norfolk', 'Simcoe', 'Delhi', 'Port Dover', 'Waterford', 'Langton', 'Port Rowan'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://norfolkplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-norfolkplumbing.ca.png", logo: "norfolkplumbing.ca.png", technicianPhoto: "norfolkplumbing.ca-home-tech.jpg",
    heroImage: "heroes/norfolkplumbing.ca.webp" },
  noindex: false,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
