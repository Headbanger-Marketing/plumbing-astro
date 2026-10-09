// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "beavertonplumbingpros.ca", url: "https://beavertonplumbingpros.ca",
  brand: "Beaverton Plumbing Pros", brandHtml: "Beaverton Plumbing Pros",
  city: "Beaverton", region: "Ontario", regionAbbr: "ON", county: "Durham Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@beavertonplumbingpros.ca",
  address: { street: "", locality: "Beaverton", region: "ON", postal: "" },
  serviceAreas: ["Beaverton"],
  palette: { navy: "#343c45", accent: "#476682", accent2: "#343c45", themeColor: "#343c45" },
  ogImage: "https://beavertonplumbingpros.ca/assets/wordmarks/beavertonplumbingpros.ca-og.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "beavertonplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
