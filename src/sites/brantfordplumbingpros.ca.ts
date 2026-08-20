// Per-site config for brantfordplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Brantford, Brant County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "brantfordplumbingpros.ca",
  url: "https://brantfordplumbingpros.ca",
  brand: "Brantford Plumbing Pros",
  brandHtml: "Brantford Plumbing Pros",
  city: "Brantford",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Brant",
  phone: { display: "(519) 555-0123", tel: "+15195550123" }, // PLACEHOLDER
  email: "contact@brantfordplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Brantford",
    region: 'ON',
    postal: "N3R 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Brantford', 'Paris', 'St. George', 'Burford', 'Scotland', 'Mount Pleasant', 'Cainsville'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://brantfordplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
