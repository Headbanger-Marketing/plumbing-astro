import type { SiteConfig } from './types';
import type { SiteContent } from '../data/content';

/** Reuse authored local service scope, never a pool of invented business stories. */
export function localPlanning(site: SiteConfig, content: SiteContent) {
  if (content.HOME) return {
    heading: content.HOME.heading, intro: content.HOME.planningIntro,
    checklist: content.HOME.checklist, faqs: content.HOME_FAQ || [], cta: content.HOME.cta,
  };
  const details = Object.values(content.SVC);
  const namedAreas = site.serviceAreas.filter(a => a !== site.city).slice(0, 4);
  const areaText = namedAreas.length ? namedAreas.join(', ') : site.county;
  const cards = content.HOME_SERVICES;
  const checklist: [string,string][] = [
    ['The work you need', cards.slice(0,3).map(s=>s[2]).join(' ')],
    ['The wider system', cards.slice(3,5).map(s=>s[2]).join(' ')],
    ['Related work to mention', cards.slice(5).map(s=>s[2]).join(' ')],
  ].filter(([,body]) => Boolean(body)) as [string,string][];
  const faqs: [string,string][] = [
    [`What details help with a ${site.city} quote?`, details[0]?.features.map(f=>f[2]).slice(0,2).join(' ') || cards[0]?.[2] || 'Describe the equipment and the symptom in your request.'],
    [`Which job guide should I read first?`, cards.slice(0,4).map(s=>s[2]).join(' ')],
    [`Can I request service near ${site.city}?`, `The listed service area includes ${areaText}. Include your postal code and access details in the form so the responding provider can confirm travel and scheduling for your property.`],
  ];
  return {
    heading: `Scope the Work Before Booking in ${site.city}`,
    intro: details.at(-1)?.intro || details[0]?.intro || '',
    checklist,
    faqs,
    cta: `Use the form to describe the property, the symptoms and the work requested. For ${areaText}, include your postal code so local coverage can be checked.`,
  };
}
