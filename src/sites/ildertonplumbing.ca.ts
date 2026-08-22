// Per-site config for ildertonplumbing.ca
// Plumbing lead-gen (plumbing-astro). Ilderton, Middlesex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ildertonplumbing.ca",
  url: "https://ildertonplumbing.ca",
  brand: "Ilderton Plumbing",
  brandHtml: "Ilderton Plumbing",
  city: "Ilderton",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(519) 666-0188", tel: "+15196660188" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@ildertonplumbing.ca",
  address: {
    street: "21 Ilderton Rd",
    locality: "Ilderton",
    region: 'ON',
    postal: "N0M 2A0",
  },
  serviceAreas: ['Ilderton', 'Komoka', 'Denfield', 'Arva', 'Granton', 'London', 'Strathroy'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ildertonplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
