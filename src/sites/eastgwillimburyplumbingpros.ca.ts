// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "eastgwillimburyplumbingpros.ca", url: "https://eastgwillimburyplumbingpros.ca",
  brand: "East Gwillimbury Plumbing Pros", brandHtml: "East Gwillimbury Plumbing Pros",
  city: "East Gwillimbury", region: "Ontario", regionAbbr: "ON", county: "York Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@eastgwillimburyplumbingpros.ca",
  address: { street: "", locality: "East Gwillimbury", region: "ON", postal: "" },
  serviceAreas: ["East Gwillimbury"],
  palette: { navy: "#34394c", accent: "#565aac", accent2: "#34394c", themeColor: "#34394c" },
  ogImage: "https://eastgwillimburyplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "eastgwillimburyplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
