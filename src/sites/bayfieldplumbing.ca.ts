// Per-site config for bayfieldplumbing.ca
// Plumbing lead-gen (plumbing-astro). Bayfield, Huron County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "bayfieldplumbing.ca",
  url: "https://bayfieldplumbing.ca",
  brand: "Bayfield Plumbing",
  brandHtml: "Bayfield Plumbing",
  city: "Bayfield",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(519) 565-0204", tel: "+15195650204" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@bayfieldplumbing.ca",
  address: {
    street: "19 Main St N",
    locality: "Bayfield",
    region: 'ON',
    postal: "N0M 1G0",
  },
  serviceAreas: ['Bayfield', 'Goderich', 'Clinton', 'Zurich', 'Grand Bend', 'Egmondville', 'Kippen'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://bayfieldplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "bayfieldplumbing.ca.png", technicianPhoto: "bayfieldplumbing.ca-home-tech.jpg",
    heroImage: "heroes/bayfieldplumbing.ca.webp" },
  noindex: true,
};
