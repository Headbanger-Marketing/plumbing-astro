// Per-site config for keswickplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Keswick, York County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "keswickplumbingpros.ca",
  url: "https://keswickplumbingpros.ca",
  brand: "Keswick Plumbing Pros",
  brandHtml: "Keswick Plumbing Pros",
  city: "Keswick",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "York",
  phone: { display: "(905) 476-8231", tel: "+19054768231" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@keswickplumbingpros.ca",
  address: {
    street: "24201 Woodbine Ave",
    locality: "Keswick",
    region: 'ON',
    postal: "L4P 3E9",
  },
  serviceAreas: ['Keswick', 'Sutton', "Jackson's Point", 'Pefferlaw', 'Virginia', 'Mount Albert'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://keswickplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-keswickplumbingpros.ca.png", logo: "keswickplumbingpros.ca.png", technicianPhoto: "keswickplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/keswickplumbingpros.ca.webp" },
  noindex: false,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
