// Per-site config for forestplumbing.ca
// Plumbing lead-gen (plumbing-astro). Forest, Lambton County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "forestplumbing.ca",
  url: "https://forestplumbing.ca",
  brand: "Forest Plumbing",
  brandHtml: "Forest Plumbing",
  city: "Forest",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Lambton",
  phone: { display: "(519) 786-0148", tel: "+15197860148" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@forestplumbing.ca",
  address: {
    street: "14 King St W",
    locality: "Forest",
    region: 'ON',
    postal: "N0N 1J0",
  },
  serviceAreas: ['Forest', 'Thedford', 'Arkona', 'Grand Bend', 'Petrolia', 'Sarnia'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://forestplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "forestplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
