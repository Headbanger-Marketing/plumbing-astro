// Shared helpers ported from build.py / build_pages.py.
import type { SiteConfig } from '../lib/types';
import { icon } from './icons';
import { pick } from './variants';

// build_pages.py::link_brand_home
// Give a page one in-body branded link to the homepage (the money page):
// turn the FIRST prose occurrence of the brand name into a link to '/'.
// Checks the &amp; (HTML-escaped) form first so it matches body prose, not the raw-& H1.
export function linkBrandHome(html: string, s: SiteConfig): string {
  for (const brand of [s.brandHtml, s.brand]) {
    const i = html.indexOf(brand);
    if (i !== -1) {
      return `${html.slice(0, i)}<a href="/">${brand}</a>${html.slice(i + brand.length)}`;
    }
  }
  return html;
}

// Per-vertical copy fragments for the location/service-area template.
// These describe project inquiries and planning, with provider details confirmed
// directly before any work is agreed.
export interface VerticalCopy {
  serviceName: string;       // "HVAC Service" | "Generator Service" | ...
  heroH1: (loc: string) => string;          // page-hero <h1>
  bodyEyebrow: string;                      // split-section eyebrow
  bodyLead: (loc: string, county: string, city: string, brand: string) => string; // body paragraph
  faqHeading: (loc: string) => string;      // FAQ <h2>
  titleSlug: (loc: string) => string;       // <title> prefix (before " | Brand")
  quoteHeading: string;                     // QuoteForm heading
  ctaText: (loc: string) => string;         // closing ctaBand paragraph
  // shared chrome (header/footer/topbar/schema)
  businessType: string;                     // schema.org @type
  tagline: (city: string, county: string) => string;  // footer "about" line
  emergency: string;                        // topbar emergency-service label
  hasServicesNav: boolean;                  // show Services dropdown (HVAC only)
  hasBlog: boolean;                         // show Blog nav (HVAC only)
}

