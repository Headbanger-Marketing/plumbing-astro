// Per-site config for pickeringplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Pickering, Durham County. ⚠️ PLACEHOLDER NAP (2026-08-19).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "pickeringplumbingpros.ca",
  url: "https://pickeringplumbingpros.ca",
  brand: "Pickering Plumbing Pros",
  brandHtml: "Pickering Plumbing Pros",
  city: "Pickering",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Durham",
  phone: { display: "(905) 555-0169", tel: "+19055550169" }, // PLACEHOLDER
  email: "contact@pickeringplumbingpros.ca",
  address: {
    street: "PLACEHOLDER Road", // PLACEHOLDER
    locality: "Pickering",
    region: 'ON',
    postal: "L1V 1A1", // PLACEHOLDER
  },
  serviceAreas: ['Pickering', 'Ajax', 'Whitevale', 'Brougham', 'Claremont', 'Greenwood', 'Whitby'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://pickeringplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
