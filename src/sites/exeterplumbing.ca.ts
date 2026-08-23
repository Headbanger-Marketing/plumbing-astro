// Per-site config for exeterplumbing.ca
// Plumbing lead-gen (plumbing-astro). Exeter, Huron County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "exeterplumbing.ca",
  url: "https://exeterplumbing.ca",
  brand: "Exeter Plumbing",
  brandHtml: "Exeter Plumbing",
  city: "Exeter",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(548) 901-0020", tel: "+15489010020" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@exeterplumbing.ca",
  address: {
    street: "135 Main St",
    locality: "Exeter",
    region: 'ON',
    postal: "N0M 1S0",
  },
  serviceAreas: ['Exeter', 'Grand Bend', 'Seaforth', 'Dashwood', 'Crediton', 'Huron Park', 'Centralia'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://exeterplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-exeterplumbing.ca.png", logo: "exeterplumbing.ca.png", technicianPhoto: "exeterplumbing.ca-home-tech.jpg",
    heroImage: "heroes/exeterplumbing.ca.webp" },
  noindex: true,
};
