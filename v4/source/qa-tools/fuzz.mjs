import {Simulation,LAB_TESTS} from '/home/claude/v4/clinical.js';
let seed=1;const R=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const pick=a=>a[Math.floor(R()*a.length)];
const ACTS=['auscultate','bvm','cath','charge','clear','commands','cpr','cpr-coached','decompress','dialysis','drain','ecg12','eeg','etco2','exam','flatline','fluid-bolus','hint','history','infusion','insert-io','insert-iv','intubate','labs','monitor','naloxone','oxygen','pacer','pads','patch','pocus','post','post-glucose','pulse','repeat-k','resume-cpr','rhythm-check','sedate','shock','stability','switch','temp','vagal','cause','rhythm-answer','flatline-step'];
const MEDS=[['epinephrine',1,'mg'],['amiodarone',300,'mg'],['amiodarone',150,'mg'],['lidocaine',100,'mg'],['atropine',1,'mg'],['adenosine',6,'mg'],['adenosine',12,'mg'],['dextrose',50,'mL'],['naloxone',0.4,'mg'],['calcium-gluconate',30,'mL'],['bicarb',50,'mEq'],['dopamine',5,'mcg/kg/min'],['epinephrine',5,'mcg/min'],['verapamil',5,'mg'],['magnesium',2,'g']];
const data=a=>a==='charge'?{energy:pick([50,100,120,200,360]),sync:R()<.4}:a==='labs'?{tests:[pick(Object.keys(LAB_TESTS))]}:a==='pacer'?{rate:pick([60,70,80]),ma:pick([0,30,60,66,90])}:a==='post'?{spo2:pick([0,94,100]),map:pick([55,65]),co2:40,temp:pick([0,36]),hours:pick([0,36])}:a==='cause'?{value:pick(['hyperk','metabolic','toxin','coronary','hypoxia','svt'])}:a==='rhythm-answer'?{value:pick(['shockable','pea','asystole','brady','narrow','organized','sinus'])}:a==='flatline-step'?{step:pick(['cable','gain','lead','x'])}:a==='fluid-bolus'?{ml:pick([250,500,1000])}:a==='vagal'?{type:pick(['valsalva','carotid'])}:a==='pocus'?{view:pick(['cardiac','lung'])}:{};
const problems={};const note=(k,d)=>{(problems[k]??=[]).length<3&&problems[k].push(d);};
let runs=0,ended=0,rosc=0;
for(let id=1;id<=5;id++)for(let n=0;n<400;n++){seed=id*100000+n;const x=new Simulation(id,'guided');const trail=[];runs++;
 try{for(let k=0;k<160&&!x.s.ended;k++){
   if(R()<.3){const m=pick(MEDS);trail.push('med:'+m[0]);const r=x.med(m[0],m[1],m[2],pick(['IV','IO','IM']));}
   else{const a=pick(ACTS);trail.push(a);x.action(a,data(a));}
   const dt=pick([0,1,3,8,20]);for(let i=0;i<dt*10;i++)x.tick(.1);
   const s=x.s;
   for(const f of ['t','hr','score','etco2','cprRate','cprDepth','spo2'])if(s[f]!=null&&!Number.isFinite(s[f]))note('nonfinite:'+f,trail.slice(-4).join('>'));
   if(s.bp.some(v=>!Number.isFinite(v)||v<0))note('bp',JSON.stringify(s.bp));
   if(s.score<0||s.score>100)note('score-range',s.score);
   if(s.pulse&&s.cpr)note('cpr-with-pulse',id+':'+trail.slice(-3).join('>'));
   if(s.rosc&&!s.pulse&&!s.renarc&&id!==5)note('rosc-no-pulse',id+':'+trail.slice(-3).join('>'));
   if(!s.pulse&&s.conscious)note('conscious-in-arrest',id+':'+trail.slice(-3).join('>'));
   if(s.pulse&&s.rhythm==='ASYSTOLE')note('pulse-asystole',id);
   if(!s.pulse&&s.rhythm==='NSR')note('nsr-no-pulse',id+':'+trail.slice(-3).join('>'));
   if(s.pulse&&['VF','PEA'].includes(s.rhythm))note('pulse-with-'+s.rhythm,id+':'+trail.slice(-3).join('>'));
   const e=x.events.at(-1);if(e&&(/undefined|NaN|\[object/.test(e.text)))note('bad-text',e.text.slice(0,120));
   if(s.pacing&&!s.pulse)note('pacing-in-arrest',id+':'+trail.slice(-3).join('>'));
 }}catch(err){note('EXCEPTION',id+': '+err.message+' @ '+trail.slice(-3).join('>'));}
 if(x.s.ended)ended++;if(x.s.rosc)rosc++;}
console.log('runs',runs,'ended',ended,'rosc',rosc);for(const k in problems)console.log(k,problems[k]);
