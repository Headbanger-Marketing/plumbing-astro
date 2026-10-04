// Temporary publication policy for numbers shared by portfolio sites.
// Values stay in source configs for routing; hidden numbers never belong in rendered HTML or JSON-LD.
import type { SiteConfig } from './types';

const HIDDEN_NUMBERS = new Set<string>([
  "+12267781469",
  "+12892042884",
  "+13656617242",
  "+15192274479",
  "+15192374328",
  "+15192680122",
  "+15192840161",
  "+15192913562",
  "+15193484027",
  "+15193570136",
  "+15194557330",
  "+15194820143",
  "+15194852371",
  "+15195240177",
  "+15195271483",
  "+15195650204",
  "+15195830742",
  "+15195873164",
  "+15196231847",
  "+15196274183",
  "+15196328174",
  "+15196570133",
  "+15196660188",
  "+15196694738",
  "+15197563142",
  "+15197653092",
  "+15197860148",
  "+15198820159",
  "+15482907597",
  "+15482908004",
  "+15482909633",
  "+15484095669",
  "+15484570509",
  "+15484571029",
  "+15484571225",
  "+15484572400",
  "+15484900267",
  "+15484906741",
  "+15485543147",
  "+15485543151",
  "+15485544288",
  "+15487086805",
  "+15487087117",
  "+15487087251",
  "+15487087480",
  "+15487088109",
  "+15487088216",
  "+15487612072",
  "+15487612123",
  "+15487980609",
  "+15489010020",
  "+15489010930",
  "+15489013425",
  "+15489013519",
  "+15489185036",
  "+19054723610",
  "+19054768231",
  "+19055224817",
  "+19056193742",
  "+19056374218",
  "+19056687214",
  "+19057213485",
  "+19057273184",
  "+19057653418",
  "+19058314059",
  "+19058453072",
  "+19058775208",
  "+19058782164",
  "+19058847163",
  "+19058954172"
]);

export function phoneVisibility(site: SiteConfig): SiteConfig {
  const normalized = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return '+' + (digits.length === 10 ? '1' + digits : digits);
  };
  const hidePhone = site.hidePhone === true || HIDDEN_NUMBERS.has(normalized(site.phone.tel))
    || (!!site.citationPhone && HIDDEN_NUMBERS.has(normalized(site.citationPhone.tel)));
  return { ...site, hidePhone };
}

export function showSitePhone(site: SiteConfig): boolean {
  return !site.hidePhone && !!site.phone.tel;
}
