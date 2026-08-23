// Per-site config for georgetownplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Georgetown, Halton County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
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
  phone: { display: "(905) 877-5208", tel: "+19058775208" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@georgetownplumbingpros.ca",
  address: {
    street: "83 Main St S",
    locality: "Georgetown",
    region: 'ON',
    postal: "L7G 3E5",
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
  media: { logo: "georgetownplumbingpros.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
