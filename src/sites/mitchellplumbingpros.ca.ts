// Per-site config for mitchellplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Mitchell, Perth County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "mitchellplumbingpros.ca",
  url: "https://mitchellplumbingpros.ca",
  brand: "Mitchell Plumbing Pros",
  brandHtml: "Mitchell Plumbing Pros",
  city: "Mitchell",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Perth",
  phone: { display: "(519) 348-4027", tel: "+15193484027" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@mitchellplumbingpros.ca",
  address: {
    street: "114 St Andrew St",
    locality: "Mitchell",
    region: 'ON',
    postal: "N0K 1N0",
  },
  serviceAreas: ['Mitchell', 'Sebringville', 'Monkton', 'Listowel', 'St. Marys', 'Stratford', 'Shakespeare'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://mitchellplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-mitchellplumbingpros.ca.png", logo: "mitchellplumbingpros.ca.png", technicianPhoto: "mitchellplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/mitchellplumbingpros.ca.webp" },
  noindex: true,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
