// Per-site config for goderichplumbing.ca
// Fulfiller: Hoffmeyer (per NAP-WORKSHEET 2026-08-21).
// Plumbing lead-gen (plumbing-astro). Goderich, Huron County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "goderichplumbing.ca",
  url: "https://goderichplumbing.ca",
  brand: "Goderich Plumbing",
  brandHtml: "Goderich Plumbing",
  city: "Goderich",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Huron",
  phone: { display: "(548) 290-9633", tel: "+15482909633" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@goderichplumbing.ca",
  address: {
    street: "85 Kingston St",
    locality: "Goderich",
    region: 'ON',
    postal: "N7A 3K3",
  },
  serviceAreas: ['Goderich', 'Clinton', 'Bayfield', 'Vanastra', 'Holmesville', 'Blyth', 'Auburn'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://goderichplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "goderichplumbing.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
