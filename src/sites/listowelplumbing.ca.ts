// Per-site config for listowelplumbing.ca
// Plumbing lead-gen (plumbing-astro). Listowel, Perth County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "listowelplumbing.ca",
  url: "https://listowelplumbing.ca",
  brand: "Listowel Plumbing",
  brandHtml: "Listowel Plumbing",
  city: "Listowel",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Perth",
  phone: { display: "(519) 291-3562", tel: "+15192913562" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@listowelplumbing.ca",
  address: {
    street: "150 Main St W",
    locality: "Listowel",
    region: 'ON',
    postal: "N4W 1A8",
  },
  serviceAreas: ['Listowel', 'Palmerston', 'Atwood', 'Monkton', 'Moorefield', 'Drayton', 'Harriston'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://listowelplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-listowelplumbing.ca.png", logo: "listowelplumbing.ca.png", technicianPhoto: "listowelplumbing.ca-home-tech.jpg",
    heroImage: "heroes/listowelplumbing.ca.webp" },
  noindex: true,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
