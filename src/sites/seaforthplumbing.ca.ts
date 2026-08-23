// Per-site config for seaforthplumbing.ca
// Plumbing lead-gen (plumbing-astro). Seaforth, Huron County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "seaforthplumbing.ca",
  url: "https://seaforthplumbing.ca",
  brand: "Seaforth Plumbing",
  brandHtml: "Seaforth Plumbing",
  city: "Seaforth",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(519) 527-1483", tel: "+15195271483" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@seaforthplumbing.ca",
  address: {
    street: "52 Main St S",
    locality: "Seaforth",
    region: 'ON',
    postal: "N0K 1W0",
  },
  serviceAreas: ['Seaforth', 'Zurich', 'Clinton', 'Exeter', 'Bayfield', 'Goderich', 'Grand Bend'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://seaforthplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "seaforthplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
