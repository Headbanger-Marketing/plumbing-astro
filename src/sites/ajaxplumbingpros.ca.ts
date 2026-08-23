// Per-site config for ajaxplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Ajax, Durham County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
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
  phone: { display: "(905) 619-3742", tel: "+19056193742" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@ajaxplumbingpros.ca",
  address: {
    street: "75 Bayly St W",
    locality: "Ajax",
    region: 'ON',
    postal: "L1S 7K7",
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
  noindex: false,
};
