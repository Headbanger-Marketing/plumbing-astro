// Per-site config for chathamkentplumbing.ca
// Plumbing lead-gen (plumbing-astro). Chatham-Kent municipality-wide hub site. NAP applied 2026-08-22 (NAP-WORKSHEET straggler sign-off — Chatham/Port Elgin anchor, verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "chathamkentplumbing.ca",
  url: "https://chathamkentplumbing.ca",
  brand: "Chatham-Kent Plumbing",
  brandHtml: "Chatham-Kent Plumbing",
  city: "Chatham-Kent",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Chatham-Kent",
  phone: { display: "(548) 901-3519", tel: "+15489013519" }, // real (NAP-WORKSHEET straggler sign-off 2026-08-22)
  email: "contact@chathamkentplumbing.ca",
  address: {
    street: "425 Grand Ave W",
    locality: "Chatham",
    region: 'ON',
    postal: "N7M 5J1",
  },
  serviceAreas: ['Chatham-Kent', 'Chatham', 'Wallaceburg', 'Ridgetown', 'Blenheim', 'Tilbury', 'Wheatley'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://chathamkentplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-chathamkentplumbing.ca.png", logo: "chathamkentplumbing.ca.png", technicianPhoto: "chathamkentplumbing.ca-home-tech.jpg",
    heroImage: "heroes/chathamkentplumbing.ca.webp" },
  noindex: false,
  // Jayden's Mechanical fulfilment + /thank-you/ redirect (matches HVAC city sites).
  partner: {
    name: "Jayden's Mechanical",
    url: "https://jaydensmechanical.com",
    tagline: "now part of the Jayden's Mechanical family",
  },
  thankYouRedirect: "/thank-you/",
};
