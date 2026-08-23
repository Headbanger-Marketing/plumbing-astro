// Per-site config for richmondhillplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Richmond Hill, York County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "richmondhillplumbingpros.ca",
  url: "https://richmondhillplumbingpros.ca",
  brand: "Richmond Hill Plumbing Pros",
  brandHtml: "Richmond Hill Plumbing Pros",
  city: "Richmond Hill",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "York",
  phone: { display: "(905) 884-7163", tel: "+19058847163" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@richmondhillplumbingpros.ca",
  address: {
    street: "9325 Yonge St",
    locality: "Richmond Hill",
    region: 'ON',
    postal: "L4C 0A8",
  },
  serviceAreas: ['Richmond Hill', 'Oak Ridges', 'Thornhill', 'King City', 'Aurora', 'Maple'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://richmondhillplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "richmondhillplumbingpros.ca.png", technicianPhoto: "richmondhillplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/richmondhillplumbingpros.ca.webp" },
  noindex: false,
};
