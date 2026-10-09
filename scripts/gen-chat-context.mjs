// Build the site-context bundle (sites.json) consumed by the hvac-chat-context
// Cloudflare Worker, which the n8n "HVAC Chat" workflow calls to resolve
// origin (hostname) -> trusted per-site context.
//
// NAP SAFETY (load-bearing): emits the TRACKING phone + city ONLY. Never emits
// citationPhone, phoneEmergency, or address.street. This keeps the estate's
// visibility rule intact at the chatbot layer. The same phoneVisibility policy
// as the site suppresses hidden/shared numbers and prevents the bot from
// parroting stale numbers that leak inside the per-site *-overrides.json prose.
//
// Portfolios:
//   network  -> hvac-astro/src/sites/<domain>.ts          (schema A: brand/phone/...)
//   brand    -> <workspace>/brands/{brand}-site/src/data/site.ts           (schema B: name/knowsAbout)
//   rebate   -> static block below (Phase 1c: confirm NAP)  (schema C)
//
// Mirrors the batch-import trick from gen-og-images.mjs: Node can't import .ts
// directly, so we emit a temp ESM extractor and run it with --experimental-strip-types.
//
// Usage:
//   node scripts/gen-chat-context.mjs        # all portfolios -> scripts/n8n/sites.json
//   HVAC_WORKSPACE=/path/to/hvac node scripts/gen-chat-context.mjs  # copied checkout
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync, renameSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, resolve } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const HVAC = resolve(process.env.HVAC_WORKSPACE || fileURLToPath(new URL('../../../', import.meta.url)));
const BRANDS_DIR = join(HVAC, 'brands');
const SITES_DIR = join(ROOT, 'src/sites');
const OUT_DIR = join(ROOT, 'scripts/n8n');
const OUT_FILE = join(OUT_DIR, 'sites.json');

// ---- service framing by vertical (network sites have no explicit service list;
//      derive a conservative catalog from the configured vertical, never invent) ----
const SERVICES_BY_VERTICAL = {
  hvac: [
    'Furnace repair & installation', 'Air conditioner repair & installation',
    'Heat pump installation', 'Maintenance & tune-ups', 'Indoor air quality',
    'Ductless mini-splits', 'Water heaters', 'Smart thermostats', 'Emergency HVAC service',
  ],
  generator: ['Standby generator sales & installation', 'Generac service & maintenance', 'Transfer switches', 'Load management', 'Emergency power'],
  geothermal: ['Geothermal heat pump installation', 'Geothermal service & repair', 'Loop field systems', 'Emergency service'],
  solar: ['Solar PV installation', 'Solar service', 'Battery storage', 'Emergency service'],
};

// The eight managed contexts must remain available after folder moves. Premier
// has no site.ts and is deliberately excluded. Additional brand configs are
// discovered automatically, but a missing managed source stops publication.
const REQUIRED_BRANDS = [
  'allservicelondon-site', 'bilcke-site', 'bobcase-site', 'ferngully-site',
  'hayter-site', 'hoffmeyer-site', 'poulsen-site', 'rays-site',
];
for (const name of REQUIRED_BRANDS) {
  if (!existsSync(join(BRANDS_DIR, name, 'src/data/site.ts'))) {
    throw new Error(`Missing brand context: ${name}. Set HVAC_WORKSPACE to the portfolio containing brands/.`);
  }
}
const BRAND_REPOS = readdirSync(BRANDS_DIR).sort()
  .filter(name => name.endsWith('-site') && existsSync(join(BRANDS_DIR, name, 'src/data/site.ts')));

// Rebate funnels (Phase 1c). NAP to confirm before enabling chat on these;
// left without a phone until verified so the bot routes to the form instead of
// stating an unverified number.
const REBATES = [
  { domain: 'heatpumprebateontario.ca', brand: 'Heat Pump Rebate Ontario', portfolio: 'rebate', city: 'Ontario', regionAbbr: 'ON', county: '', trackingPhone: null, email: '', serviceAreas: ['Ontario'], services: ['Heat pump rebate qualification', 'Heat pump installation estimates', 'Government rebate guidance'], vertical: 'rebate', sourceUrl: 'https://heatpumprebateontario.ca', leadShape: 'A' },
  { domain: 'ontariofurnacerebates.ca', brand: 'Ontario Furnace Rebates', portfolio: 'rebate', city: 'Ontario', regionAbbr: 'ON', county: '', trackingPhone: null, email: '', serviceAreas: ['Ontario'], services: ['Furnace rebate qualification', 'Furnace replacement estimates', 'Government rebate guidance'], vertical: 'rebate', sourceUrl: 'https://ontariofurnacerebates.ca', leadShape: 'A' },
];

