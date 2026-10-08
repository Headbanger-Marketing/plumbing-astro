// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "bowmanvilleplumbingpros.ca", url: "https://bowmanvilleplumbingpros.ca",
  brand: "Bowmanville Plumbing Pros", brandHtml: "Bowmanville Plumbing Pros",
  city: "Bowmanville", region: "Ontario", regionAbbr: "ON", county: "Durham Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@bowmanvilleplumbingpros.ca",
  address: { street: "", locality: "Bowmanville", region: "ON", postal: "" },
  serviceAreas: ["Bowmanville"],
  palette: { navy: "#153f46", accent: "#007a83", accent2: "#153f46", themeColor: "#153f46" },
  ogImage: "https://bowmanvilleplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "bowmanvilleplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
