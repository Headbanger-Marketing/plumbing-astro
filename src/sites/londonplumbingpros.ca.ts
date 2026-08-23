// Per-site config for londonplumbingpros.ca
// Plumbing lead-gen (plumbing-astro). London, Middlesex County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "londonplumbingpros.ca",
  url: "https://londonplumbingpros.ca",
  brand: "London Plumbing Pros",
  brandHtml: "London Plumbing Pros",
  city: "London",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Middlesex",
  phone: { display: "(548) 708-8216", tel: "+15487088216" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@londonplumbingpros.ca",
  address: {
    street: "155 Clarke Rd",
    locality: "London",
    region: 'ON',
    postal: "N5W 5C9",
  },
  serviceAreas: ['London', 'Byron', 'Lambeth', 'Hyde Park', 'Masonville', 'Dorchester', 'St. Thomas'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://londonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  // Imagery pilot 2026-08-23: per-site Unsplash stock (scripts/gen-imagery-unsplash.py)
  media: { guaranteeBadge: "guarantee-londonplumbingpros.ca.png", logo: "londonplumbingpros.ca.png",
    technicianPhoto: "londonplumbingpros.ca-home-tech.jpg",
    heroImage: "heroes/londonplumbingpros.ca.webp",
  },
  noindex: false,
};
