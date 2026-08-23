// Per-site config for amherstburgplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Amherstburg, Essex County, on the
// Detroit River at the mouth of Lake Erie. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "amherstburgplumbingpros.ca",
  url: "https://amherstburgplumbingpros.ca",
  brand: "Amherstburg Plumbing Pros",
  brandHtml: "Amherstburg Plumbing Pros",
  city: "Amherstburg",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Essex",
  phone: { display: "(548) 918-5036", tel: "+15489185036" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@amherstburgplumbingpros.ca",
  address: {
    street: "61 Richmond St",
    locality: "Amherstburg",
    region: 'ON',
    postal: "N9V 1G2",
  },
  serviceAreas: ['Amherstburg', 'McGregor', 'River Canard', 'Windsor', 'LaSalle', 'Essex', 'Harrow'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://amherstburgplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "amherstburgplumbingpros.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