export function verticalCopy(site: SiteConfig): VerticalCopy {
  switch (site.vertical) {
    case 'generator':
      return {
        serviceName: 'Generator Service',
        heroH1: (loc) => `Standby Generator Service in ${loc}, Ontario`,
        bodyEyebrow: 'Local Generator Service',
        bodyLead: (loc, county, _city, _brand) =>
          `For a generator inquiry in ${loc}, identify the existing unit, fuel supply, transfer switch and work requested. Include property access and any proposed equipment. The responding provider must confirm the design, qualifications, permits, scope and availability before work is agreed.`,
        faqHeading: (loc) => `${loc} Generator Questions`,
        titleSlug: (loc) => `${loc} Generator Service`,
        quoteHeading: 'Request a Generator Quote',
        ctaText: (loc) => `Describe the generator project at your ${loc} property. Ask the responding provider to confirm equipment compatibility, installation requirements, coverage and scheduling.`,
        // HomeAndConstructionBusiness is the schema.org trades parent that HVACBusiness
        // specializes; a standby-generator installer does fuel lines, transfer switches,
        // permits, and pad pours, which is construction work, not electrical service calls.
        // (schema.org has no generator-specific type.)
        businessType: 'HomeAndConstructionBusiness',
        tagline: (city, county) => `Generator project guidance and online inquiries for ${city}, Ontario and ${county}. Confirm provider qualifications, scope, coverage and scheduling before booking.`,
        emergency: 'Online Generator Inquiries',
        hasServicesNav: false,
        hasBlog: false,
      };
    case 'solar':
      return {
        serviceName: 'Solar Service',
        heroH1: (loc) => `Solar Panel Installation in ${loc}, Ontario`,
        bodyEyebrow: 'Local Solar Service',
        bodyLead: (loc, county, _city, _brand) =>
          `For a solar inquiry in ${loc}, describe the proposed rooftop or ground-mounted system, electricity use and property access. Ask the responding provider to review site suitability, utility requirements, equipment, permits, total cost and scheduling before you agree to an installation.`,
        faqHeading: (loc) => `${loc} Solar Questions`,
        titleSlug: (loc) => `${loc} Solar Installation`,
        quoteHeading: 'Request a Solar Quote',
        ctaText: (loc) => `Include the roof or ground-mount proposal and electricity-use details with your ${loc} inquiry. Confirm the design, utility process, scope, coverage and installation schedule with the provider.`,
        businessType: 'SolarEnergyContractor',
        tagline: (city, county) => `Solar project guidance and online inquiries for ${city}, Ontario and ${county}. Confirm site suitability, provider qualifications, scope and scheduling before booking.`,
        emergency: 'Online Solar Inquiries',
        hasServicesNav: false,
        hasBlog: false,
      };
    case 'geothermal':
      return {
        serviceName: 'Geothermal Service',
        heroH1: (loc) => `Geothermal Installation in ${loc}, Ontario`,
        bodyEyebrow: 'Local Geothermal Service',
        bodyLead: (loc, county, _city, _brand) =>
          `For a ground-source heat pump inquiry in ${loc}, describe the existing heating system and proposed loop location. A site assessment, heating design, drilling or excavation scope and equipment match need review. Ask the responding provider to confirm qualifications, permits, restoration costs and scheduling.`,
        faqHeading: (loc) => `${loc} Geothermal Questions`,
        titleSlug: (loc) => `${loc} Geothermal Installation`,
        quoteHeading: 'Request a Geothermal Quote',
        ctaText: (loc) => `Share the heating-system details and proposed ground loop for your ${loc} property. Confirm site assessment, design, scope, coverage and scheduling with the responding provider.`,
        businessType: 'HVACBusiness',
        tagline: (city, county) => `Ground-source heat pump guidance and online inquiries for ${city}, Ontario and ${county}. Confirm design, provider qualifications, scope and scheduling before booking.`,
        emergency: 'Online Geothermal Inquiries',
        hasServicesNav: false,
        hasBlog: false,
      };
    default: // plumbing
      return {
        serviceName: 'Plumbing Service',
        heroH1: (loc) => `Plumbing Requests in ${loc}, Ontario`,
        bodyEyebrow: 'Plan a Plumbing Request',
        bodyLead: (loc, county, _city, brand) =>
          `Use this site to describe plumbing work at a ${loc} property. Note the affected fixtures, pipe or equipment, the symptoms and access conditions. The responding provider must confirm qualifications, coverage, the proposed scope, pricing and scheduling before any work is agreed.`,
        faqHeading: (loc) => `${loc} Plumbing Questions`,
        titleSlug: (loc) => `${loc} Plumber`,
        quoteHeading: 'Request a Plumbing Quote',
        ctaText: (loc) => `Describe the plumbing issue or planned upgrade at your ${loc} property. Include equipment, symptoms and access details so the responding provider can confirm the scope and availability.`,
        businessType: 'Plumber',
        tagline: (city, county) => `Plumbing project guides and online inquiries for ${city === county ? `${county}, Ontario` : `${city}, Ontario and ${county}`}. Confirm provider qualifications, coverage, scope and scheduling before booking.`,
        emergency: 'Online Plumbing Inquiries',
        hasServicesNav: true,
        hasBlog: true,
      };
  }
}

// build_pages.py::review_card
export function reviewCard(text: string, name: string, place: string): string {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const stars5 = `<div class="stars" role="img" aria-label="5 out of 5 stars">${'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01z"/></svg>'.repeat(5)}</div>`;
  return `<article class="review reveal">
  ${stars5}
  <p>&ldquo;${text}&rdquo;</p>
  <div class="review__by"><span class="av">${initials}</span><div><b>${name}</b><span>${place}, ON</span></div></div>
</article>`;
}

// build_pages.py::feature_item
export function featureItem(ic: string, h: string, p: string): string {
  return `<li><span class="fi">${icon(ic, '', 22)}</span><div><h4>${h}</h4><p>${p}</p></div></li>`;
}

// build_pages.py::svc_photo_tag
export function svcPhotoTag(
  slug: string,
  photo: { src: string; alt: string; w: number; h: number }
): string {
  return `<img class="svc-photo" src="${photo.src}" alt="${photo.alt}" width="${photo.w}" height="${photo.h}" loading="lazy" decoding="async">`;
}

// build.py::crumbs
export function crumbs(items: [name: string, url: string][]): string {
  const parts: string[] = [];
  items.forEach(([n, u], i) => {
    if (i) parts.push(icon('chev-right', '', 14));
    parts.push(u ? `<a href="${u}">${n}</a>` : `<span>${n}</span>`);
  });
  return `<nav class="crumbs" aria-label="Breadcrumb">${parts.join('')}</nav>`;
}

