// Per-site config for waterlooplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Waterloo, Waterloo County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "waterlooplumbingpros.ca",
  url: "https://waterlooplumbingpros.ca",
  brand: "Waterloo Plumbing Pros",
  brandHtml: "Waterloo Plumbing Pros",
  city: "Waterloo",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo Region",
  phone: { display: "(548) 490-6741", tel: "+15484906741" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@waterlooplumbingpros.ca",
  address: {
    street: "180 King St S",
    locality: "Waterloo",
    region: 'ON',
    postal: "N2J 1P7",
  },
  serviceAreas: ['Waterloo', 'Kitchener', 'Elmira', 'St. Jacobs', 'Conestogo', 'Cambridge', 'Ayr'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://waterlooplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "waterlooplumbingpros.ca.png", technicianPhoto: "waterlooplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/waterlooplumbingpros.ca.webp" },
  noindex: false,
};
