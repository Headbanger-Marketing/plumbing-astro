// Per-site config for windsorplumbing.ca
// Plumbing lead-gen (plumbing-astro). Windsor, Essex County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "windsorplumbing.ca",
  url: "https://windsorplumbing.ca",
  brand: "Windsor Plumbing",
  brandHtml: "Windsor Plumbing",
  city: "Windsor",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(519) 555-0126", tel: "+15195550126" }, // PLACEHOLDER
  email: "contact@windsorplumbing.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Windsor",
    region: 'ON',
    postal: "N9A 1A6", // PLACEHOLDER
  },
  serviceAreas: ['Windsor', 'LaSalle', 'Tecumseh', 'Amherstburg', 'Lakeshore', 'Essex', 'Leamington'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://windsorplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
