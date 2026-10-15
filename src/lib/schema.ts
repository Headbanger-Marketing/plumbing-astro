// JSON-LD schema helpers. Ported verbatim from build.py::schema_* functions.
// Each returns a complete <script type="application/ld+json"> block matching the live output.
//
// NOTE: aggregateRating is intentionally omitted (this is a new business with no verified
// reviews). Adding a fake rating violates Google's review-snippet policy. Add it back only
// when real, on-page review data exists.

import type { SiteConfig } from '../lib/types';
import { verticalCopy } from './utils';
import { siteLogoSrc, siteOgImage } from './logo-asset';


// Decode HTML entities used in display strings before placing inside JSON-LD.
function plain(s: string): string {
  return (s || '')
    .replaceAll('&amp;', '&')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&ldquo;', '"')
    .replaceAll('&rdquo;', '"');
}

// Double-quote a string for JSON, escaping inner quotes by swapping them for single quotes
// (matches the Python original's .replace('"', "'") behaviour, not strict JSON escaping).
function q(s: string): string {
  return '"' + s.replaceAll('"', "'") + '"';
}

export function schemaLocalbusiness(s: SiteConfig): string {
  if (s.enquirySite) return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "WebSite", "@id": s.url + "/#website",
    name: s.brand, url: s.url, inLanguage: "en-CA",
  })}</script>`;
  const areaServed = s.serviceAreas.map((a) => q(`${a}, ON`)).join(',');
  const bizType = verticalCopy(s).businessType;
  const citationPhone = s.citationPhone ?? s.phone;
  const telephone = s.hidePhone ? '' : `"telephone":${q(citationPhone.display)},`;
  // Per-site logo for structured data — the same mark the header/favicon
  // serve. A .svg primary (Recraft-wave sites) swaps to its rasterised .png
  // twin (replace on a .png name is a no-op), which rich-results parsers
  // handle more reliably; sites without media.logo keep the shared favicon.
  const logoUrl = s.media?.logo
    ? `${s.url}${siteLogoSrc(s).replace(/\.svg$/, '.png')}`
    : `${s.url}/assets/img/favicon.svg`;
  // A service area is not proof of business-premises coordinates.
  const geoLine = '';
  // Emit address fields only when non-empty: a site without a signed-off
  // street/postal (Dunnville) ships locality/region only — an empty
  // "streetAddress":""/"postalCode":"" string is invalid structured data.
  const addr = [
    s.address.street && `"streetAddress":${q(s.address.street)}`,
    `"addressLocality":${q(s.address.locality)}`,
    `"addressRegion":${q(s.address.region)}`,
    s.address.postal && `"postalCode":${q(s.address.postal)}`,
    `"addressCountry":"CA"`,
  ].filter(Boolean).join(',');
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@type":${q(bizType)},"@id":${q(s.url + '/#business')},
"name":${q(plain(s.brand))},"url":${q(s.url)},${telephone}"email":${q(s.email)},"image":${q(siteOgImage(s))},"logo":${q(logoUrl)},
"priceRange":"$$","areaServed":[${areaServed}],
"address":{"@type":"PostalAddress",${addr}}${geoLine}}
</script>`;
}

export function schemaBreadcrumb(items: [name: string, url: string][], s: SiteConfig): string {
  const el = items
    .map(
      ([n, u], i) =>
        `{"@type":"ListItem","position":${i + 1},"name":${q(plain(n))},"item":${q(s.url + u)}}`
    )
    .join(',');
  return `<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[${el}]}</script>`;
}

export function schemaService(
  name: string,
  desc: string,
  url: string,
  s: SiteConfig
): string {
  if (s.enquirySite) return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "WebPage", name: plain(name), description: plain(desc),
    url: s.url + url, about: { "@type": "Thing", name: plain(name) },
    isPartOf: { "@id": s.url + "/#website" },
  })}</script>`;
  const n = plain(name);
  const d = plain(desc);
  const citationPhone = s.citationPhone ?? s.phone;
  const telephone = s.hidePhone ? '' : `"telephone":${q(citationPhone.display)},`;
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Service","serviceType":${q(n)},"name":${q(n)},
"description":${q(d)},"url":${q(s.url + url)},"areaServed":{"@type":"City","name":${q(s.city)}},
"provider":{"@type":${q(verticalCopy(s).businessType)},"name":${q(plain(s.brand))},${telephone}"url":${q(s.url)}}}
</script>`;
}

export function schemaFaq(faqs: [q: string, a: string][]): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: plain(question),
      acceptedAnswer: { '@type': 'Answer', text: plain(answer) },
    })),
  };
  // Keep punctuation intact and prevent a copy string from closing its script.
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`;
}

export function schemaBlogpost(
  title: string,
  desc: string,
  url: string,
  date: string,
  s: SiteConfig
): string {
  const t = plain(title);
  const d = plain(desc);
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BlogPosting","headline":${q(t)},"description":${q(d)},
"image":${q(siteOgImage(s))},"datePublished":${q(date)},"dateModified":${q(date)},"url":${q(s.url + url)},
"mainEntityOfPage":{"@type":"WebPage","@id":${q(s.url + url)}},
"author":{"@type":"Organization","name":${q(plain(s.brand))}},
"publisher":{"@type":"Organization","name":${q(plain(s.brand))},"url":${q(s.url)},"logo":{"@type":"ImageObject","url":${q(s.media?.logo ? `${s.url}${siteLogoSrc(s).replace(/\.svg$/, '.png')}` : `${s.url}/assets/img/favicon.svg`)}}}}
</script>`;
}
