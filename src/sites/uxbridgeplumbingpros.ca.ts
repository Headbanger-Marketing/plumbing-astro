// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "uxbridgeplumbingpros.ca", url: "https://uxbridgeplumbingpros.ca",
  brand: "Uxbridge Plumbing Pros", brandHtml: "Uxbridge Plumbing Pros",
  city: "Uxbridge", region: "Ontario", regionAbbr: "ON", county: "Durham Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@uxbridgeplumbingpros.ca",
  address: { street: "", locality: "Uxbridge", region: "ON", postal: "" },
  serviceAreas: ["Uxbridge"],
  palette: { navy: "#31423b", accent: "#476c51", accent2: "#31423b", themeColor: "#31423b" },
  ogImage: "https://uxbridgeplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "uxbridgeplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
