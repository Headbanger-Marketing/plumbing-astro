// Per-site config for stratfordplumbing.ca
// Plumbing lead-gen (plumbing-astro). Stratford, Perth County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "stratfordplumbing.ca",
  url: "https://stratfordplumbing.ca",
  brand: "Stratford Plumbing",
  brandHtml: "Stratford Plumbing",
  city: "Stratford",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Perth",
  phone: { display: "(548) 490-0267", tel: "+15484900267" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@stratfordplumbing.ca",
  address: {
    street: "80 Ontario St",
    locality: "Stratford",
    region: 'ON',
    postal: "N5A 3H1",
  },
  serviceAreas: ['Stratford', 'Sebringville', 'Shakespeare', 'Tavistock', 'Mitchell', 'St. Marys', 'Kirkton'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://stratfordplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
