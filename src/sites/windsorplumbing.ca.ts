// Per-site config for windsorplumbing.ca
// Plumbing lead-gen (plumbing-astro). Windsor, Essex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
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
  phone: { display: "(548) 708-7480", tel: "+15487087480" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@windsorplumbing.ca",
  address: {
    street: "2660 Jefferson Blvd",
    locality: "Windsor",
    region: 'ON',
    postal: "N8T 3C7",
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
  media: { logo: "windsorplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
