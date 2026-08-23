// Per-site config for burlingtonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Burlington, Halton County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "burlingtonplumbingpros.ca",
  url: "https://burlingtonplumbingpros.ca",
  brand: "Burlington Plumbing Pros",
  brandHtml: "Burlington Plumbing Pros",
  city: "Burlington",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Halton",
  phone: { display: "(905) 637-4218", tel: "+19056374218" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@burlingtonplumbingpros.ca",
  address: {
    street: "414 Locust St",
    locality: "Burlington",
    region: 'ON',
    postal: "L7S 1T7",
  },
  serviceAreas: ['Burlington', 'Oakville', 'Hamilton', 'Waterdown', 'Ancaster', 'Milton'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://burlingtonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "burlingtonplumbingpros.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