// ---- run a temp extractor over a set of static imports; returns raw row objects ----
function extract(label, importLines, rowLines) {
  const extractor = `import { phoneVisibility } from "../src/lib/phone-visibility.ts";\n${importLines.join('\n')}\nconsole.log(JSON.stringify([${rowLines.join(',\n')}]));`;
  const tmp = `${ROOT}scripts/.gen-chat-${label}-extract.mjs`;
  writeFileSync(tmp, extractor);
  try {
    return JSON.parse(execFileSync(process.execPath, ['--experimental-strip-types', tmp], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim());
  } finally {
    try { unlinkSync(tmp); } catch {}
  }
}

// ---- brand extractor: incomplete context is a publication error ----
function extractDynamic(label, files) {
  const filesArg = JSON.stringify(files);
  const extractor = `
import { phoneVisibility } from "../src/lib/phone-visibility.ts";
const FILES = JSON.parse(process.argv[2]);
const project = (s) => s && s.domain ? {
  domain: s.domain, brand: s.name || s.brand || s.domain,
  city: (s.address && s.address.locality) || s.city || "",
  regionAbbr: (s.address && s.address.region) || s.regionAbbr || "ON",
  hidePhone: phoneVisibility(s).hidePhone,
  phoneDisplay: (s.phone && s.phone.display) || "", phoneTel: (s.phone && s.phone.tel) || "",
  email: s.email || "", serviceAreas: s.serviceAreas || [], knowsAbout: s.knowsAbout || [],
  url: s.url || ""
} : null;
const out = [];
for (const f of FILES) {
  try { const m = await import(f); const row = project(m.site); if (row) out.push(row); else throw new Error("[${label}] no site export: " + f); }
  catch (e) { throw new Error("[${label}] FAIL " + f + ": " + e.message); }
}
console.log(JSON.stringify(out));
`;
  const tmp = `${ROOT}scripts/.gen-chat-${label}-extract.mjs`;
  writeFileSync(tmp, extractor);
  try {
    return JSON.parse(execFileSync(process.execPath, ['--experimental-strip-types', tmp, filesArg], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim());
  } finally {
    try { unlinkSync(tmp); } catch {}
  }
}

// ---- 1) network sites ----
const domains = readdirSync(SITES_DIR).filter(name => name.endsWith('.ts')).sort()
  .map(name => name.slice(0, -3));

const netImports = domains.map((d, i) => `import { site as raw${i} } from "../src/sites/${d}.ts"; const s${i} = phoneVisibility(raw${i});`);
const netRows = domains.map((_, i) =>
  `{ domain:s${i}.domain, brand:s${i}.brand, city:s${i}.city, regionAbbr:s${i}.regionAbbr, county:s${i}.county, hidePhone:s${i}.hidePhone, phoneDisplay:(s${i}.phone&&s${i}.phone.display)||"", phoneTel:(s${i}.phone&&s${i}.phone.tel)||"", email:s${i}.email, serviceAreas:s${i}.serviceAreas||[], vertical:s${i}.vertical||"hvac", url:s${i}.url }`
);
const networkRaw = extract('network', netImports, netRows);

// ---- 2) brand sites ----
// Absolute file URLs support moved workspaces and paths containing spaces.
const brandFiles = BRAND_REPOS.map(r => pathToFileURL(join(BRANDS_DIR, r, 'src/data/site.ts')).href);
const brandRaw = extractDynamic('brand', brandFiles);
if (brandRaw.length !== brandFiles.length) throw new Error('Incomplete brand context extraction');

// ---- normalize to SiteContext ----
function normalize(raw) {
  const vertical = raw.vertical || 'hvac';
  return {
    domain: raw.domain,
    brand: raw.brand,
    portfolio: raw.portfolio || (raw.knowsAbout ? 'brand' : 'network'),
    city: raw.city,
    regionAbbr: raw.regionAbbr,
    county: raw.county || '',
    trackingPhone: !raw.hidePhone && (raw.phoneDisplay || raw.phoneTel)
      ? { display: raw.phoneDisplay, tel: raw.phoneTel }
      : null,
    email: raw.email || '',
    serviceAreas: raw.serviceAreas || [],
    services: (raw.services && raw.services.length) ? raw.services
       : (raw.knowsAbout && raw.knowsAbout.length ? raw.knowsAbout
       : (SERVICES_BY_VERTICAL[vertical] || SERVICES_BY_VERTICAL.hvac)),
    vertical,
    sourceUrl: raw.url,
    leadShape: raw.leadShape || 'A',
  };
}

const sites = {};
let dupes = 0;
const addAll = (rows, portfolio) => rows.forEach(r => {
  if (!r || !r.domain) return;
  if (sites[r.domain]) { dupes++; return; }
  sites[r.domain] = normalize({ ...r, portfolio });
});

addAll(networkRaw, 'network');
addAll(brandRaw, 'brand');
addAll(REBATES, 'rebate');

const out = {
  generatedAt: new Date().toISOString(),
  count: Object.keys(sites).length,
  byPortfolio: {
    network: networkRaw.filter(Boolean).length,
    brand: brandRaw.filter(Boolean).length,
    rebate: REBATES.length,
  },
  sites,
};

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(`${OUT_FILE}.tmp`, JSON.stringify(out, null, 2) + '\n');
renameSync(`${OUT_FILE}.tmp`, OUT_FILE);

console.log(`chat context: ${out.count} sites -> ${OUT_FILE}`);
console.log(`  network=${out.byPortfolio.network} brand=${out.byPortfolio.brand} rebate=${out.byPortfolio.rebate}${dupes ? ` (skipped ${dupes} duplicate domain(s))` : ''}`);
