// Per-site config for brantfordplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Brantford, Brant County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "brantfordplumbingpros.ca",
  url: "https://brantfordplumbingpros.ca",
  brand: "Brantford Plumbing Pros",
  brandHtml: "Brantford Plumbing Pros",
  city: "Brantford",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Brant",
  phone: { display: "(519) 756-3142", tel: "+15197563142" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@brantfordplumbingpros.ca",
  address: {
    street: "100 Dalhousie St",
    locality: "Brantford",
    region: 'ON',
    postal: "N3T 2J1",
  },
  serviceAreas: ['Brantford', 'Paris', 'St. George', 'Burford', 'Scotland', 'Mount Pleasant', 'Cainsville'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://brantfordplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "brantfordplumbingpros.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
