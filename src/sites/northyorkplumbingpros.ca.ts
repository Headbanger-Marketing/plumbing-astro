// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "northyorkplumbingpros.ca", url: "https://northyorkplumbingpros.ca",
  brand: "North York Plumbing Pros", brandHtml: "North York Plumbing Pros",
  city: "North York", region: "Ontario", regionAbbr: "ON", county: "North York",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@northyorkplumbingpros.ca",
  address: { street: "", locality: "North York", region: "ON", postal: "" },
  serviceAreas: ["North York"],
  palette: { navy: "#202e4b", accent: "#3949ab", accent2: "#202e4b", themeColor: "#202e4b" },
  ogImage: "https://northyorkplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "northyorkplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
