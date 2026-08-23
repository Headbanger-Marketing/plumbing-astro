// Per-site config for newmarketplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Newmarket, York County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "newmarketplumbingpros.ca",
  url: "https://newmarketplumbingpros.ca",
  brand: "Newmarket Plumbing Pros",
  brandHtml: "Newmarket Plumbing Pros",
  city: "Newmarket",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "York",
  phone: { display: "(905) 895-4172", tel: "+19058954172" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@newmarketplumbingpros.ca",
  address: {
    street: "130 Davis Dr",
    locality: "Newmarket",
    region: 'ON',
    postal: "L3Y 2N1",
  },
  serviceAreas: ['Newmarket', 'Aurora', 'Sharon', 'Queensville', 'Holland Landing', 'Bradford'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://newmarketplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
