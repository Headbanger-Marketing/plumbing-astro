// Per-site config for mitchellplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Mitchell, Perth County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "mitchellplumbingpros.ca",
  url: "https://mitchellplumbingpros.ca",
  brand: "Mitchell Plumbing Pros",
  brandHtml: "Mitchell Plumbing Pros",
  city: "Mitchell",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Perth",
  phone: { display: "(519) 555-0127", tel: "+15195550127" }, // PLACEHOLDER
  email: "contact@mitchellplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Huron Road", // PLACEHOLDER
    locality: "Mitchell",
    region: 'ON',
    postal: "N0K 1N0", // PLACEHOLDER
  },
  serviceAreas: ['Mitchell', 'Sebringville', 'Monkton', 'Listowel', 'St. Marys', 'Stratford', 'Shakespeare'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://mitchellplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
