// Per-site config for aylmerplumbing.ca
// Plumbing lead-gen (plumbing-astro). Aylmer, Elgin County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "aylmerplumbing.ca",
  url: "https://aylmerplumbing.ca",
  brand: "Aylmer Plumbing",
  brandHtml: "Aylmer Plumbing",
  city: "Aylmer",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Elgin",
  phone: { display: "(519) 765-3092", tel: "+15197653092" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@aylmerplumbing.ca",
  address: {
    street: "38 Talbot St E",
    locality: "Aylmer",
    region: 'ON',
    postal: "N5H 1H3",
  },
  serviceAreas: ['Aylmer', 'Springfield', 'Port Burwell', 'Vienna', 'Malahide', 'Tillsonburg', 'St. Thomas'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://aylmerplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-aylmerplumbing.ca.png", logo: "aylmerplumbing.ca.png", technicianPhoto: "aylmerplumbing.ca-home-tech.jpg",
    heroImage: "heroes/aylmerplumbing.ca.webp" },
  noindex: true,
};
