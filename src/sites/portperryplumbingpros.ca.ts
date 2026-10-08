// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "portperryplumbingpros.ca", url: "https://portperryplumbingpros.ca",
  brand: "Port Perry Plumbing Pros", brandHtml: "Port Perry Plumbing Pros",
  city: "Port Perry", region: "Ontario", regionAbbr: "ON", county: "Durham Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@portperryplumbingpros.ca",
  address: { street: "", locality: "Port Perry", region: "ON", postal: "" },
  serviceAreas: ["Port Perry"],
  palette: { navy: "#263b55", accent: "#23669d", accent2: "#263b55", themeColor: "#263b55" },
  ogImage: "https://portperryplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "portperryplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
