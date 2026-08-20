// Per-site config for chathamplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Chatham, Chatham-Kent. ⚠️ PLACEHOLDER NAP (2026-08-19).
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
  phone: { display: "(519) 555-0132", tel: "+15195550132" }, // PLACEHOLDER
  email: "contact@chathamplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street West", // PLACEHOLDER
    locality: "Chatham",
    region: 'ON',
    postal: "N7L 1A1", // PLACEHOLDER
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
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
