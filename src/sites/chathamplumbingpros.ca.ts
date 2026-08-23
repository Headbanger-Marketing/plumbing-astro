// Per-site config for chathamplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Chatham, Chatham-Kent. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "chathamplumbingpros.ca",
  url: "https://chathamplumbingpros.ca",
  brand: "Chatham Plumbing Pros",
  brandHtml: "Chatham Plumbing Pros",
  city: "Chatham",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Chatham-Kent",
  phone: { display: "(548) 901-3519", tel: "+15489013519" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@chathamplumbingpros.ca",
  address: {
    street: "425 Grand Ave W",
    locality: "Chatham",
    region: 'ON',
    postal: "N7M 5J1",
  },
  serviceAreas: ['Chatham', 'Chatham-Kent', 'Wallaceburg', 'Ridgetown', 'Blenheim', 'Thamesville'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://chathamplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "chathamplumbingpros.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
