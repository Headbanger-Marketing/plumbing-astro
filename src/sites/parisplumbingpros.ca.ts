// Per-site config for parisplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Paris, Brant County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "parisplumbingpros.ca",
  url: "https://parisplumbingpros.ca",
  brand: "Paris Plumbing Pros",
  brandHtml: "Paris Plumbing Pros",
  city: "Paris",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Brant",
  phone: { display: "(519) 555-0126", tel: "+15195550126" }, // PLACEHOLDER
  email: "contact@parisplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Main Street", // PLACEHOLDER
    locality: "Paris",
    region: 'ON',
    postal: "N3L 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Paris', 'St. George', 'Glen Morris', 'Mount Pleasant', 'Ayr', 'Brantford'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://parisplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
