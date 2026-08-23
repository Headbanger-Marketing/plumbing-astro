// Per-site config for portdoverplumbing.ca
// Plumbing lead-gen (plumbing-astro). Port Dover, Norfolk County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "portdoverplumbing.ca",
  url: "https://portdoverplumbing.ca",
  brand: "Port Dover Plumbing",
  brandHtml: "Port Dover Plumbing",
  city: "Port Dover",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Norfolk",
  phone: { display: "(519) 583-0742", tel: "+15195830742" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@portdoverplumbing.ca",
  address: {
    street: "18 Main St",
    locality: "Port Dover",
    region: 'ON',
    postal: "N0A 1N0",
  },
  serviceAreas: ['Port Dover', 'Simcoe', 'Waterford', 'Delhi', 'Port Rowan', 'Turkey Point'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://portdoverplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "portdoverplumbing.ca.png", technicianPhoto: "portdoverplumbing.ca-home-tech.jpg",
    heroImage: "heroes/portdoverplumbing.ca.webp" },
  noindex: true,
};
