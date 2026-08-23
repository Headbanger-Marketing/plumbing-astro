// Per-site config for leamingtonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Leamington, Essex County, on Lake Erie.
// NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "leamingtonplumbingpros.ca",
  url: "https://leamingtonplumbingpros.ca",
  brand: "Leamington Plumbing Pros",
  brandHtml: "Leamington Plumbing Pros",
  city: "Leamington",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(548) 798-0609", tel: "+15487980609" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@leamingtonplumbingpros.ca",
  address: {
    street: "215 Talbot St E",
    locality: "Leamington",
    region: 'ON',
    postal: "N8H 3X5",
  },
  serviceAreas: ['Leamington', 'Kingsville', 'Essex', 'Wheatley', 'Harrow', 'Amherstburg', 'Windsor'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://leamingtonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-leamingtonplumbingpros.ca.png", logo: "leamingtonplumbingpros.ca.png", technicianPhoto: "leamingtonplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/leamingtonplumbingpros.ca.webp" },
  noindex: false,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
