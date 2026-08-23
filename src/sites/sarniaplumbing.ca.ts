// Per-site config for sarniaplumbing.ca
// Fulfiller: Hayter (per NAP-WORKSHEET 2026-08-21).
// Plumbing lead-gen (plumbing-astro). Sarnia, Lambton County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "sarniaplumbing.ca",
  url: "https://sarniaplumbing.ca",
  brand: "Sarnia Plumbing",
  brandHtml: "Sarnia Plumbing",
  city: "Sarnia",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Lambton",
  phone: { display: "(226) 778-1469", tel: "+12267781469" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@sarniaplumbing.ca",
  address: {
    street: "265 Front St N",
    locality: "Sarnia",
    region: 'ON',
    postal: "N7T 5S6",
  },
  serviceAreas: ['Sarnia', 'Point Edward', 'Corunna', "Bright's Grove", 'Petrolia', 'Forest', 'Wyoming'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://sarniaplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "sarniaplumbing.ca.png", technicianPhoto: "sarniaplumbing.ca-home-tech.jpg",
    heroImage: "heroes/sarniaplumbing.ca.webp" },
  noindex: false,
};
