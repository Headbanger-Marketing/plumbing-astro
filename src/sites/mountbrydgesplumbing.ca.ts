// Per-site config for mountbrydgesplumbing.ca
// Plumbing lead-gen (plumbing-astro). Mount Brydges, Middlesex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "mountbrydgesplumbing.ca",
  url: "https://mountbrydgesplumbing.ca",
  brand: "Mount Brydges Plumbing",
  brandHtml: "Mount Brydges Plumbing",
  city: "Mount Brydges",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(548) 761-2072", tel: "+15487612072" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@mountbrydgesplumbing.ca",
  address: {
    street: "32 Main St",
    locality: "Mount Brydges",
    region: 'ON',
    postal: "N0L 1W0",
  },
  serviceAreas: ['Mount Brydges', 'Strathroy', 'Melbourne', 'Delaware', 'Komoka', 'Glencoe', 'London'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://mountbrydgesplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-mountbrydgesplumbing.ca.png", logo: "mountbrydgesplumbing.ca.png", technicianPhoto: "mountbrydgesplumbing.ca-home-tech.jpg",
    heroImage: "heroes/mountbrydgesplumbing.ca.webp" },
  noindex: true,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
