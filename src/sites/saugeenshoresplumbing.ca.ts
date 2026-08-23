// Per-site config for saugeenshoresplumbing.ca
// Plumbing lead-gen (plumbing-astro). Saugeen Shores, Bruce County. NAP applied 2026-08-22 (NAP-WORKSHEET straggler sign-off — Chatham/Port Elgin anchor, verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "saugeenshoresplumbing.ca",
  url: "https://saugeenshoresplumbing.ca",
  brand: "Saugeen Shores Plumbing",
  brandHtml: "Saugeen Shores Plumbing",
  city: "Saugeen Shores",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Bruce",
  phone: { display: "(548) 290-8004", tel: "+15482908004" }, // real (NAP-WORKSHEET straggler sign-off 2026-08-22)
  email: "contact@saugeenshoresplumbing.ca",
  address: {
    street: "610 Goderich St",
    locality: "Port Elgin",
    region: 'ON',
    postal: "N0H 2L0",
  },
  serviceAreas: ['Saugeen Shores', 'Port Elgin', 'Southampton', 'Inverhuron', 'Northport', 'Tara', 'Paisley'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://saugeenshoresplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "saugeenshoresplumbing.ca.png", technicianPhoto: "saugeenshoresplumbing.ca-home-tech.jpg",
    heroImage: "heroes/saugeenshoresplumbing.ca.webp" },
  noindex: false,
};
