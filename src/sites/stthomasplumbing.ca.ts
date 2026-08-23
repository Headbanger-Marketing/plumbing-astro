// Fulfiller: Premier (per NAP-WORKSHEET 2026-08-21).
// Per-site config for stthomasplumbing.ca
// Plumbing lead-gen (plumbing-astro).
// St. Thomas, Elgin County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "stthomasplumbing.ca",
  url: "https://stthomasplumbing.ca",
  brand: "St. Thomas Plumbing",
  brandHtml: "St. Thomas Plumbing",
  city: "St. Thomas",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Elgin",
  phone: { display: "(548) 457-2400", tel: "+15484572400" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@stthomasplumbing.ca",
  address: {
    street: "750 Talbot St",
    locality: "St. Thomas",
    region: 'ON',
    postal: "N5P 1E2",
  },
  serviceAreas: ['St. Thomas', 'London', 'Aylmer', 'Belmont', 'Port Stanley'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://stthomasplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "stthomasplumbing.ca.png", technicianPhoto: "stthomasplumbing.ca-home-tech.jpg",
    heroImage: "heroes/stthomasplumbing.ca.webp" },
  noindex: false,
};
