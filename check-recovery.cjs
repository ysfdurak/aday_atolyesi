const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:null};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync('web/reliability.js','utf8'),ctx);const W=ctx.WorkspaceReliability;
const map=new Map(),mutations=[];const storage={getItem:k=>map.get(k)??null,setItem(k,v){mutations.push(['set',k]);map.set(k,v)},removeItem(k){mutations.push(['remove',k]);map.delete(k)}};
// Capture the real role writer, rather than assuming every stored key has an object value.
const role={window:null,crypto:require('node:crypto').webcrypto,document:{querySelector:()=>({innerHTML:'',addEventListener(){}}),querySelectorAll:()=>[]},localStorage:storage};role.window=role;vm.createContext(role);for(const f of ['content','app'])vm.runInContext(fs.readFileSync('web/modules/rol/'+f+'.js','utf8'),role);
vm.runInContext("logProfile({roleType:'analyst',depth:'standard',priorities:Object.fromEntries(C.dimensions.map(d=>[d.id,1]))})",role);
const eventKey='rol-atolyesi-profile-events-v1',raw=map.get(eventKey);assert(Array.isArray(JSON.parse(raw)));assert.equal(JSON.parse(raw)[0].type,'profile_configured');mutations.length=0;
let result=W.inspect(storage,[eventKey]);assert.equal(result.broken.length,0);assert.equal(map.get(eventKey),raw);assert.equal(mutations.length,0);
map.set('aa-state-v1',JSON.stringify({schema:1,profile:null,examples:[],checks:{},cv:{}}));map.set('zp-session-v1','null');result=W.inspect(storage,['aa-state-v1',eventKey,'zp-session-v1']);assert.equal(result.broken.length,0);
const host={set innerHTML(_){throw Error('Recovery screen must not replace the app for valid role history')}};assert.equal(W.gate({storage,keys:['aa-state-v1',eventKey,'zp-session-v1'],host}),false);
map.set('mizac-v2','{broken');result=W.inspect(storage,[eventKey,'mizac-v2']);assert.equal(result.broken.length,1);assert.equal(result.broken[0].key,'mizac-v2');assert.equal(result.broken[0].reason,'Kayıt metni okunamıyor.');assert.equal(map.get(eventKey),raw);assert.equal(mutations.length,0);
let markup='';const nodes={};const brokenHost={set innerHTML(s){markup=s},querySelector(id){return nodes[id]||(nodes[id]={})}};assert(W.gate({storage,keys:[eventKey,'mizac-v2'],host:brokenHost,download(){},restore(){},retry(){}}));assert(markup.includes('Mizaç yanıtları'));assert(!markup.includes(raw));assert.equal(mutations.length,0);
map.set('aa-state-v1','[]');assert.equal(W.inspect(storage,['aa-state-v1']).broken.length,1);map.set('zp-data-v1','[]');assert.equal(W.inspect(storage,['zp-data-v1']).broken.length,1);map.set(eventKey,'{}');assert.equal(W.inspect(storage,[eventKey]).broken.length,1);
assert(W.inspect({getItem(){throw Error('blocked')}},['aa-state-v1']).unavailable);
console.log('PASS: actual role event writer accepted, main app not gated, zero storage mutations, null session accepted, malformed JSON and wrong shapes still isolated by key.');
