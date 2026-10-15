// Read-only release checks. Fresh browser contexts never submit enquiries.
import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL } from 'node:url';

export function regressions(before, after, policy = {}) {
  const errors = [];
  if (after.overflow) errors.push('Horizontal overflow');
  if (after.fontErrors?.length) errors.push('Webfont load failure: ' + after.fontErrors.join(', '));
  for (const key of ['header', 'main', 'footer']) {
    if (!after[key]) errors.push(`Missing ${key}`);
  }
  if (before?.quoteCtas && !after.quoteCtas) errors.push('Existing quote CTAs removed');
  for (const pair of after.headingPairs) {
    const old = before?.headingPairs.find(p => p.key === pair.key);
    if (!pair.sideBySide && pair.gap < 2 && (!old || old.gap >= 2)) {
      errors.push(`Missing heading/body gap: ${pair.key}`);
    }
  }
  if (!policy.allowFontChanges && before) {
    for (const [role, font] of Object.entries(before.fonts)) {
      if (after.fonts[role] && font !== after.fonts[role]) errors.push(`Font changed: ${role}`);
    }
  }
  if (before && !policy.allowComponentRemoval) {
    for (const [component, count] of Object.entries(before.components)) {
      if (count && !after.components[component]) errors.push(`Component removed: ${component}`);
    }
    if (before.images && !after.images) errors.push('All main photographs removed');
  }
  if (before && !policy.allowFormChanges && JSON.stringify(before.forms) !== JSON.stringify(after.forms)) {
    errors.push('Form fields, consent, action or routing attributes changed');
  }
  for (const button of after.buttons) {
    if (button.height < 38 || !Number.isFinite(button.lineHeight)) errors.push('Invalid CTA dimensions');
  }
  return errors;
}

function metrics() {
  const main = document.querySelector('main');
  const visible = el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
  const headings = [...(main?.querySelectorAll('h1,h2,h3,h4') || [])].filter(visible);
  const occurrences = new Map();
  const headingPairs = headings.flatMap(h => {
    const p = h.nextElementSibling;
    if (!p || !['P', 'UL', 'OL'].includes(p.tagName) || !visible(p)) return [];
    const a = h.getBoundingClientRect(), b = p.getBoundingClientRect();
    const base = `${h.tagName}.${h.className}/${h.parentElement.className}`;
    const ordinal = occurrences.get(base) || 0; occurrences.set(base, ordinal + 1);
    return [{key: `${base}:${ordinal}`, gap: Math.round(b.top - a.bottom),
      sideBySide: b.left >= a.right - 2 || a.left >= b.right - 2}];
  });
  const buttons = [...document.querySelectorAll('.btn,button[type="submit"]')].filter(visible).map(el => ({
    height: el.getBoundingClientRect().height, lineHeight: Number.parseFloat(getComputedStyle(el).lineHeight),
  }));
  const fonts = {body: getComputedStyle(document.body).fontFamily};
  for (const role of ['h1', 'h2', '.btn']) {
    const el = main?.querySelector(role); if (el) fonts[role] = getComputedStyle(el).fontFamily;
  }
  const routing = el => Object.fromEntries([...el.attributes].filter(a => a.name.startsWith('data-') &&
    /site|route|endpoint|webhook|tracker|recipient/.test(a.name)).map(a => [a.name, a.value]));
  const forms = [...document.querySelectorAll('form')].map(form => ({
    id: form.id, action: form.getAttribute('action') || '', method: form.getAttribute('method') || '',
    routing: routing(form), fields: [...form.querySelectorAll('input,select,textarea')].map(el => ({
      name: el.name, type: el.type, required: el.required, routing: routing(el),
      hiddenValue: el.type === 'hidden' && !/url|page|source|timestamp|session|token/i.test(el.name) ? el.value : undefined,
    })), consent: [...form.querySelectorAll('[class*="consent"], [class*="privacy"]')].map(el => el.textContent.trim()),
  }));
  return {overflow: document.documentElement.scrollWidth > innerWidth + 2,
    header: !!document.querySelector('header'), main: !!main, footer: !!document.querySelector('footer'),
    quoteCtas: [...document.querySelectorAll('a,button')].filter(el => visible(el) && /get a free quote/i.test(el.textContent)).length,
    images: main?.querySelectorAll('img').length || 0, fonts, forms, headingPairs, buttons,
    fontErrors: [...document.fonts].filter(face => face.status === 'error').map(face => face.family)
      .concat(document.fonts.status === 'loading' ? ['fonts still loading'] : []),
    components: Object.fromEntries(['.hero', '.page-hero', '.quote-card', '.svc-grid', '.process-grid', 'form']
      .map(s => [s, document.querySelectorAll(s).length]))};
}

