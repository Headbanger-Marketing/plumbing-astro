// Per-site config for dorchesterplumbing.ca
// Plumbing lead-gen (plumbing-astro). Dorchester, Middlesex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "dorchesterplumbing.ca",
  url: "https://dorchesterplumbing.ca",
  brand: "Dorchester Plumbing",
  brandHtml: "Dorchester Plumbing",
  city: "Dorchester",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 268-0122", tel: "+15192680122" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@dorchesterplumbing.ca",
  address: {
    street: "198 Queen St",
    locality: "Dorchester",
    region: 'ON',
    postal: "N0L 1G0",
  },
  serviceAreas: ['Dorchester', 'Thorndale', 'Thamesford', 'Belmont', 'Putnam', 'London', 'Ingersoll'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://dorchesterplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "dorchesterplumbing.ca.png", technicianPhoto: "dorchesterplumbing.ca-home-tech.jpg",
    heroImage: "heroes/dorchesterplumbing.ca.webp" },
  noindex: true,
};
