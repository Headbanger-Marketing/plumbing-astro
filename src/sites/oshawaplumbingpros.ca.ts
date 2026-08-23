// Per-site config for oshawaplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Oshawa, Durham County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "oshawaplumbingpros.ca",
  url: "https://oshawaplumbingpros.ca",
  brand: "Oshawa Plumbing Pros",
  brandHtml: "Oshawa Plumbing Pros",
  city: "Oshawa",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Durham",
  phone: { display: "(905) 721-3485", tel: "+19057213485" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@oshawaplumbingpros.ca",
  address: {
    street: "50 Richmond St W",
    locality: "Oshawa",
    region: 'ON',
    postal: "L1G 1C7",
  },
  serviceAreas: ['Oshawa', 'Whitby', 'Courtice', 'Brooklin', 'Bowmanville', 'Newcastle'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://oshawaplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-oshawaplumbingpros.ca.png", logo: "oshawaplumbingpros.ca.png", technicianPhoto: "oshawaplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/oshawaplumbingpros.ca.webp" },
  noindex: false,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
