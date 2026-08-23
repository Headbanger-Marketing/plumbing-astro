// Per-site config for ancasterplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Ancaster, Hamilton. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "ancasterplumbingpros.ca",
  url: "https://ancasterplumbingpros.ca",
  brand: "Ancaster Plumbing Pros",
  brandHtml: "Ancaster Plumbing Pros",
  city: "Ancaster",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Hamilton",
  phone: { display: "(289) 204-2884", tel: "+12892042884" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@ancasterplumbingpros.ca",
  address: {
    street: "351 Wilson St E",
    locality: "Ancaster",
    region: 'ON',
    postal: "L9G 2B9",
  },
  serviceAreas: ['Ancaster', 'Dundas', 'Hamilton', 'Waterdown', 'Carlisle', 'Copetown'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://ancasterplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-ancasterplumbingpros.ca.png", logo: "ancasterplumbingpros.ca.png", technicianPhoto: "ancasterplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/ancasterplumbingpros.ca.webp" },
  noindex: false,
};
