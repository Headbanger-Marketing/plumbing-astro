// Read-only release checks. Fresh browser contexts never submit enquiries.
import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { formContractErrors } from './form-contract.mjs';

export function regressions(before, after, policy = {}) {
  const errors = [];
  const typographyDifferences = (first, second) => ['fontFamily', 'fontSize', 'lineHeight'].filter(property => {
    const a = first[property], b = second[property];
    return typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) > 0.100001 : a !== b;
  });
  if (after.overflow) errors.push('Horizontal overflow');
  if (after.fontErrors?.length) errors.push('Webfont load failure: ' + after.fontErrors.join(', '));
  // A defective live baseline must not authorize mismatched body prose again.
  // Heading, CTA, hero and helper-text roles are deliberately outside these pairs.
  for (const pair of after.prosePairs || []) {
    const differences = typographyDifferences(pair.first, pair.second);
    if (differences.length) errors.push(`Inconsistent adjacent body typography (${differences.join(', ')}): ${pair.key}`);
  }
  // These ordinary prose selectors share the body contract even when standalone.
  for (const paragraph of after.standardProse || []) {
    const differences = typographyDifferences(paragraph.style, after.bodyTypography);
    if (differences.length) errors.push(`Inconsistent standard body typography (${differences.join(', ')}): ${paragraph.key}`);
  }
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
  if (before && !policy.allowFormChanges) {
    errors.push(...formContractErrors(before.forms, after.forms, policy.formContract));
  }
  if (before?.imageSources && !policy.allowImageChanges && JSON.stringify(before.imageSources) !== JSON.stringify(after.imageSources)) {
    errors.push('Existing main photographs or hero background changed');
  }
  if (before?.flow && !policy.allowLayoutChanges) {
    let position = 0;
    for (const item of after.flow || []) if (item === before.flow[position]) position++;
    if (position !== before.flow.length) errors.push('Landing-page component order changed');
    if (before.heroFormSideBySide != null && before.heroFormSideBySide !== after.heroFormSideBySide) errors.push('Hero/form placement changed');
  }
  for (const button of after.buttons) {
    if (button.height < 38 || !Number.isFinite(button.lineHeight)) errors.push('Invalid CTA dimensions');
  }
  return errors;
}

