// Per-site config for pickeringplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Pickering, Durham County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
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
  phone: { display: "(905) 831-4059", tel: "+19058314059" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@pickeringplumbingpros.ca",
  address: {
    street: "1355 Kingston Rd",
    locality: "Pickering",
    region: 'ON',
    postal: "L1V 1B8",
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
  media: { guaranteeBadge: "guarantee-pickeringplumbingpros.ca.png", logo: "pickeringplumbingpros.ca.png", technicianPhoto: "pickeringplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/pickeringplumbingpros.ca.webp" },
  noindex: false,
};
