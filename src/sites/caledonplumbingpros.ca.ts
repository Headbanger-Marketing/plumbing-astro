// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "caledonplumbingpros.ca", url: "https://caledonplumbingpros.ca",
  brand: "Caledon Plumbing Pros", brandHtml: "Caledon Plumbing Pros",
  city: "Caledon", region: "Ontario", regionAbbr: "ON", county: "Peel Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@caledonplumbingpros.ca",
  address: { street: "", locality: "Caledon", region: "ON", postal: "" },
  serviceAreas: ["Caledon"],
  palette: { navy: "#293e32", accent: "#387044", accent2: "#293e32", themeColor: "#293e32" },
  ogImage: "https://caledonplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "caledonplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
