// Per-site config for hamiltonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Hamilton, Hamilton. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "hamiltonplumbingpros.ca",
  url: "https://hamiltonplumbingpros.ca",
  brand: "Hamilton Plumbing Pros",
  brandHtml: "Hamilton Plumbing Pros",
  city: "Hamilton",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Hamilton",
  phone: { display: "(905) 522-4817", tel: "+19055224817" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@hamiltonplumbingpros.ca",
  address: {
    street: "20 Jackson St W",
    locality: "Hamilton",
    region: 'ON',
    postal: "L8P 1L2",
  },
  serviceAreas: ['Hamilton', 'Stoney Creek', 'Dundas', 'Ancaster', 'Waterdown', 'Binbrook', 'Winona'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://hamiltonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