async function serve(root) {
  const resolved = path.resolve(root);
  const types = {'.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.svg':'image/svg+xml',
    '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2', '.json':'application/json'};
  const server = http.createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
    try {
      let relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/+/, '');
      if (!relative || relative.endsWith('/')) relative += 'index.html';
      const file = path.resolve(resolved, relative);
      if (!file.startsWith(resolved + path.sep)) throw Error('Unsafe path');
      const raw = await fs.readFile(file);
      res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'});
      res.end(req.method === 'HEAD' ? undefined : raw);
    } catch {res.writeHead(404);res.end();}
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {server, origin: `http://127.0.0.1:${server.address().port}`};
}

export async function check(spec) {
  const prior = spec.baseline ? JSON.parse(await fs.readFile(spec.baseline, 'utf8')) : {results: []};
  const browser = await chromium.launch({channel: 'chrome', headless: true, chromiumSandbox: true});
  const servers = new Map(), results = [];
  let blockedWriteRequests = 0;
  await fs.mkdir(spec.output, {recursive: true});
  try {
    for (const job of spec.jobs) {
      let origin = `https://${job.domain}`;
      if (job.root) {
        if (!servers.has(job.root)) servers.set(job.root, await serve(job.root));
        origin = servers.get(job.root).origin;
      }
      for (const width of [1280, 375]) {
        const context = await browser.newContext({viewport: {width, height: 800}, reducedMotion: 'reduce', serviceWorkers: 'block'});
        const allowed = new Set([new URL(origin).hostname, 'fonts.googleapis.com', 'fonts.gstatic.com']);
        await context.route('**/*', route => {
          const request = route.request();
          if (!['GET','HEAD'].includes(request.method())) blockedWriteRequests++;
          return ['GET','HEAD'].includes(request.method()) && allowed.has(new URL(request.url()).hostname)
            ? route.continue() : route.abort();
        });
        const page = await context.newPage();
        const fontFailures = [];
        page.on('requestfailed', request => {
          if (['fonts.googleapis.com','fonts.gstatic.com'].includes(new URL(request.url()).hostname)) fontFailures.push('font request failed');
        });
        page.on('response', response => {
          if (response.status() >= 400 && ['fonts.googleapis.com','fonts.gstatic.com'].includes(new URL(response.url()).hostname)) fontFailures.push(`font HTTP ${response.status()}`);
        });
        const id = `${job.domain}:${job.route}:${width}`;
        const url = new URL(job.route, origin);
        if (!job.root) url.searchParams.set('release-check', spec.release);
        let data, errors = [];
        try {
          const response = await page.goto(url.href, {waitUntil: 'load', timeout: 45000});
          if (!response || response.status() !== 200) throw Error(`HTTP ${response?.status()}`);
          await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 8000))]));
          data = await page.evaluate(metrics);
          data.fontErrors.push(...fontFailures);
          const before = prior.results.find(r => r.id === id)?.metrics;
          errors = spec.capture ? [] : regressions(before, data, spec.policy);
          if (spec.baseline && !before) errors.push('Missing baseline for this page and viewport');
          const screenshot = id.replace(/[^a-zA-Z0-9.-]/g, '_') + '.png';
          await page.screenshot({path: path.join(spec.output, screenshot), fullPage: true, animations: 'disabled'});
        } catch (e) {errors.push(String(e));}
        results.push({id, metrics: data, errors});
        await context.close();
      }
    }
  } finally {
    await browser.close();
    for (const {server} of servers.values()) await new Promise(resolve => server.close(resolve));
  }
  const report = {release: spec.release, browserVersion: browser.version(), results, blockedWriteRequests, passed: results.every(r => !r.errors.length)};
  await fs.writeFile(path.join(spec.output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await check(JSON.parse(await fs.readFile(process.argv[2], 'utf8')));
  console.log(JSON.stringify({views: report.results.length, passed: report.passed,
    errors: report.results.filter(r => r.errors.length).map(r => ({id:r.id, errors:r.errors}))}));
  if (!report.passed) process.exitCode = 1;
}
