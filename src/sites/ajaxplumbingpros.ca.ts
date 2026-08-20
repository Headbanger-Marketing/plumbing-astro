// Per-site config for ajaxplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Ajax, Durham County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ajaxplumbingpros.ca",
  url: "https://ajaxplumbingpros.ca",
  brand: "Ajax Plumbing Pros",
  brandHtml: "Ajax Plumbing Pros",
  city: "Ajax",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Durham",
  phone: { display: "(905) 555-0168", tel: "+19055550168" }, // PLACEHOLDER
  email: "contact@ajaxplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Street", // PLACEHOLDER
    locality: "Ajax",
    region: 'ON',
    postal: "L1S 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Ajax', 'Pickering', 'Whitby', 'Greenwood', 'Brougham', 'Oshawa'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ajaxplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
