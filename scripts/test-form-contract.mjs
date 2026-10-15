import test from 'node:test';
import assert from 'node:assert/strict';
import {formContractErrors} from './form-contract.mjs';

const fields = [
  ['name','text',true,'Full Name','Jane Doe'],
  ['phone','tel',true,'Phone','(905) 000-0000'],
  ['email','email',true,'Email','you@email.com'],
  ['address','text',false,'Street Address','123 Main St'],
  ['city','text',true,'City','$siteCity'],
  ['postal','text',true,'Postal Code','N1A 1A1'],
  ['service','select-one',false,'Work to discuss','Choose the work'],
  ['message','textarea',true,'Briefly describe your issue','$serviceExample'],
].map(([name,type,required,label,placeholder])=>({name,type,required,label,placeholder}));
const contract = {id:'2026-10-15',fields,heading:'Get a Free Quote',submit:'Request My Free Quote',support:['No obligation. Fast response. Honest pricing.']};
function form() {
  return {id:'quote',action:'/lead',method:'post',routing:{'data-domain':'fixture.invalid'},redirect:'/thank-you/',submitGuard:null,noValidate:true,
    consent:['I agree to be contacted.'],privacyLinks:[{href:'/privacy-policy/',text:'Privacy notice'}],securityCopy:['Preparing the secure form.'],
    contract:contract.id,heading:contract.heading,support:contract.support[0],submitLabels:[contract.submit],collapsedDetails:false,
    fields:fields.map(field=>({...field,role:field.name,label:field.label+(field.required?' *':''),requiredMarker:field.required,visible:true,collapsed:false,
      placeholder:field.placeholder==='$siteCity'?'London':field.placeholder==='$serviceExample'?'e.g. Furnace won’t turn on…':field.placeholder,
      prefilled:field.name==='city'?false:undefined,emptyOption:field.name==='service'?{text:'Choose the work'}:undefined}))
      .concat([{name:'consent',type:'checkbox',required:true,visible:true},{name:'website',type:'text',required:false,visible:false}])};
}
function before() {const old=form();old.contract=null;old.heading='Get A Free Quote';old.fields.find(f=>f.name==='phone').required=false;return old;}
test('accepts the complete reviewed restoration while retaining consent and routing',()=>assert.deepEqual(formContractErrors([before()],[form()],contract),[]));
test('does not permit restoration without its reviewed policy',()=>assert.match(formContractErrors([before()],[form()]).join(),/changed/));
const cases = [
  ['required phone', f=>f.fields.find(x=>x.name==='phone').required=false],
  ['submission field name', f=>f.fields.find(x=>x.name==='email').name='unread_email'],
  ['submission field routing', f=>f.fields.find(x=>x.name==='email').routing={'data-field-id':'wrong'}],
  ['enabled core fields', f=>f.fields.find(x=>x.name==='phone').disabled=true],
  ['required postal code', f=>f.fields.find(x=>x.name==='postal').required=false],
  ['optional work choice', f=>f.fields.find(x=>x.name==='service').required=true],
  ['no submitted city prefill', f=>f.fields.find(x=>x.name==='city').prefilled=true],
  ['visible address', f=>f.fields.find(x=>x.name==='address').visible=false],
  ['approved order', f=>[f.fields[1],f.fields[2]]=[f.fields[2],f.fields[1]]],
  ['no optional label suffix', f=>f.fields.find(x=>x.name==='service').label+=' (optional)'],
  ['required asterisks', f=>f.fields[0].requiredMarker=false],
  ['no collapsed address', f=>f.collapsedDetails=true],
  ['existing recipient routing', f=>f.routing['data-domain']='other.invalid'],
  ['existing action', f=>f.action='/elsewhere'],
  ['existing consent', f=>f.consent=[]],
  ['existing privacy links', f=>f.privacyLinks=[]],
  ['existing hidden anti-spam fields', f=>f.fields.pop()],
  ['approved heading', f=>f.heading='Request an appointment'],
  ['approved support', f=>f.support='Guaranteed immediate appointment.'],
  ['approved submit label', f=>f.submitLabels=['Get A Free Quote']],
  ['empty optional work option', f=>f.fields.find(x=>x.name==='service').emptyOption=null],
];
for(const [name,change] of cases)test('reviewed contract still enforces '+name,()=>{const f=form();change(f);assert.ok(formContractErrors([before()],[f],contract).length);});
test('reviewed contract refuses missing forms',()=>assert.match(formContractErrors([before()],[],contract).join(),/remove forms/));
test('reviewed contract does not permit an unmarked changed form',()=>{const f=form();f.contract=null;assert.match(formContractErrors([before()],[f],contract).join(),/unapproved/);});
