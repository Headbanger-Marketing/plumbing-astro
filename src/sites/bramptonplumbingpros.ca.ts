// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "bramptonplumbingpros.ca", url: "https://bramptonplumbingpros.ca",
  brand: "Brampton Plumbing Pros", brandHtml: "Brampton Plumbing Pros",
  city: "Brampton", region: "Ontario", regionAbbr: "ON", county: "Peel Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@bramptonplumbingpros.ca",
  address: { street: "", locality: "Brampton", region: "ON", postal: "" },
  serviceAreas: ["Brampton"],
  palette: { navy: "#232f4d", accent: "#2956a3", accent2: "#232f4d", themeColor: "#232f4d" },
  ogImage: "https://bramptonplumbingpros.ca/assets/wordmarks/bramptonplumbingpros.ca-og.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "bramptonplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
