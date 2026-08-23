// Per-site config for caledoniaplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Caledonia, Haldimand County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "caledoniaplumbingpros.ca",
  url: "https://caledoniaplumbingpros.ca",
  brand: "Caledonia Plumbing Pros",
  brandHtml: "Caledonia Plumbing Pros",
  city: "Caledonia",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Haldimand",
  phone: { display: "(905) 765-3418", tel: "+19057653418" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@caledoniaplumbingpros.ca",
  address: {
    street: "64 Argyle St N",
    locality: "Caledonia",
    region: 'ON',
    postal: "N3W 1B9",
  },
  serviceAreas: ['Caledonia', 'Hagersville', 'Dunnville', 'Cayuga', 'Fisherville', 'Jarvis', 'Townsend'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://caledoniaplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-caledoniaplumbingpros.ca.png", logo: "caledoniaplumbingpros.ca.png", technicianPhoto: "caledoniaplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/caledoniaplumbingpros.ca.webp" },
  noindex: true,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
