const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
function site(query='?example=airliner#showcase',config={applicationFormUrl:''}) {
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://thu-cad.github.io/gme-website/'+query,runScripts:'outside-only'});
 const w=dom.window;
 w.matchMedia=()=>({matches:false,addEventListener(){}});
 w.IntersectionObserver=class{observe(){}};
 w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
 w.document.execCommand=()=>true;
 w.eval(fs.readFileSync(path.join(root,'concepts.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'cases.js'),'utf8'));
 w.GME_SITE=config;
 w.eval(fs.readFileSync(path.join(root,'app.js'),'utf8'));
 return w;
}
function search(w,value){const q=w.document.getElementById('case-search');q.value=value;q.dispatchEvent(new w.Event('input'));}
test('opening the homepage preserves its address while displaying the default model',()=>{
 for(const suffix of ['', '#contact', '?utm_source=community#showcase']){
  const w=site(suffix);
  assert.equal(w.location.href,'https://thu-cad.github.io/gme-website/'+suffix);
  assert.equal(w.document.querySelector('[data-case][aria-selected="true"]').dataset.case,'airliner');
  w.close();
 }
});
test('restoring the plain homepage after a case link keeps the address clean',()=>{
 const w=site('?example=motherboard#showcase');
 w.history.pushState(null,'','/gme-website/');
 w.dispatchEvent(new w.PopStateEvent('popstate'));
 assert.equal(w.location.href,'https://thu-cad.github.io/gme-website/');
 assert.equal(w.document.querySelector('[data-case][aria-selected="true"]').dataset.case,'airliner');
 w.document.querySelector('[data-case="yacht"]').click();
 assert.equal(new URL(w.location).searchParams.get('example'),'yacht');
 w.close();
});
test('search aliases find airplane, board and ship',()=>{
 const w=site();for(const [q,id] of [['飞机','airliner'],['电路板','motherboard'],['船舶','yacht']]){search(w,q);assert.equal(w.document.querySelector('[data-case][aria-selected="true"]').dataset.case,id);assert.equal(new URL(w.location).searchParams.get('example'),id);}w.close();
});
test('category switches synchronize URL and share target',()=>{
 const w=site();w.document.querySelector('[data-case-filter="freeform"]').click();assert.equal(new URL(w.location).searchParams.get('example'),'spline-compressor');assert.match(w.document.getElementById('case-share').dataset.url,/models\/spline-compressor\/$/);w.close();
});
test('empty searches clear stale selection and model, and can recover',()=>{
 const w=site();let model;w.addEventListener('gme-case-change',e=>model=e.detail);search(w,'no such model');assert.equal(model,null);assert.ok(w.document.getElementById('case-panel').hidden);assert.equal(w.document.querySelectorAll('[data-case][aria-selected="true"]').length,0);assert.equal(new URL(w.location).searchParams.has('example'),false);w.document.getElementById('case-clear').click();assert.ok(!w.document.getElementById('case-panel').hidden);assert.ok(w.document.getElementById('case-empty').hidden);w.close();
});
test('principle deep links and browser history select correctly',()=>{
 const w=site('?example=intersection#showcase');assert.equal(w.document.querySelector('[data-case][aria-selected="true"]').dataset.case,'intersection');w.history.pushState(null,'','?example=motherboard#showcase');w.dispatchEvent(new w.PopStateEvent('popstate'));assert.equal(w.document.querySelector('[data-case][aria-selected="true"]').dataset.case,'motherboard');w.close();
});
test('video has no auto play and quality choices are available',()=>{
 const w=site();assert.equal(w.document.getElementById('hero-video').preload,'none');assert.equal(w.document.getElementById('hero-video').autoplay,false);assert.ok(!w.document.getElementById('model-quality-label').hidden);w.close();
});
test('enterprise fields are required only for enterprise applicants',()=>{
 const w=site(),d=w.document;d.querySelector('[name="applicantType"][value="企业"]').click();assert.ok(d.getElementById('app-org').required);assert.ok(d.getElementById('app-team-size').required);assert.ok(!d.getElementById('app-team-size').disabled);d.querySelector('[name="applicantType"][value="个人"]').click();assert.ok(!d.getElementById('app-org').required);assert.ok(d.getElementById('app-team-size').disabled);w.close();
});
test('unconfigured/unsafe Feishu links are hidden; valid respondent URL is enabled',()=>{
 for(const url of ['', 'http://example.com','https://feishu.cn.example.com']){const w=site('',{applicationFormUrl:url});assert.ok(w.document.getElementById('online-application').hidden);w.close();}
 const w=site('',{applicationFormUrl:'https://example.feishu.cn/share/base/form/test'});assert.ok(!w.document.getElementById('online-application').hidden);w.close();
});
test('email draft contains use, payment and enterprise answers without sending',()=>{
 const w=site(),d=w.document;d.querySelector('[name="applicantType"][value="企业"]').click();
 for(const [id,val] of [['app-name','测试联系人'],['app-email','example@example.com'],['app-org','测试单位'],['app-team-size','12'],['app-message','用于验证建模接口和测试流程']])d.getElementById(id).value=val;
 for(const name of ['interest','purpose','softwarePayment','sourcePayment'])d.querySelector('[name="'+name+'"]').checked=true;
 d.getElementById('application-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
 const text=d.getElementById('application-text').value;assert.match(text,/企业联系邮箱：example@example.com/);assert.match(text,/12 人/);assert.match(text,/完整源代码/);assert.match(d.getElementById('application-send').href,/^mailto:gme_community@163.com/);w.close();
});
