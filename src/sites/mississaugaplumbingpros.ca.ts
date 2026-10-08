// Headbanger-owned inquiry website. No represented local contractor or physical business location.
import type { SiteConfig } from '../lib/types';
export const site: SiteConfig = {
  enquirySite: true,
  domain: "mississaugaplumbingpros.ca", url: "https://mississaugaplumbingpros.ca",
  brand: "Mississauga Plumbing Pros", brandHtml: "Mississauga Plumbing Pros",
  city: "Mississauga", region: "Ontario", regionAbbr: "ON", county: "Peel Region",
  phone: { display: "", tel: "" }, hidePhone: true,
  email: "contact@mississaugaplumbingpros.ca",
  address: { street: "", locality: "Mississauga", region: "ON", postal: "" },
  serviceAreas: ["Mississauga"],
  palette: { navy: "#183643", accent: "#006d77", accent2: "#183643", themeColor: "#183643" },
  ogImage: "https://mississaugaplumbingpros.ca/assets/img/og-default.png",
  tracking: { webhookUrl: "https://auto.sdagents.ai/webhook/hvac-sites" },
  media: { logo: "mississaugaplumbingpros.ca.svg", technicianPhoto: "markhamplumbingpros.ca-home-tech.jpg", heroImage: "wp/markhamplumbingpros.ca-home-tech.jpg" },
  noindex: false,
  thankYouRedirect: "/thank-you/",
};
