// Per-site config for tillsonburgplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). Tillsonburg, Oxford County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "tillsonburgplumbingpros.ca",
  url: "https://tillsonburgplumbingpros.ca",
  brand: "Tillsonburg Plumbing Pros",
  brandHtml: "Tillsonburg Plumbing Pros",
  city: "Tillsonburg",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Oxford",
  phone: { display: "(548) 901-3425", tel: "+15489013425" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@tillsonburgplumbingpros.ca",
  address: {
    street: "96 Broadway",
    locality: "Tillsonburg",
    region: 'ON',
    postal: "N4G 3P5",
  },
  serviceAreas: ['Tillsonburg', 'Norwich', 'Otterville', 'Courtland', 'Delhi', 'Simcoe', 'Langton'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://tillsonburgplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { guaranteeBadge: "guarantee-tillsonburgplumbingpros.ca.png", logo: "tillsonburgplumbingpros.ca.png", technicianPhoto: "tillsonburgplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/tillsonburgplumbingpros.ca.webp" },
  noindex: true,
};
