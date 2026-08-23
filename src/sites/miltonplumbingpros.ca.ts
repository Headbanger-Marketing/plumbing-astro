// Per-site config for miltonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Milton, Halton County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "miltonplumbingpros.ca",
  url: "https://miltonplumbingpros.ca",
  brand: "Milton Plumbing Pros",
  brandHtml: "Milton Plumbing Pros",
  city: "Milton",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Halton",
  phone: { display: "(905) 878-2164", tel: "+19058782164" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@miltonplumbingpros.ca",
  address: {
    street: "150 Mary St",
    locality: "Milton",
    region: 'ON',
    postal: "L9T 6Z5",
  },
  serviceAreas: ['Milton', 'Campbellville', 'Georgetown', 'Burlington', 'Oakville', 'Acton'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://miltonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "miltonplumbingpros.ca.png", technicianPhoto: "miltonplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/miltonplumbingpros.ca.webp" },
  noindex: false,
};
