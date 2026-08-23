// Per-site config for elmiraplumbing.ca
// Plumbing lead-gen (plumbing-astro). Elmira, Waterloo County. NAP applied 2026-08-21 (NAP-WORKSHEET HVAC-estate prefill — verify before publish).
import type { SiteConfig } from '../lib/types';

export const site: SiteConfig = {
  domain: "elmiraplumbing.ca",
  url: "https://elmiraplumbing.ca",
  brand: "Elmira Plumbing",
  brandHtml: "Elmira Plumbing",
  city: "Elmira",
  region: 'Ontario',
  regionAbbr: 'ON',
  county: "Waterloo",
  phone: { display: "(519) 669-4738", tel: "+15196694738" }, // real (NAP-WORKSHEET 2026-08-21)
  email: "contact@elmiraplumbing.ca",
  address: {
    street: "25 Arthur St S",
    locality: "Elmira",
    region: 'ON',
    postal: "N3B 2M5",
  },
  serviceAreas: ['Elmira', 'St. Jacobs', 'Conestogo', 'Bloomingdale', 'Winterbourne', 'Maryhill', 'Waterloo'],
  palette: {
    navy: "#1f2937",
    accent: "#0ea5e9",
    accent2: "#1f2937",
    themeColor: "#1f2937",
  },
  ogImage: "https://elmiraplumbing.ca/assets/img/og-default.png",
  tracking: { webhookUrl: 'https://auto.sdagents.ai/webhook/hvac-sites' },
  media: { logo: "elmiraplumbing.ca.png", technicianPhoto: "elmiraplumbing.ca-home-tech.jpg",
    heroImage: "heroes/elmiraplumbing.ca.webp" },
  noindex: true,
};
