// Per-site config for cambridgeplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Cambridge, Waterloo County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "cambridgeplumbingpros.ca",
  url: "https://cambridgeplumbingpros.ca",
  brand: "Cambridge Plumbing Pros",
  brandHtml: "Cambridge Plumbing Pros",
  city: "Cambridge",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo",
  phone: { display: "(519) 623-1847", tel: "+15196231847" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@cambridgeplumbingpros.ca",
  address: {
    street: "73 Main St",
    locality: "Cambridge",
    region: 'ON',
    postal: "N1R 1V9",
  },
  serviceAreas: ['Cambridge', 'Kitchener', 'Ayr', 'Paris', 'Brantford', 'Guelph', 'Waterloo'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://cambridgeplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "cambridgeplumbingpros.ca.png", technicianPhoto: "cambridgeplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/cambridgeplumbingpros.ca.webp" },
  noindex: false,
};
