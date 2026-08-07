// Shared helpers ported from build.py / build_pages.py.
import type { SiteConfig } from '../lib/types';
import { icon } from './icons';

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
// HVAC returns the original hardcoded strings so existing pages render
// byte-identically; the other verticals swap in trade-correct wording so
// generator/solar/geothermal location pages stop saying "HVAC / furnace / AC".
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
          `As part of our ${county} service area, we provide dependable standby generator installation, repair, and replacement to ${loc}. Whether you need a new Generac standby unit installed, a transfer switch upgraded, or annual maintenance on an existing generator, our technicians reach ${loc} quickly and get the job done right.`,
        faqHeading: (loc) => `${loc} Generator Questions`,
        titleSlug: (loc) => `${loc} Generator Service`,
        quoteHeading: 'Request a Generator Quote',
        ctaText: (loc) => `Whether you need a Generac standby generator installed today or are planning a replacement ahead of storm season, our team is ready to serve your ${loc} home or farm with honest, dependable generator service.`,
        // HomeAndConstructionBusiness is the schema.org trades parent that HVACBusiness
        // specializes; a standby-generator installer does fuel lines, transfer switches,
        // permits, and pad pours, which is construction work, not electrical service calls.
        // (schema.org has no generator-specific type.)
        businessType: 'HomeAndConstructionBusiness',
        tagline: (city, county) => `Honest, dependable standby generator installation, repair, and replacement for ${city}, Ontario and the surrounding ${county} communities. Licensed, insured, and available 24/7.`,
        emergency: '24/7 Emergency Generator Service',
        hasServicesNav: false,
        hasBlog: false,
      };
    case 'solar':
      return {
        serviceName: 'Solar Service',
        heroH1: (loc) => `Solar Panel Installation in ${loc}, Ontario`,
        bodyEyebrow: 'Local Solar Service',
        bodyLead: (loc, county, _city, _brand) =>
          `As part of our ${county} service area, we design and install rooftop and ground-mount solar systems for ${loc} homes and farms. From a free usage assessment and net-metering setup to panel installation and monitoring, our crew handles every step and keeps your system producing for years.`,
        faqHeading: (loc) => `${loc} Solar Questions`,
        titleSlug: (loc) => `${loc} Solar Installation`,
        quoteHeading: 'Request a Solar Quote',
        ctaText: (loc) => `Whether you want to offset your hydro bill with solar today or are planning a ground-mount array for your ${loc} property, our team is ready to design, install, and monitor your system with honest, dependable service.`,
        businessType: 'SolarEnergyContractor',
        tagline: (city, county) => `Honest, dependable rooftop and ground-mount solar installation for ${city}, Ontario and the surrounding ${county} communities. Licensed, insured, and available 24/7.`,
        emergency: '24/7 Emergency Solar Service',
        hasServicesNav: false,
        hasBlog: false,
      };
    case 'geothermal':
      return {
        serviceName: 'Geothermal Service',
        heroH1: (loc) => `Geothermal Installation in ${loc}, Ontario`,
        bodyEyebrow: 'Local Geothermal Service',
        bodyLead: (loc, county, _city, _brand) =>
          `As part of our ${county} service area, we design and install ground-source geothermal heat pump systems for ${loc} homes. From loop-field sizing and drilling to heat-pump installation and commissioning, our team delivers efficient, low-cost heating and cooling that lasts for decades.`,
        faqHeading: (loc) => `${loc} Geothermal Questions`,
        titleSlug: (loc) => `${loc} Geothermal Installation`,
        quoteHeading: 'Request a Geothermal Quote',
        ctaText: (loc) => `Whether you are ready to install a ground-source heat pump or want a free assessment for your ${loc} property, our team is ready to deliver efficient, dependable geothermal heating and cooling.`,
        businessType: 'HVACBusiness',
        tagline: (city, county) => `Honest, dependable ground-source geothermal installation for ${city}, Ontario and the surrounding ${county} communities. Licensed, insured, and available 24/7.`,
        emergency: '24/7 Emergency Geothermal Service',
        hasServicesNav: false,
        hasBlog: false,
      };
    default: // plumbing
      return {
        serviceName: 'Plumbing Service',
        heroH1: (loc) => `Licensed Plumber in ${loc}, Ontario`,
        bodyEyebrow: 'Local Plumbing Service',
        bodyLead: (loc, county, _city, brand) =>
          `As part of our ${county} service area, ${brand} brings the same dependable plumbing work to ${loc} that our ${_city} customers rely on. Whether you need a water heater replaced, a drain cleared, a leak repaired, or a full repipe, our licensed plumbers reach ${loc} quickly and get the job done right.`,
        faqHeading: (loc) => `${loc} Plumbing Questions`,
        titleSlug: (loc) => `${loc} Plumber`,
        quoteHeading: 'Request a Plumbing Quote',
        ctaText: (loc) => `Whether it is a repair today or a planned upgrade, our licensed plumbers are ready to serve your ${loc} home or business with honest, dependable work.`,
        businessType: 'Plumber',
        tagline: (city, county) => `Honest, dependable licensed plumbing for ${city === county ? `${county}, Ontario` : `${city}, Ontario and the surrounding ${county} communities`}. Licensed, insured, and available 24/7.`,
        emergency: '24/7 Emergency Plumbing Service',
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

// build.py::cta_band
export function ctaBand(
  s: SiteConfig,
  title = 'Ready to Restore Your Home Comfort?',
  text = "Whatever your heating or cooling need, our licensed technicians are ready to help, fast. Get your free, no-obligation quote today."
): string {
  return `<section class="section">
  <div class="container">
    <div class="cta-band reveal">
      <div class="cta-band__inner">
        <div>
          <h2>${title}</h2>
          <p>${text}</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap">
          <a class="btn btn-primary btn-lg" href="/contact/#quote">Get a Free Quote</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

// build.py::areas_section
// Now accepts optional location slugs so chips link to location pages when they exist.
export function areasSection(s: SiteConfig, locationSlugs?: Record<string, string>): string {
  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const chips = s.serviceAreas
    .map((a) => {
      const slug = slugify(a);
      const hasLocPage = locationSlugs && (locationSlugs[slug] || Object.keys(locationSlugs).some(k => k === slug || locationSlugs[k] === a));
      const href = hasLocPage ? `/locations/${slug}/` : '/contact/';
      return `<li><a href="${href}">${icon('pin', '', 15)} ${a}</a></li>`;
    })
    .join('');
  return `<section class="section bg-soft">
  <div class="container">
    <div class="section-head reveal">
      <span class="eyebrow">Service Area</span>
      <h2>Serving ${s.city} &amp; Surrounding Communities</h2>
      <p>We provide fast, reliable ${verticalCopy(s).serviceName.toLowerCase()} throughout ${s.city === s.county ? s.county : `${s.city} and ${s.county}`}. If you don't see your town listed, give us a call, chances are we cover it.</p>
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
