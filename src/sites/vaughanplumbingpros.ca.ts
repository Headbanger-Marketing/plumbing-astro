// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "vaughanplumbingpros.ca", url: "https://vaughanplumbingpros.ca",
  brand: "Vaughan Plumbing Pros", brandHtml: "Vaughan Plumbing Pros",
  city: "Vaughan", region: "Ontario", regionAbbr: "ON", county: "York Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@vaughanplumbingpros.ca",
  address: { street: "", locality: "Vaughan", region: "ON", postal: "" },
  serviceAreas: ["Vaughan"],
  palette: { navy: "#25394a", accent: "#156c9c", accent2: "#25394a", themeColor: "#25394a" },
  ogImage: "https://vaughanplumbingpros.ca/assets/wordmarks/vaughanplumbingpros.ca-og.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "vaughanplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
