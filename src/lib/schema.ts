// JSON-LD schema helpers. Ported verbatim from build.py::schema_* functions.
// Each returns a complete <script type="application/ld+json"> block matching the live output.
//
// NOTE: aggregateRating is intentionally omitted (this is a new business with no verified
// reviews). Adding a fake rating violates Google's review-snippet policy. Add it back only
// when real, on-page review data exists.

import type { SiteConfig } from '../lib/types';
import { verticalCopy } from './utils';
import { CITY_GEO } from '../data/geo';

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
  const areaServed = s.serviceAreas.map((a) => q(`${a}, ON`)).join(',');
  const bizType = verticalCopy(s).businessType;
  const citationPhone = s.citationPhone ?? s.phone;
  // City-center GeoCoordinates (verified map in src/data/geo.ts). Emit-on-match —
  // strictly additive; a city not in the map gets none, so this never degrades a site.
  const geo = CITY_GEO[s.city];
  const geoLine = geo ? `,"geo":{"@type":"GeoCoordinates","latitude":${geo.lat},"longitude":${geo.lng}}` : '';
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@type":${q(bizType)},"@id":${q(s.url + '/#business')},
"name":${q(plain(s.brand))},"url":${q(s.url)},"telephone":${q(citationPhone.display)},"email":${q(s.email)},"image":${q(s.url + '/assets/img/og-default.png')},"logo":${q(s.url + '/assets/img/favicon.svg')},
"priceRange":"$$","areaServed":[${areaServed}],
"address":{"@type":"PostalAddress","streetAddress":${q(s.address.street)},"addressLocality":${q(s.address.locality)},"addressRegion":${q(s.address.region)},"postalCode":${q(s.address.postal)},"addressCountry":"CA"}${geoLine},
"openingHoursSpecification":{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"00:00","closes":"23:59"}}
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
  const n = plain(name);
  const d = plain(desc);
  const citationPhone = s.citationPhone ?? s.phone;
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Service","serviceType":${q(n)},"name":${q(n)},
"description":${q(d)},"url":${q(s.url + url)},"areaServed":{"@type":"City","name":${q(s.city)}},
"provider":{"@type":${q(verticalCopy(s).businessType)},"name":${q(plain(s.brand))},"telephone":${q(citationPhone.display)},"url":${q(s.url)}}}
</script>`;
}

export function schemaFaq(faqs: [q: string, a: string][]): string {
  const items = faqs
    .map(
      ([qst, a]) =>
        `{"@type":"Question","name":${q(qst)},"acceptedAnswer":{"@type":"Answer","text":${q(a)}}}`
    )
    .join(',');
  return `<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${items}]}</script>`;
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
"image":${q(s.url + '/assets/img/og-default.png')},"datePublished":${q(date)},"dateModified":${q(date)},"url":${q(s.url + url)},
"mainEntityOfPage":{"@type":"WebPage","@id":${q(s.url + url)}},
"author":{"@type":"Organization","name":${q(plain(s.brand))}},
"publisher":{"@type":"Organization","name":${q(plain(s.brand))},"url":${q(s.url)},"logo":{"@type":"ImageObject","url":${q(s.url + '/assets/img/favicon.svg')}}}}
</script>`;
}