function metrics(domain) {
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
  const proseExclusions = '.hero,.page-hero,form,figure,figcaption,[role="note"],.article__meta,.form-note,.form-fallback,.form-readiness,.recipient-note,.quote-consent,.review__by';
  const normalProse = el => {
    if (!el || !visible(el) || !el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}) || el.closest(proseExclusions)) return false;
    if (el.querySelector('small,.btn,button,input,select,textarea,h1,h2,h3,h4,h5,h6,p,ul,ol')) return false;
    const copy = el.cloneNode(true);
    copy.querySelectorAll('a,svg,[aria-hidden="true"]').forEach(node => node.remove());
    return !!copy.textContent.trim(); // Link-only sources and footnotes are separate text roles.
  };
  const proseStyle = el => {
    const style = getComputedStyle(el);
    return {fontFamily: style.fontFamily, fontSize: Number.parseFloat(style.fontSize),
      lineHeight: style.lineHeight === 'normal' ? 'normal' : Number.parseFloat(style.lineHeight)};
  };
  const bodyTypography = proseStyle(document.body);
  const standardProse = [...(main?.querySelectorAll('p.lead,.section-head p,.article p') || [])]
    .filter(normalProse).map((p, ordinal) => ({
      key: `P.${p.className}/${p.parentElement.tagName}.${p.parentElement.className}:${ordinal}`, style: proseStyle(p),
    }));
  const prosePairs = [];
  for (const [ordinal, p] of [...(main?.querySelectorAll('p') || [])].entries()) {
    if (!normalProse(p)) continue;
    const key = `P.${p.className}/${p.parentElement.tagName}.${p.parentElement.className}:${ordinal}`;
    const next = p.nextElementSibling;
    if (next?.tagName === 'P' && normalProse(next)) prosePairs.push({key, first: proseStyle(p), second: proseStyle(next)});
    if (!p.closest('.article')) continue;
    for (const list of [p.previousElementSibling, next]) {
      if (!list || !['UL','OL'].includes(list.tagName) || list.closest(proseExclusions)) continue;
      for (const [index, item] of [...list.children].entries()) {
        if (item.tagName === 'LI' && normalProse(item)) prosePairs.push({key: `${key}/${list.tagName}>LI:${index}`,
          first: proseStyle(p), second: proseStyle(item)});
      }
    }
  }
  const routing = el => Object.fromEntries([...el.attributes].filter(a => a.name.startsWith('data-') &&
    /site|domain|route|endpoint|webhook|tracker|recipient/.test(a.name)).map(a => [a.name, a.value]));
  const labelText = el => [...(el.labels || [])].map(label => {
    const copy = label.cloneNode(true);
    copy.querySelectorAll('input,select,textarea,button,.error-text').forEach(node => node.remove());
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }).join(' ');
  const accessibleText = el => {
    if (!el) return '';
    const copy = el.cloneNode(true);
    copy.querySelectorAll('svg,[aria-hidden="true"]').forEach(node => node.remove());
    return copy.textContent.replace(/\s+/g, ' ').trim();
  };
  const forms = [...document.querySelectorAll('form')].map(form => ({
    id: form.id, action: form.getAttribute('action') || '', method: form.getAttribute('method') || '',
    contract: form.dataset.quoteContract || null,
    heading: accessibleText(form.querySelector('[data-quote-heading]')),
    support: accessibleText(form.querySelector('[data-quote-support]')),
    submitLabels: [...form.querySelectorAll('button[type="submit"],input[type="submit"]')].map(el => el.tagName === 'INPUT' ? el.value : accessibleText(el)),
    collapsedDetails: !!form.querySelector('details:not([open])'),
    redirect: form.getAttribute('data-redirect-on-success'), submitGuard: form.getAttribute('onsubmit'), noValidate: form.noValidate,
    privacyLinks: [...form.querySelectorAll('a[href*="privacy"]')].map(el => ({href:el.getAttribute('href'),text:el.textContent.trim()})),
    securityCopy: [...form.querySelectorAll('.form-readiness,.form-fallback,.form-note,noscript')].map(el => el.textContent.trim()),
    routing: routing(form), fields: [...form.querySelectorAll('input,select,textarea')].map(el => ({
      name: el.name, type: el.type, required: el.required, routing: routing(el), disabled: el.matches(':disabled'),
      role: el.dataset.quoteField || el.name, label: labelText(el), requiredMarker: labelText(el).includes('*'),
      placeholder: el.tagName === 'SELECT' ? el.querySelector('option[value=""]')?.textContent.trim() || '' : el.getAttribute('placeholder') || '',
      visible: visible(el) && el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}), collapsed: !!el.closest('details:not([open])'),
      prefilled: (el.dataset.quoteField || el.name) === 'city' ? !!el.value.trim() : undefined,
      emptyOption: el.tagName === 'SELECT' && el.querySelector('option[value=""]') ? {text:el.querySelector('option[value=""]').textContent.trim()} : undefined,
      hiddenValue: el.type === 'hidden' && !/url|page|source|timestamp|session|token/i.test(el.name) ? el.value : undefined,
    })), consent: [...form.querySelectorAll('[class*="consent"], [class*="privacy"]')].map(el => el.textContent.trim()),
  }));
  const normalizeImage = value => {
    try {const u = new URL(value, location.href);return [domain,location.hostname].includes(u.hostname) ? '<site>'+u.pathname+u.search : u.href;}
    catch {return value;}
  };
  const hero=main?.querySelector('.hero,.page-hero'), heroHeading=hero?.querySelector('h1'), heroForm=hero?.querySelector('form');
  let heroFormSideBySide=null;
  if (heroHeading && heroForm && visible(heroHeading) && visible(heroForm)) {
    const a=heroHeading.getBoundingClientRect(), b=heroForm.getBoundingClientRect();
    heroFormSideBySide=a.right<=b.left+2 || b.right<=a.left+2;
  }
  const imageSources=[...(main?.querySelectorAll('img') || [])].map(el=>normalizeImage(el.getAttribute('src') || ''));
  if (hero) imageSources.push(getComputedStyle(hero).backgroundImage.replace(/url\(["']?([^"')]+)["']?\)/g,(_,url)=>`url(${normalizeImage(url)})`));
  const flow=[...(main?.querySelectorAll('.hero,.page-hero,.svc-grid,.svc-card,.process-grid,form,[id="quote"],[id="services"],[id="process"],[id="faq"]') || [])]
    .filter(visible).map(el=>el.tagName==='FORM'?'form':el.id || ['hero','page-hero','svc-grid','svc-card','process-grid'].find(c=>el.classList.contains(c)));
  return {overflow: document.documentElement.scrollWidth > innerWidth + 2,
    header: !!document.querySelector('header'), main: !!main, footer: !!document.querySelector('footer'),
    quoteCtas: [...document.querySelectorAll('a,button')].filter(el => visible(el) && /get a free quote/i.test(el.textContent)).length,
    images: main?.querySelectorAll('img').length || 0, imageSources, flow, heroFormSideBySide, fonts, bodyTypography, standardProse, prosePairs, forms, headingPairs, buttons,
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
          data = await page.evaluate(metrics, job.domain);
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
