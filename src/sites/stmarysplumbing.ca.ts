// Per-site config for stmarysplumbing.ca
// Plumbing lead-gen (plumbing-astro). St. Marys, Perth County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "stmarysplumbing.ca",
  url: "https://stmarysplumbing.ca",
  brand: "St. Marys Plumbing",
  brandHtml: "St. Marys Plumbing",
  city: "St. Marys",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Perth",
  phone: { display: "(519) 284-0161", tel: "+15192840161" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@stmarysplumbing.ca",
  address: {
    street: "155 Queen St E",
    locality: "St. Marys",
    region: 'ON',
    postal: "N4X 1B3",
  },
  serviceAreas: ['St. Marys', 'Stratford', 'Kirkton', 'Thorndale', 'Embro', 'Thamesford', 'Sebringville'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://stmarysplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "stmarysplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
