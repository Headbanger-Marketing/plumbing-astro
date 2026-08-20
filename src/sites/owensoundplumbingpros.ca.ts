// Per-site config for owensoundplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Owen Sound, Grey County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "owensoundplumbingpros.ca",
  url: "https://owensoundplumbingpros.ca",
  brand: "Owen Sound Plumbing Pros",
  brandHtml: "Owen Sound Plumbing Pros",
  city: "Owen Sound",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Grey",
  phone: { display: "(519) 555-0123", tel: "+15195550123" }, // PLACEHOLDER
  email: "contact@owensoundplumbingpros.ca",
  address: {
    street: "PLACEHOLDER 2nd Avenue East", // PLACEHOLDER
    locality: "Owen Sound",
    region: 'ON',
    postal: "N4K 2M6", // PLACEHOLDER
  },
  serviceAreas: ['Owen Sound', 'Meaford', 'Chatsworth', 'Wiarton', 'Hanover', 'Durham', 'Saugeen Shores'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://owensoundplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
