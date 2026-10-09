// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "stouffvilleplumbingpros.ca", url: "https://stouffvilleplumbingpros.ca",
  brand: "Stouffville Plumbing Pros", brandHtml: "Stouffville Plumbing Pros",
  city: "Stouffville", region: "Ontario", regionAbbr: "ON", county: "York Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@stouffvilleplumbingpros.ca",
  address: { street: "", locality: "Stouffville", region: "ON", postal: "" },
  serviceAreas: ["Stouffville"],
  palette: { navy: "#263247", accent: "#3b5cb0", accent2: "#263247", themeColor: "#263247" },
  ogImage: "https://stouffvilleplumbingpros.ca/assets/wordmarks/stouffvilleplumbingpros.ca-og.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "stouffvilleplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
