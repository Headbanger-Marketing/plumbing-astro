// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "kingcityplumbingpros.ca", url: "https://kingcityplumbingpros.ca",
  brand: "King City Plumbing Pros", brandHtml: "King City Plumbing Pros",
  city: "King City", region: "Ontario", regionAbbr: "ON", county: "York Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@kingcityplumbingpros.ca",
  address: { street: "", locality: "King City", region: "ON", postal: "" },
  serviceAreas: ["King City"],
  palette: { navy: "#263c40", accent: "#006b70", accent2: "#263c40", themeColor: "#263c40" },
  ogImage: "https://kingcityplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "kingcityplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
