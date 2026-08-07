// Generate per-site OG images: each site's logo centered on its navy palette
// background (1200x630 PNG).
//
// Why this exists: hvac-astro ships a single shared default og-default.png in
// public/assets/img/ that every site inherits via init-deploy-repo.sh. That
// default once got polluted with Dunnville branding, so ~93 sites shipped the
// wrong OG card. This script regenerates a correctly-branded og-default.png
// per site so the shared default is no longer load-bearing.
//
// Writes to dist/<domain>/assets/img/og-default.png so deploy-all.sh
// (which `cp -R dist/<site>/assets/img/. -> deploy_repo/`)
// carries the right card on every deploy.
//
// Usage:
//   node scripts/gen-og-images.mjs                 # all sites with src/sites/*.ts
//   node scripts/gen-og-images.mjs londonheatingcooling.ca   # one site
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT = new URL('../', import.meta.url).pathname;
const SITES_DIR = `${ROOT}src/sites`;
const LOGO_DIR = `${ROOT}public/assets/img/logos`;
const DIST = `${ROOT}dist`;

const targets = process.argv.slice(2);

function hex2rgb(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

async function buildOG(cfg, outPath) {
  const W = 1200, H = 630;
  const c = hex2rgb(cfg.navy);
  const darker = { r: Math.max(0, c.r - 14), g: Math.max(0, c.g - 14), b: Math.max(0, c.b - 14) };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="rgb(${c.r},${c.g},${c.b})"/>
      <stop offset="1" stop-color="rgb(${darker.r},${darker.g},${darker.b})"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
</svg>`;
  const base = `${outPath}.base.png`;
  await sharp(Buffer.from(svg)).png().toFile(base);

  const logoPre = `${outPath}.logo.png`;
  await sharp(`${LOGO_DIR}/${cfg.logo}`)
    .resize(380, 380, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(logoPre);

  const logoMeta = await sharp(logoPre).metadata();
  const left = Math.round((W - logoMeta.width) / 2);
  const top = Math.round((H - logoMeta.height) / 2);
  await sharp(base).composite([{ input: logoPre, left, top }]).png().toFile(outPath);

  // Clean up scratch files.
  for (const f of [base, logoPre]) { try { await import('node:fs').then(fs => fs.unlinkSync(f)); } catch {} }
}

// Discover site configs by importing each src/sites/<domain>.ts.
// We batch-import to avoid spawning node per site.
const domains = targets.length
  ? targets
  : execSync(`ls ${SITES_DIR}/*.ts`, { encoding: 'utf8' })
      .trim().split('\n')
      .map(p => p.split('/').pop().replace(/\.ts$/, ''))
      // skip directory-style (vertical) configs that are not standalone sites
      .filter(d => !d.includes('/'));

// Build a single ESM script that imports every site and dumps logo + navy.
const imports = domains.map((d, i) => `import { site as s${i} } from "${SITES_DIR}/${d}.ts";`).join('\n');
const rows = domains.map((d, i) =>
  `{ domain: s${i}.domain, logo: (s${i}.media && s${i}.media.logo) || "01-flame-snowflake-badge.png", navy: (s${i}.palette && s${i}.palette.navy) || "#0f2544" }`
).join(',\n');
const extractor = `${imports}\nconsole.log(JSON.stringify([\n${rows}\n]));`;
const tmpExtract = `${ROOT}scripts/.gen-og-extract.mjs`;
writeFileSync(tmpExtract, extractor);

const configs = JSON.parse(execSync(`node --experimental-strip-types "${tmpExtract}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim());

let ok = 0, fail = 0;
for (const cfg of configs) {
  const logoPath = `${LOGO_DIR}/${cfg.logo}`;
  if (!existsSync(logoPath)) { console.error(`[${cfg.domain}] MISSING logo ${cfg.logo}`); fail++; continue; }
  const outDir = `${DIST}/${cfg.domain}/assets/img`;
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = `${outDir}/og-default.png`;
  try {
    await buildOG(cfg, outPath);
    ok++;
  } catch (e) {
    console.error(`[${cfg.domain}] FAIL: ${e.message}`); fail++;
  }
}
try { await import('node:fs').then(fs => fs.unlinkSync(tmpExtract)); } catch {}
console.log(`OG images: ${ok} generated, ${fail} failed.`);
