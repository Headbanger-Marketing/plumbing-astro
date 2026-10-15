import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { check, regressions } from './release-browser.mjs';

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
test('headless fixtures reject zero gaps and block POST requests',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'release-browser-test-'));
  try {
    const fixture=`<!doctype html><html><head><style>body{font-family:Arial}h2,p{margin:0}.btn{display:inline-block;padding:12px;line-height:24px}</style></head><body><header>Header</header><main><h2>Heading</h2><p>Body</p><a class="btn" href="#quote">Get A Free Quote</a><form><input name="email"></form></main><footer>Footer</footer><script>fetch('/lead',{method:'POST'}).catch(()=>{});</script></body></html>`;
    await fs.writeFile(path.join(root,'index.html'),fixture);
    const result=await check({release:'offline-fixture',output:path.join(root,'result'),jobs:[{domain:'fixture.invalid',route:'/',root}]});
    assert.equal(result.passed,false);
    assert.equal(result.blockedWriteRequests,2);
    assert.ok(result.results.every(r=>r.errors.some(e=>e.includes('gap'))));
  } finally {await fs.rm(root,{recursive:true,force:true});}
});
