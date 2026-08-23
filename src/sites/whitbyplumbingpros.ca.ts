// Per-site config for whitbyplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Whitby, Durham County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "whitbyplumbingpros.ca",
  url: "https://whitbyplumbingpros.ca",
  brand: "Whitby Plumbing Pros",
  brandHtml: "Whitby Plumbing Pros",
  city: "Whitby",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Durham",
  phone: { display: "(905) 668-7214", tel: "+19056687214" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@whitbyplumbingpros.ca",
  address: {
    street: "128 Brock St S",
    locality: "Whitby",
    region: 'ON',
    postal: "L1N 4J8",
  },
  serviceAreas: ['Whitby', 'Brooklin', 'Ashburn', 'Myrtle', 'Oshawa', 'Ajax'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://whitbyplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "whitbyplumbingpros.ca.png", technicianPhoto: "default-technician.jpg" },
  noindex: false,
};
