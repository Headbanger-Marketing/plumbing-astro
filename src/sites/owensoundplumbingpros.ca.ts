// Per-site config for owensoundplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Owen Sound, Grey County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
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
  phone: { display: "(548) 409-5669", tel: "+15484095669" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@owensoundplumbingpros.ca",
  address: {
    street: "875 2nd Ave E",
    locality: "Owen Sound",
    region: 'ON',
    postal: "N4K 2H5",
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
