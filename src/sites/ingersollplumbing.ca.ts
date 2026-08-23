// Per-site config for ingersollplumbing.ca
// Plumbing lead-gen (plumbing-astro). Ingersoll, Oxford County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ingersollplumbing.ca",
  url: "https://ingersollplumbing.ca",
  brand: "Ingersoll Plumbing",
  brandHtml: "Ingersoll Plumbing",
  city: "Ingersoll",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Oxford",
  phone: { display: "(519) 485-2371", tel: "+15194852371" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@ingersollplumbing.ca",
  address: {
    street: "104 Thames St S",
    locality: "Ingersoll",
    region: 'ON',
    postal: "N5C 2T3",
  },
  serviceAreas: ['Ingersoll', 'Woodstock', 'Tillsonburg', 'Beachville', 'Thamesford', 'Norwich', 'Burgessville'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ingersollplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "ingersollplumbing.ca.png", technicianPhoto: "ingersollplumbing.ca-home-tech.jpg",
    heroImage: "heroes/ingersollplumbing.ca.webp" },
  noindex: true,
};
