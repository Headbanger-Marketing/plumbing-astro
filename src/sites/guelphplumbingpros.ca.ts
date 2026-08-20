// Per-site config for guelphplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Guelph, Wellington County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "guelphplumbingpros.ca",
  url: "https://guelphplumbingpros.ca",
  brand: "Guelph Plumbing Pros",
  brandHtml: "Guelph Plumbing Pros",
  city: "Guelph",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Wellington",
  phone: { display: "(519) 555-0124", tel: "+15195550124" }, // PLACEHOLDER
  email: "contact@guelphplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street West", // PLACEHOLDER
    locality: "Guelph",
    region: 'ON',
    postal: "N1H 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Guelph', 'Rockwood', 'Fergus', 'Elora', 'Aberfoyle', 'Morriston', 'Ariss'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://guelphplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
