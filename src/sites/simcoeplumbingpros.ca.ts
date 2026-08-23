// Per-site config for simcoeplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Simcoe, Norfolk County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "simcoeplumbingpros.ca",
  url: "https://simcoeplumbingpros.ca",
  brand: "Simcoe Plumbing Pros",
  brandHtml: "Simcoe Plumbing Pros",
  city: "Simcoe",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Norfolk",
  phone: { display: "(548) 290-7597", tel: "+15482907597" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@simcoeplumbingpros.ca",
  address: {
    street: "50 Colborne St N",
    locality: "Simcoe",
    region: 'ON',
    postal: "N3Y 3V5",
  },
  serviceAreas: ['Simcoe', 'Port Dover', 'Delhi', 'Waterford', 'Jarvis', 'Courtland', 'Vittoria'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://simcoeplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-simcoeplumbingpros.ca.png", logo: "simcoeplumbingpros.ca.png", technicianPhoto: "simcoeplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/simcoeplumbingpros.ca.webp" },
  noindex: false,
};
