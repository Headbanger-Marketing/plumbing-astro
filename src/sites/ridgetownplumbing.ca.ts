// Per-site config for ridgetownplumbing.ca
// Plumbing lead-gen (plumbing-astro). Ridgetown, Chatham-Kent. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ridgetownplumbing.ca",
  url: "https://ridgetownplumbing.ca",
  brand: "Ridgetown Plumbing",
  brandHtml: "Ridgetown Plumbing",
  city: "Ridgetown",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Chatham-Kent",
  phone: { display: "(548) 708-7251", tel: "+15487087251" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@ridgetownplumbing.ca",
  address: {
    street: "11 Main St E",
    locality: "Ridgetown",
    region: 'ON',
    postal: "N0P 2C0",
  },
  serviceAreas: ['Ridgetown', 'Chatham', 'Chatham-Kent', 'Blenheim', 'Highgate', 'Wheatley'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ridgetownplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "ridgetownplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
