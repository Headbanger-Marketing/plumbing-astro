// Per-site config for parisplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Paris, Brant County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "parisplumbingpros.ca",
  url: "https://parisplumbingpros.ca",
  brand: "Paris Plumbing Pros",
  brandHtml: "Paris Plumbing Pros",
  city: "Paris",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Brant",
  phone: { display: "(548) 901-0930", tel: "+15489010930" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@parisplumbingpros.ca",
  address: {
    street: "2 Grand River St N",
    locality: "Paris",
    region: 'ON',
    postal: "N3L 2M2",
  },
  serviceAreas: ['Paris', 'St. George', 'Glen Morris', 'Mount Pleasant', 'Ayr', 'Brantford'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://parisplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-parisplumbingpros.ca.png", logo: "parisplumbingpros.ca.png", technicianPhoto: "parisplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/parisplumbingpros.ca.webp" },
  noindex: true,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
