// Per-site config for georgetownplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Georgetown, Halton County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "georgetownplumbingpros.ca",
  url: "https://georgetownplumbingpros.ca",
  brand: "Georgetown Plumbing Pros",
  brandHtml: "Georgetown Plumbing Pros",
  city: "Georgetown",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Halton",
  phone: { display: "(905) 555-0195", tel: "+19055550195" }, // PLACEHOLDER
  email: "contact@georgetownplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Georgetown",
    region: 'ON',
    postal: "L7G 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Georgetown', 'Acton', 'Norval', 'Glen Williams', 'Milton', 'Erin'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://georgetownplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