// Shared CTA prompts collect project details for provider confirmation.
const CTA_TITLES = [
  "Describe the Plumbing Work",
  "Request a Plumbing Quote",
  "Prepare for a Plumbing Visit",
  "Plan a Repair or Replacement",
  "Confirm the Scope Before Booking"
];
const CTA_TEXTS = [
  "Include the fixture or equipment, symptoms and property access in your request. The responding provider must confirm scope, pricing, coverage and scheduling before work is agreed.",
  "For a replacement, share the existing model and connections, plus any proposed equipment. Ask the provider which work is included and what needs inspection before quoting.",
  "Describe which fixtures are affected and when the problem occurs. Photos and previous repair details can help the responding provider clarify the assessment needed.",
  "If the job is part of a renovation, include the finish schedule and fixture specifications. Confirm access, exclusions, qualifications and timing directly with the provider.",
  "Use the form to explain the requested work and property location. Review the estimate, scope and any warranty terms with the responding provider before booking."
];
export function ctaBand(
  s: SiteConfig,
  title?: string,
  text?: string
): string {
  const t = title ?? pick(s.domain, 'cta-band/title', CTA_TITLES);
  const x = text ?? pick(s.domain, 'cta-band/text', CTA_TEXTS);
  return `<section class="section">
  <div class="container">
    <div class="cta-band reveal">
      <div class="cta-band__inner">
        <div>
          <h2>${t}</h2>
          <p>${x}</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap">
          <a class="btn btn-primary btn-lg" href="/contact/#quote">Request a Quote</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

// build.py::areas_section
// Now accepts optional location slugs so chips link to location pages when they exist.
// A listed location is a guide or inquiry route; provider coverage must be confirmed.
const AREA_H2S = [
  "Locations Listed Around {city}",
  "Planning Work in {county}",
  "Confirm Your Property Location",
  "Location Guides Near {city}",
  "Address Details for a {city} Request"
];
const AREA_PS = [
  "Use the listed places to find a guide or start an inquiry. Include your property address or postal code so the provider can confirm coverage and scheduling.",
  "For a property in {scope}, describe the work and access details in the form. The listed locations do not confirm a provider's travel range or availability.",
  "A location guide explains project questions. Before booking {svc}, ask the responding provider to confirm service at your exact address and the proposed visit window.",
  "If your location is not listed, include its postal code with the requested work. Coverage, travel arrangements and scheduling must be confirmed directly with the provider.",
  "Select a listed location for guidance or use the inquiry form. Provide the property location, equipment and access details so the provider can review the request."
];
export function areasSection(s: SiteConfig, locationSlugs?: Record<string, string>): string {
  if (s.enquirySite) return `<section class="section bg-soft" id="coverage"><div class="container"><h2>Requests for ${s.city} Properties</h2><p>This site collects inquiries for ${s.city}. Include the property postal code and access details. Provider travel, coverage and appointment availability require direct confirmation.</p><ul class="areas"><li><a href="/contact/">${icon('pin', '', 15)} ${s.city}</a></li></ul></div></section>`;
  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const chips = s.serviceAreas
    .map((a) => {
      const slug = slugify(a);
      const locationKey = locationSlugs && Object.keys(locationSlugs).find(k => k === slug || locationSlugs[k] === a);
      const href = locationKey ? `/locations/${locationKey}/` : '/contact/';
      return `<li><a href="${href}">${icon('pin', '', 15)} ${a}</a></li>`;
    })
    .join('');
  const scope = s.city === s.county ? s.county : `${s.city} and ${s.county}`;
  const fill = (t: string) => t
    .replaceAll('{city}', s.city)
    .replaceAll('{county}', s.county)
    .replaceAll('{scope}', scope)
    .replaceAll('{svc}', verticalCopy(s).serviceName.toLowerCase());
  const h2 = fill(pick(s.domain, 'areas/h2', AREA_H2S));
  const p = fill(pick(s.domain, 'areas/p', AREA_PS));
  return `<section class="section bg-soft">
  <div class="container">
    <div class="section-head reveal">
      <span class="eyebrow">Service Area</span>
      <h2>${h2}</h2>
      <p>${p}</p>
    </div>
    <ul class="areas reveal">${chips}</ul>
  </div>
</section>`;
}

// build_pages.py::build_blog_cards
import type { BlogPost } from '../data/content';
export function blogCards(posts: BlogPost[], limit = 3): string {
  return posts
    .slice(0, limit)
    .map(
      (p) => `<article class="post-card reveal">
  <img class="post-card__img" src="${p.photo}" alt="${p.photo_alt}" width="400" height="180" loading="lazy" decoding="async">
  <div class="post-card__body">
    <span class="tag">Home Comfort Tips</span>
    <h3>${p.title}</h3>
    <p>${p.excerpt}</p>
    <a class="post-card__link" href="/blog/${p.slug}/">Read article ${icon('arrow-right', '', 17)}</a>
  </div>
</article>`
    )
    .join('');
}
