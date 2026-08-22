// Per-site config for woodstockplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Woodstock, Oxford County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "woodstockplumbingpros.ca",
  url: "https://woodstockplumbingpros.ca",
  brand: "Woodstock Plumbing Pros",
  brandHtml: "Woodstock Plumbing Pros",
  city: "Woodstock",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Oxford",
  phone: { display: "(548) 554-3147", tel: "+15485543147" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@woodstockplumbingpros.ca",
  address: {
    street: "930 Dundas St",
    locality: "Woodstock",
    region: 'ON',
    postal: "N4S 1H1",
  },
  serviceAreas: ['Woodstock', 'Ingersoll', 'Tillsonburg', 'Embro', 'Thamesford', 'Norwich', 'Innerkip'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://woodstockplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "10-water-drop.png", technicianPhoto: "default-technician.jpg" },
  noindex: true,
};
