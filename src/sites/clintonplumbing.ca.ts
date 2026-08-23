// Per-site config for clintonplumbing.ca
// Plumbing lead-gen (plumbing-astro). Clinton, Huron County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "clintonplumbing.ca",
  url: "https://clintonplumbing.ca",
  brand: "Clinton Plumbing",
  brandHtml: "Clinton Plumbing",
  city: "Clinton",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(519) 482-0143", tel: "+15194820143" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@clintonplumbing.ca",
  address: {
    street: "52 Albert St",
    locality: "Clinton",
    region: 'ON',
    postal: "N0M 1L0",
  },
  serviceAreas: ['Clinton', 'Seaforth', 'Goderich', 'Bayfield', 'Vanastra', 'Holmesville', 'Londesborough'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://clintonplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-clintonplumbing.ca.png", logo: "clintonplumbing.ca.png", technicianPhoto: "clintonplumbing.ca-home-tech.jpg",
    heroImage: "heroes/clintonplumbing.ca.webp" },
  noindex: true,
};
