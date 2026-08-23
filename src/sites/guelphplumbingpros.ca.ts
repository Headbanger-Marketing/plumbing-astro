// Per-site config for guelphplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Guelph, Wellington County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "guelphplumbingpros.ca",
  url: "https://guelphplumbingpros.ca",
  brand: "Guelph Plumbing Pros",
  brandHtml: "Guelph Plumbing Pros",
  city: "Guelph",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Wellington",
  phone: { display: "(548) 554-4288", tel: "+15485544288" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@guelphplumbingpros.ca",
  address: {
    street: "21 Gordon St",
    locality: "Guelph",
    region: 'ON',
    postal: "N1H 3A6",
  },
  serviceAreas: ['Guelph', 'Rockwood', 'Fergus', 'Elora', 'Aberfoyle', 'Morriston', 'Ariss'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://guelphplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-guelphplumbingpros.ca.png", logo: "guelphplumbingpros.ca.png", technicianPhoto: "guelphplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/guelphplumbingpros.ca.webp" },
  noindex: false,
};
