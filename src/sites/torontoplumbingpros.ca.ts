// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "torontoplumbingpros.ca", url: "https://torontoplumbingpros.ca",
  brand: "Toronto Plumbing Pros", brandHtml: "Toronto Plumbing Pros",
  city: "Toronto", region: "Ontario", regionAbbr: "ON", county: "Toronto",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@torontoplumbingpros.ca",
  address: { street: "", locality: "Toronto", region: "ON", postal: "" },
  serviceAreas: ["Toronto"],
  palette: { navy: "#17314b", accent: "#007ea7", accent2: "#17314b", themeColor: "#17314b" },
  ogImage: "https://torontoplumbingpros.ca/assets/wordmarks/torontoplumbingpros.ca-og.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "torontoplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
