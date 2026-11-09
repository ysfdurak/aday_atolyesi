(function(root){
'use strict';
const DAY=86400000;
const names=[['İki adımlı çarpma–toplama','Çarpma–çıkarma döngüsü','Üç adımlı işlem döngüsü','Artan çarpan'],['Zıt yönlü iki dizi','İki geometrik alt dizi','Üç farklı alt dizi','Sayı çiftleri ilişkisi'],['Sabit ikinci fark','Sabit üçüncü fark','Geometrik büyüyen fark','İşaret değiştiren farklar'],['Son iki terimin toplamı','Toplama ve sabit ekleme','Ağırlıklı önceki terimler','Rakam toplamıyla ilerleme'],['Ölçeklenmiş kareler','Ölçeklenmiş küpler','Faktöriyel ve sabit','Asal sayılar ve ölçek'],['Bozulmuş işlem döngüsü','Bozulmuş ikinci fark','Bozulmuş özyineleme','Bozulmuş geometrik fark']];
for(let t=0;t<5;t++)names[t].push(...Numeric.extraNames[t]);
const catalog=names.slice(0,5).flatMap((row,type)=>row.map((name,variant)=>({id:`num-${type}-${variant}`,type,variant,name})));
const byId=id=>catalog.find(r=>r.id===id)||(/^num-5-[0-9]+$/.test(id)?{id,type:5,variant:Number(id.split('-')[2]),name:'Hatalı terim denetimi'}:null);
const familyNames=['İşlem döngüsü','Alt diziler / gruplar','Farkların yapısı','Önceki terimler / rakamlar','Özel sayılar / konum'];
const signalType=q=>q.type===5?q.proof.params.baseType:q.type;
const signalRequired=q=>['contrast','mixed','transfer','review'].includes(q.practiceStage);
const planCount=pool=>Math.max(4,pool.length);
const checklist=['Geçişleri numaralandır → dönüşümlü işlemleri karşılaştır → tüm geçişlerde doğrula.','Tek–çift / üçlü konumları ayır → grup içindeki ilişkiyi kur → diğer grupta denetle.','Birinci farkları yaz → farkın farkını veya özel yapısını incele → geri yerine koy.','Son iki / üç terimi ve rakam işlemlerini dene → en az iki yeni terimde doğrula.','Sıra numarası, kare, kuvvet, asal ve faktöriyel yapılarını karşılaştır → katsayıyı denetle.'];
const key=(id,level)=>id+'@'+level;
const blank=()=>({rules:{},runs:[]});
const stat=(state,id,level)=>state.rules?.[key(id,level)]||{trials:[],focusReady:false,mixedReady:false,interval:0};
const independent=t=>t.correct&&!t.hinted;
const eligible=t=>['contrast','mixed','transfer','review'].includes(t.stage);
const pass=(trials,n=4)=>trials.length>=n&&trials.slice(-n).filter(independent).length>=Math.ceil(n*.75);
const median=arr=>{let a=arr.slice().sort((a,b)=>a-b);return a.length?a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2:null;};
function choose(state,level=2,requested=null,now=Date.now()){
 const rows=catalog.slice().sort((a,b)=>a.variant-b.variant||a.type-b.type).map(r=>({r,s:stat(state,r.id,level)}));let target,kind='learn',reason;
 if(requested&&byId(requested)){target=byId(requested);let s=stat(state,target.id,level);kind=s.mixedReady?'review':'learn';reason='Seçtiğin kuralla çalışacaksın.';}
 else{let due=rows.filter(x=>x.s.nextDue&&x.s.nextDue<=now).sort((a,b)=>a.s.nextDue-b.s.nextDue)[0],weak=rows.filter(x=>x.s.trials.length&&!x.s.mixedReady&&(!x.s.nextDue||x.s.nextDue<=now)).sort((a,b)=>{const accuracy=x=>x.s.trials.slice(-8).filter(independent).length/Math.min(8,x.s.trials.length);return accuracy(a)-accuracy(b)||Number(a.s.focusReady)-Number(b.s.focusReady)||a.s.trials.length-b.s.trials.length;})[0];if(due){target=due.r;kind='review';reason='Bu kuralın aralıklı tekrar zamanı geldi.';}else if(weak){target=weak.r;reason='Bu kuralı karışık sorularda biraz daha pekiştireceğiz.';}else{target=(rows.find(x=>!x.s.trials.length)||rows.sort((a,b)=>(a.s.lastAt||0)-(b.s.lastAt||0))[0]).r;reason=rows.some(x=>x.s.trials.length)?'Öğrenilmiş kurallara yenisini kontrollü olarak ekleyeceğiz.':'İlk kuralı öğrenerek başlayacağız; ardından benzeriyle karşılaştıracağız.';}}
 const preferred=byId(`num-${target.type}-${target.variant%2===0?target.variant+1:target.variant-1}`),known=rows.filter(x=>x.r.id!==target.id&&x.s.focusReady).map(x=>x.r),confused=stat(state,target.id,level).trials.filter(t=>t.signalCorrect===false&&!t.correct).slice(-8),frequent=confused.reduce((m,t)=>(m[t.signal]=(m[t.signal]||0)+1,m),{}),wrongType=Object.keys(frequent).sort((a,b)=>frequent[b]-frequent[a])[0],partner=known.find(r=>r.type===Number(wrongType))||known.find(r=>r.id===preferred.id)||preferred;
 let pool=[target,partner,...known.filter(r=>r.id!==partner.id).sort((a,b)=>{let x=stat(state,a.id,level),y=stat(state,b.id,level);return Number(x.mixedReady)-Number(y.mixedReady)||(x.lastAt||0)-(y.lastAt||0);})].slice(0,8).map(x=>x.id);pool=[...new Set(pool)];
 return {target:target.id,partner:partner.id,pool,level,kind,reason,stage:kind==='review'&&stat(state,target.id,level).focusReady?'review':stat(state,target.id,level).focusReady?'contrast':'focus',finishReason:null,blockNo:0,recorded:[],exampleIds:[]};
}
function order(ids,count,stage){let values=Array.from({length:count},(_,i)=>ids[i%ids.length]);if(['contrast','mixed','transfer','review'].includes(stage)){for(let i=values.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}}return values;}
function record(state,trial){state.rules=state.rules||{};let k=key(trial.ruleId,trial.level),s=state.rules[k]||{trials:[],focusReady:false,mixedReady:false,interval:0};s.trials.push({...trial});s.trials=s.trials.slice(-60);s.lastAt=trial.at;s.focusReady=s.focusReady||pass(s.trials);if(s.trials.length>=4&&s.trials.slice(-4).filter(independent).length<=1)s.focusReady=false;state.rules[k]=s;return s;}
function next(meta,trials){const group=trials.filter(t=>t.stage===meta.stage),ok=pass(group,['mixed','transfer'].includes(meta.stage)?Math.max(4,group.length):4);if(meta.stage==='focus'){
 if(ok){meta.stage='contrast';return {stage:'contrast',ids:[meta.target,meta.partner],count:4,lesson:true};}
 if(group.length<8)return {stage:'focus',ids:[meta.target],count:2,lesson:false,repair:true};
 meta.finishReason='focus';return null;
 }
 if(meta.stage==='contrast'){
 if(ok){meta.stage='mixed';return {stage:'mixed',ids:meta.pool,count:planCount(meta.pool),lesson:false};}
 if(group.length<8)return {stage:'contrast',ids:[meta.target,meta.partner],count:2,lesson:false,repair:true};
 meta.finishReason='contrast';return null;
 }
 if(meta.stage==='review'){
 if(ok){meta.stage='mixed';return {stage:'mixed',ids:meta.pool,count:planCount(meta.pool),lesson:false};}
 meta.stage='focus';return {stage:'focus',ids:[meta.target],count:4,lesson:true,repair:true};
 }
 if(meta.stage==='mixed'&&ok){meta.stage='transfer';return {stage:'transfer',ids:meta.pool,count:planCount(meta.pool),lesson:false};}
 meta.finishReason=ok?'complete':meta.stage;return null;
}
function finish(state,meta,trials,now=Date.now()){
 const result={kind:meta.kind,target:meta.target,reason:meta.finishReason||'partial',at:now,level:meta.level,stages:{},due:[]};
 for(const stage of ['focus','contrast','review','mixed','transfer']){let rows=trials.filter(t=>t.stage===stage);if(rows.length)result.stages[stage]={total:rows.length,correct:rows.filter(t=>t.correct).length,independent:rows.filter(independent).length,seconds:median(rows.filter(independent).map(t=>t.sec)),signals:rows.filter(t=>t.signal!==undefined).length,signalRight:rows.filter(t=>t.signalCorrect===true).length,signalSeconds:median(rows.filter(t=>t.signalCorrect===true).map(t=>t.signalSec))};}
 const completed=meta.finishReason==='complete';for(const id of new Set(trials.map(t=>t.ruleId))){let s=stat(state,id,meta.level),uncued=s.trials.filter(eligible),thisRows=trials.filter(t=>t.ruleId===id&&eligible(t));if(!thisRows.length)continue;
 if(completed&&pass(uncued)&&thisRows.some(t=>t.stage==='transfer'&&independent(t))){s.mixedReady=true;s.transferReady=true;let alreadyScheduled=s.nextDue&&s.nextDue>now;if(!alreadyScheduled){if(meta.kind==='review'&&s.nextDue&&s.nextDue<=now)s.interval=Math.min(2,(s.interval||0)+1);s.nextDue=now+[1,3,7][s.interval||0]*DAY;s.lastSuccessfulReview=now;}}
 else if(!completed&&thisRows.filter(t=>!independent(t)).length>=2){s.mixedReady=false;s.transferReady=false;s.interval=0;s.nextDue=now+DAY;}
 if(s.nextDue)result.due.push({id,at:s.nextDue});state.rules[key(id,meta.level)]=s;
 }
 if(['focus','contrast'].includes(meta.finishReason)){let s=stat(state,meta.target,meta.level);s.nextDue=now+DAY;state.rules[key(meta.target,meta.level)]=s;if(!result.due.some(x=>x.id===meta.target))result.due.push({id:meta.target,at:s.nextDue});}
 state.runs=state.runs||[];state.runs.push(result);state.runs=state.runs.slice(-100);return result;
}
function goal(state,q){if(!['mixed','transfer','review'].includes(q.practiceStage))return null;let s=stat(state,q.ruleId,q.level),task=taskKind(q),rows=s.trials.filter(t=>t.policyVersion===2&&['mixed','transfer','review'].includes(t.stage)&&t.task===task),recent=rows.slice(-8);if(recent.length<5||recent.filter(independent).length/recent.length<.8)return null;let times=recent.filter(independent).map(t=>t.sec);if(times.length<5)return null;return Math.max(5,Math.round(median(times)*.9));}
function taskKind(q){return q.proof?.errorIndex!==null&&q.proof?.errorIndex!==undefined?'error':q.proof?.hole===q.proof?.full?.length-1?'end':'middle';}
const stageName={focus:'Kuralı pekiştir',contrast:'Benzerini ayırt et',review:'Aradan sonra hatırla',mixed:'Karışıkta tanı',transfer:'Yeni biçime aktar'};
root.Coach={familyNames,signalType,signalRequired,checklist,planCount,catalog,byId,key,blank,stat,choose,record,next,finish,goal,taskKind,stageName,pass,median,order,DAY};
})(typeof window==='undefined'?globalThis:window);
