// Per-site config for lucanplumbing.ca
// Plumbing lead-gen (plumbing-astro). Lucan, Middlesex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "lucanplumbing.ca",
  url: "https://lucanplumbing.ca",
  brand: "Lucan Plumbing",
  brandHtml: "Lucan Plumbing",
  city: "Lucan",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 227-4479", tel: "+15192274479" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@lucanplumbing.ca",
  address: {
    street: "8 Main St",
    locality: "Lucan",
    region: 'ON',
    postal: "N0M 2J0",
  },
  serviceAreas: ['Lucan', 'Parkhill', 'Ailsa Craig', 'Granton', 'Denfield', 'Exeter', 'London'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://lucanplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-lucanplumbing.ca.png", logo: "lucanplumbing.ca.png", technicianPhoto: "lucanplumbing.ca-home-tech.jpg",
    heroImage: "heroes/lucanplumbing.ca.webp" },
  noindex: true,
};
