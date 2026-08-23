// Per-site config for petroliaplumbing.ca
// Fulfiller: Hayter (per NAP-WORKSHEET 2026-08-21).
// Plumbing lead-gen (plumbing-astro). Petrolia, Lambton County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "petroliaplumbing.ca",
  url: "https://petroliaplumbing.ca",
  brand: "Petrolia Plumbing",
  brandHtml: "Petrolia Plumbing",
  city: "Petrolia",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Lambton",
  phone: { display: "(519) 882-0159", tel: "+15198820159" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@petroliaplumbing.ca",
  address: {
    street: "420 King St",
    locality: "Petrolia",
    region: 'ON',
    postal: "N0N 1R0",
  },
  serviceAreas: ['Petrolia', 'Oil Springs', 'Wyoming', 'Forest', 'Sarnia', 'Courtright'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://petroliaplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-petroliaplumbing.ca.png", logo: "petroliaplumbing.ca.png", technicianPhoto: "petroliaplumbing.ca-home-tech.jpg",
    heroImage: "heroes/petroliaplumbing.ca.webp" },
  noindex: false,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
