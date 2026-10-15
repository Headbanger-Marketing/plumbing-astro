import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { check, regressions } from './release-browser.mjs';
import './test-form-contract.mjs';

const good = () => ({header:true, main:true, footer:true, quoteCtas:1, overflow:false, images:1,
  fonts:{body:'Arial'}, forms:[{action:'/lead',fields:['email']}],
  components:{'.hero':1,form:1},headingPairs:[{key:'h2',gap:16,sideBySide:false}],buttons:[{height:48,lineHeight:24}]});
test('catches the missing-gap regression',()=>{const a=good();a.headingPairs[0].gap=0;assert.match(regressions(good(),a).join(),/gap/);});
test('ignores intentional side-by-side text',()=>{const a=good();a.headingPairs[0]={key:'h2',gap:-200,sideBySide:true};assert.deepEqual(regressions(good(),a),[]);});
test('catches font changes',()=>{const a=good();a.fonts.body='Times';assert.match(regressions(good(),a).join(),/Font/);});
test('catches deleted landing-page components',()=>{const a=good();a.components['.hero']=0;assert.match(regressions(good(),a).join(),/Component/);});
test('catches routing or consent changes',()=>{const a=good();a.forms[0].action='/other';assert.match(regressions(good(),a).join(),/routing/);});
test('explicit policy permits reviewed form changes',()=>{const a=good();a.forms=[];assert.deepEqual(regressions(good(),a,{allowFormChanges:true}),[]);});
test('preserves existing conversion CTAs',()=>{const a=good();a.quoteCtas=0;assert.match(regressions(good(),a).join(),/CTAs/);});
test('preserves intentional legal pages without a mobile CTA',()=>{const a=good();a.quoteCtas=0;assert.deepEqual(regressions(a,a),[]);});
test('catches webfont loading failures',()=>{const a=good();a.fontErrors=['Inter'];assert.match(regressions(good(),a).join(),/Webfont/);});
test('preserves photographs',()=>{const a=good(),b=good();a.imageSources=['hero.jpg'];b.imageSources=['blank.svg'];assert.match(regressions(a,b).join(),/photographs/);});
test('preserves service and quote-form order',()=>{const a=good(),b=good();a.flow=['hero','form','services'];b.flow=['hero','services','form'];assert.match(regressions(a,b).join(),/order/);});
test('preserves the desktop hero/form layout',()=>{const a=good(),b=good();a.flow=b.flow=['hero','form'];a.heroFormSideBySide=true;b.heroFormSideBySide=false;assert.match(regressions(a,b).join(),/placement/);});
const proseStyle = (overrides={}) => ({fontFamily:'Inter',fontSize:17,lineHeight:28.9,...overrides});
test('rejects mismatched adjacent prose even when the baseline has the same defect',()=>{
  for (const override of [{fontSize:18.88},{lineHeight:32.1},{fontFamily:'Times New Roman'}]) {
    const a=good();a.prosePairs=[{key:'opening',first:proseStyle(override),second:proseStyle()}];
    assert.match(regressions(a,a).join(),/Inconsistent adjacent body typography/);
    assert.match(regressions(undefined,a).join(),/Inconsistent adjacent body typography/);
  }
});
test('permits consistent prose alongside distinct heading and button typography',()=>{
  const a=good();a.fonts={body:'Inter',h1:'Plus Jakarta Sans',h2:'Plus Jakarta Sans','.btn':'Plus Jakarta Sans'};
  a.prosePairs=[{key:'opening',first:proseStyle(),second:proseStyle()}];
  a.bodyTypography=proseStyle();a.standardProse=[{key:'section-head',style:proseStyle()}];
  assert.deepEqual(regressions(a,a),[]);
});
test('rejects standalone standard prose defects without depending on a baseline or sibling pair',()=>{
  for (const key of ['lead','section-head','article']) {
    for (const override of [{fontSize:17.28},{lineHeight:29.3},{fontFamily:'Times New Roman'}]) {
      const a=good();a.prosePairs=[];a.bodyTypography=proseStyle();a.standardProse=[{key,style:proseStyle(override)}];
      assert.match(regressions(a,a).join(),/Inconsistent standard body typography/);
      assert.match(regressions(undefined,a).join(),/Inconsistent standard body typography/);
    }
  }
  const electrical=good();electrical.bodyTypography=proseStyle({lineHeight:27.2});
  electrical.standardProse=[{key:'article',style:proseStyle({lineHeight:27.2})}];
  assert.deepEqual(regressions(electrical,electrical),[]);
});
test('allows only subpixel rounding in adjacent prose metrics',()=>{
  const a=good();a.prosePairs=[{key:'article',first:proseStyle({fontSize:17.1,lineHeight:29}),second:proseStyle()}];
  assert.deepEqual(regressions(a,a),[]);
  a.prosePairs[0].first.fontSize=17.28;
  assert.match(regressions(a,a).join(),/fontSize/);
});
test('headless fixtures find inherited prose defects and preserve intentional text roles',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'release-prose-test-'));
  try {
    const fixture=`<!doctype html><html><head><style>
      body{font:17px/1.7 Arial}h1,h2,.btn{font-family:Georgia}h2{margin:0 0 16px}p{margin:0 0 16px}
      .btn{display:inline-block;padding:12px;line-height:24px}.lead{font-size:18.88px}.article p{font-size:18px}
      .hero .lead{font-size:24px}.footnote{font-size:12px}.helper{font-size:13px}
      </style></head><body><header>Header</header><main>
      <section class="hero"><h1>Site identity</h1><p class="lead">Prominent hero introduction.</p><p>Separate hero support.</p></section>
      <section><h2>Plan the request</h2><p class="lead">Describe the work your property needs.</p><p>Include equipment, access and timing details.</p></section>
      <article class="article"><p>Check the equipment before requesting service.</p><ul><li>Record its model and the symptoms.</li></ul></article>
      <section><p class="lead">A standalone body introduction.</p><h2>Another section</h2><p>Normal body prose.</p></section>
      <section><p class="footnote"><a href="/source/">Reference source</a></p><p>Normal prose after a reference.</p></section>
      <section><p role="note" class="helper">A separate note.</p><p>Normal prose after a note.</p></section>
      <form><p class="helper">Form support copy.</p><p>Form security copy.</p></form>
      <figure><p class="helper">Photograph caption.</p><p>Photo credit.</p></figure>
      <a class="btn" href="#quote">Get A Free Quote</a></main><footer>Footer</footer></body></html>`;
    await fs.writeFile(path.join(root,'index.html'),fixture);
    const jobs=[{domain:'fixture.invalid',route:'/',root}];
    const baselineOutput=path.join(root,'baseline');
    const baseline=await check({release:'prose-fixture',capture:true,output:baselineOutput,jobs});
    assert.equal(baseline.passed,true);
    assert.ok(baseline.results.every(r=>r.metrics.prosePairs.length===2));
    const unchanged=await check({release:'prose-fixture',baseline:path.join(baselineOutput,'report.json'),output:path.join(root,'unchanged'),jobs});
    assert.equal(unchanged.passed,false);
    assert.ok(unchanged.results.every(r=>r.errors.filter(e=>e.includes('Inconsistent adjacent body typography')).length===2));
    await fs.writeFile(path.join(root,'index.html'),fixture.replace('.lead{font-size:18.88px}', '.lead{font-size:17px}').replace('.article p{font-size:18px}', '.article p{font-size:17px}'));
    const repaired=await check({release:'prose-fixture',baseline:path.join(baselineOutput,'report.json'),output:path.join(root,'repaired'),jobs});
    assert.equal(repaired.passed,true,JSON.stringify(repaired.results.map(r=>r.errors)));
    assert.equal(repaired.blockedWriteRequests,0);
    assert.ok(repaired.results.every(r=>r.metrics.prosePairs.length===2));
  } finally {await fs.rm(root,{recursive:true,force:true});}
});
test('headless standalone prose contracts fail an unchanged bad baseline and accept inherited body styles',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'release-standard-prose-test-'));
  try {
    const defects='.lead{font-size:18.88px}.section-head p{font-size:17.6px}.article p{font-size:17.28px}';
    const fixture=`<!doctype html><html><head><style>
      body{font:17px/1.6 Arial}h1,h2,.btn{font-family:Georgia}h2{margin:0 0 16px}p{margin:0 0 16px}
      .btn{display:inline-block;padding:12px;line-height:24px}${defects}
      .hero .lead{font-size:24px}form .lead{font-size:13px}figure .lead,.article__meta p{font-size:12px}.post-card p{font-size:14px}
      </style></head><body><header>Header</header><main>
      <section class="hero"><h1>Site identity</h1><p class="lead">Prominent hero introduction.</p></section>
      <section><h2>Ordinary introduction</h2><p class="lead">Describe the work your property needs.</p></section>
      <section class="section-head"><h2>Section introduction</h2><p>Include equipment, access and timing details.</p></section>
      <article class="article"><h2>Article section</h2><p>Check the equipment before requesting service.</p></article>
      <article class="article"><div class="article__meta"><p>Compact article metadata.</p></div></article>
      <section><p class="lead"><a href="/source/">Reference source</a></p></section>
      <section><p class="lead" role="note">A separate note.</p></section>
      <section class="post-card"><p>Compact card summary.</p></section>
      <form><p class="lead">Form support copy.</p></form><figure><p class="lead">Photograph caption.</p></figure>
      <a class="btn" href="#quote">Get A Free Quote</a></main><footer>Footer</footer></body></html>`;
    await fs.writeFile(path.join(root,'index.html'),fixture);
    const jobs=[{domain:'fixture.invalid',route:'/',root}], baselineOutput=path.join(root,'baseline');
    const baseline=await check({release:'standard-prose-fixture',capture:true,output:baselineOutput,jobs});
    assert.equal(baseline.passed,true);
    assert.ok(baseline.results.every(r=>r.metrics.prosePairs.length===0 && r.metrics.standardProse.length===3));
    const unchanged=await check({release:'standard-prose-fixture',baseline:path.join(baselineOutput,'report.json'),output:path.join(root,'unchanged'),jobs});
    assert.equal(unchanged.passed,false);
    assert.ok(unchanged.results.every(r=>r.errors.filter(e=>e.includes('Inconsistent standard body typography')).length===3));
    await fs.writeFile(path.join(root,'index.html'),fixture.replace(defects,''));
    const repaired=await check({release:'standard-prose-fixture',baseline:path.join(baselineOutput,'report.json'),output:path.join(root,'repaired'),jobs});
    assert.equal(repaired.passed,true,JSON.stringify(repaired.results.map(r=>r.errors)));
    assert.equal(repaired.blockedWriteRequests,0);
    assert.ok(repaired.results.every(r=>r.metrics.prosePairs.length===0 && r.metrics.standardProse.length===3));
  } finally {await fs.rm(root,{recursive:true,force:true});}
});
test('headless fixtures reject zero gaps and block POST requests',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'release-browser-test-'));
  try {
    const fixture=`<!doctype html><html><head><style>body{font-family:Arial}h2,p{margin:0}.btn{display:inline-block;padding:12px;line-height:24px}</style></head><body><header>Header</header><main><h2>Heading</h2><p>Body</p><a class="btn" href="#quote">Get A Free Quote</a><form data-domain="fixture.invalid"><input name="email" data-recipient="original"><input name="invisible" style="visibility:hidden"><input name="transparent" style="opacity:0"><fieldset disabled><input name="disabled-control"></fieldset></form></main><footer>Footer</footer><script>fetch('/lead',{method:'POST'}).catch(()=>{});</script></body></html>`;
    await fs.writeFile(path.join(root,'index.html'),fixture);
    const result=await check({release:'offline-fixture',output:path.join(root,'result'),jobs:[{domain:'fixture.invalid',route:'/',root}]});
    assert.equal(result.passed,false);
    assert.equal(result.blockedWriteRequests,2);
    assert.ok(result.results.every(r=>r.errors.some(e=>e.includes('gap'))));
    for (const {metrics} of result.results) {
      const form=metrics.forms[0];
      assert.equal(form.routing['data-domain'],'fixture.invalid');
      assert.equal(form.fields[0].routing['data-recipient'],'original');
      assert.equal(form.fields.find(field=>field.name==='invisible').visible,false);
      assert.equal(form.fields.find(field=>field.name==='transparent').visible,false);
      assert.equal(form.fields.find(field=>field.name==='disabled-control').disabled,true);
    }
  } finally {await fs.rm(root,{recursive:true,force:true});}
});
