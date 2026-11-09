const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const elements={app:{innerHTML:''},'test-error':{},'setup-error':{}};const ctx=vm.createContext({document:{getElementById:id=>elements[id]},window:{scrollTo(){},scrollY:0},localStorage:{getItem(){return null},setItem(){},removeItem(){}},console,Math,JSON,Number,Array,Object,String,Set,Error,Blob});
for(const file of ['engine.js','research.js','app.js','report.js'])vm.runInContext(fs.readFileSync('web/modules/mizac/'+file,'utf8'),ctx);
function ev(code){return vm.runInContext(code,ctx);}
assert.equal(ev('ITEMS.length'),96);assert.equal(ev('new Set(ITEMS.map(q=>q.id)).size'),96);assert.equal(ev('ITEMS.filter(q=>q.reverse).length'),48);
for(const val of [1,3,5]){ev(`var a=Object.fromEntries(ITEMS.map(q=>[q.id,q.reverse?6-${val}:${val}]));`);assert(ev(`score(a).every(d=>d.n===12&&d.score===${(val-1)*25})`));assert(ev(`facetScores(a).every(d=>d.n===6&&d.score===${(val-1)*25})`));}
ev('demo()');assert(elements.app.innerHTML.includes('18 bölüm'));assert(elements.app.innerHTML.includes('Bütünlüklü davranış anlatımı'));assert(!elements.app.innerHTML.includes('undefined'));assert(!elements.app.innerHTML.includes('NaN'));
ev('state.step=0; test();');for(let p=0;p<12;p++){assert(elements.app.innerHTML.includes(`Bölüm ${p+1} / 14`));ev(`ITEMS.slice(${p*8},${p*8+8}).forEach(q=>state.answers[q.id]=3);next();`);}
assert(elements.app.innerHTML.includes('Bölüm 13 / 14'));ev('SCENARIOS.forEach((s,i)=>state.scenarios[i]=0);next();');assert(elements.app.innerHTML.includes('Bölüm 14 / 14'));ev('state.motives=[0,1];next();');assert(ev('state.complete'));assert(elements.app.innerHTML.includes('Puanlar ve yanıt dayanakları'));
assert.equal(ev('variance([1,2,3])'),1);assert.equal(ev('correlation([1,2,3],[3,2,1])'),-1);assert.equal(ev('correlation([1,1,1],[1,2,3])'),null);
ev('var perfect=Array.from({length:5},(_,i)=>Object.fromEntries(ITEMS.map(q=>[q.id,q.reverse?5-i:i+1])));');assert(ev('analyzeMatrix(perfect).every(d=>Math.abs(d.alpha-1)<1e-10)'));
ev('var constant=Array.from({length:5},()=>Object.fromEntries(ITEMS.map(q=>[q.id,3])));');assert(ev('analyzeMatrix(constant).every(d=>d.alpha===null)'));
assert.equal(ev('parseCSV(\'a,b\\n"x,y","z"\\n\')[1][0]'),'x,y');
ev(`var header=['participant_id','form_version',...ITEMS.map(q=>q.id)];var row=['P1','0.2',...ITEMS.map(q=>3)];var imported=pilotRows([header,row,row,['P2','0.1',...ITEMS.map(q=>3)],['P3','0.2',...ITEMS.map(q=>'')]]);`);
assert.equal(ev('imported.matrix.length'),1);assert.equal(ev('imported.duplicate'),1);assert.equal(ev('imported.wrongVersion'),1);assert.equal(ev('imported.invalid'),1);
assert.throws(()=>ev("pilotRows([['extra']])"));
ev('research()');assert(elements.app.innerHTML.includes('Pilot veri laboratuvarı'));
console.log('PASS: 96 items, 16 facets, reverse coding, 14-step completion, expanded report, pilot CSV validation, known alpha/correlation/variance fixtures. Synthetic fixtures test software only; they are not validation evidence.');

// Narrative personalization across complete response patterns; no invalid/empty branches.
const rendered=[];
for(const val of [1,3,5]){ev(`state.answers=Object.fromEntries(ITEMS.map(q=>[q.id,q.reverse?6-${val}:${val}]));state.complete=true;report();`);assert(!elements.app.innerHTML.includes('undefined'));assert(!elements.app.innerHTML.includes('NaN'));assert.equal((elements.app.innerHTML.match(/class="report-page"/g)||[]).length,18);rendered.push(elements.app.innerHTML);}
assert.notEqual(rendered[0],rendered[1]);assert.notEqual(rendered[1],rendered[2]);
ev('state.context={plan:1,voice:5};report();');assert(elements.app.innerHTML.includes('Farklı yön veya düzey beyanı var.'));
console.log('PASS: 18-chapter narrative, low/mid/high branch rendering and optional role-context comparison.');
