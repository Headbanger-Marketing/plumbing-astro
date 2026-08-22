// Per-site config for kitchenerplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Kitchener, Waterloo County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "kitchenerplumbingpros.ca",
  url: "https://kitchenerplumbingpros.ca",
  brand: "Kitchener Plumbing Pros",
  brandHtml: "Kitchener Plumbing Pros",
  city: "Kitchener",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo",
  phone: { display: "(548) 457-1029", tel: "+15484571029" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@kitchenerplumbingpros.ca",
  address: {
    street: "55 Duke St W",
    locality: "Kitchener",
    region: 'ON',
    postal: "N2H 6P2",
  },
  serviceAreas: ['Kitchener', 'Waterloo', 'Cambridge', 'Elmira', 'Ayr', 'New Hamburg', 'Baden'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://kitchenerplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
