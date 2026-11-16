import test from 'node:test';import assert from 'node:assert/strict';import {Simulation} from '../clinical.js';
const advance=(s,n)=>{for(let i=0;i<n;i++)s.tick(1);};
const check=x=>{if(x.s.cpr)x.action('cpr');x.action('rhythm-check');};
const base=id=>{const x=new Simulation(id);x.action('pulse');x.action('monitor');x.action('iv');return x;};
const shock=(x)=>{x.action('pads');x.action('charge',{energy:200,sync:false});advance(x,3);x.action('clear');if(x.s.shocks)x.action('rhythm-check');assert.equal(x.action('shock'),true);x.action('cpr');};
test('time starts without pulse check; repeat actions do not farm points',()=>{const x=new Simulation(1);advance(x,5);assert.equal(x.s.t,5);x.action('history');const p=x.s.score;x.action('history');assert.equal(x.s.score,p);});
test('non-shockable cannot be shocked and epinephrine is early with correct dose/route',()=>{const x=base(2);x.action('pads');x.action('charge',{energy:200});advance(x,3);x.action('clear');assert.equal(x.action('shock'),false);assert.equal(x.s.shocks,0);assert.equal(x.med('epinephrine',10,'mg'),false);assert.equal(x.med('epinephrine',1,'mg'),true);assert.equal(x.med('epinephrine',1,'mg'),false);advance(x,180);assert.equal(x.med('epinephrine',1,'mg'),true);});
test('shock requires pads, charge, hands-off; restarting CPR invalidates clear',()=>{const x=base(1);assert.equal(x.action('charge'),false);x.action('pads');x.action('cpr');x.action('charge',{energy:200});advance(x,3);assert.equal(x.action('shock'),false);x.action('clear');x.action('cpr');assert.equal(x.action('shock'),false);x.action('clear');assert.equal(x.action('shock'),true);assert.equal(x.s.rhythm,'VT');});
test('case 1 completes with lidocaine alternative; no calcium requirement',()=>{const x=base(1);x.action('cpr');shock(x);advance(x,120);shock(x);assert.equal(x.med('epinephrine',1,'mg'),true);advance(x,120);shock(x);assert.equal(x.med('lidocaine',1.2,'mg/kg'),true);x.action('history');x.action('cause',{value:'hyperk'});advance(x,10);assert.equal(x.s.rosc,false);assert.equal(x.s.roscReady,true);check(x);assert.equal(x.s.rosc,true);assert.equal(x.s.rhythm,'NSR');assert.equal(x.s.pulse,true);assert.equal(x.s.cpr,false);});
test('case 2 can recover without bicarbonate; calcium is not a hidden goal',()=>{const x=base(2);x.action('cpr');x.action('labs');advance(x,90);x.med('epinephrine',1,'mg');x.targeted('glucose');x.targeted('fluids');x.action('cause',{value:'metabolic'});advance(x,45);check(x);assert.equal(x.s.rosc,true);assert.equal(x.s.pulse,true);});
test('post ROSC: outdated 24 h is allowed but reviewed in the debrief without handover points; 2025 ranges score',()=>{const x=base(1);x.rosc();x.action('commands');x.action('repeat-k');x.action('dialysis');assert.equal(x.action('post',{spo2:94,map:65,co2:40,temp:36,hours:24}),true);assert.equal(x.s.ended,true);assert.equal(x.awarded.has('post'),false);assert.equal(x.s.postReview.find(i=>i.k==='Duration').ok,false);assert.equal(x.s.errors.at(-1).key,'post-targets');const y=base(1);y.rosc();y.action('commands');y.action('repeat-k');y.action('dialysis');assert.equal(y.action('post',{spo2:90,map:65,co2:40,temp:36,hours:36}),true);assert.equal(y.awarded.has('post'),true);});
test('SVT requires reassessment; unsafe cardioversion not allowed while stable; two synchronized shocks with a pulse check after each',()=>{const x=base(3);x.action('pads');x.action('charge',{energy:100,sync:true});advance(x,3);x.action('clear');assert.equal(x.action('shock'),false);advance(x,150);assert.equal(x.s.unstable,true);assert.equal(x.action('shock'),true);assert.equal(x.s.rhythm,'SVT');x.action('charge',{energy:150,sync:true});advance(x,3);x.action('clear');assert.equal(x.action('shock'),false);assert.equal(x.s.errors.at(-1).key,'cv-check');x.action('pulse');x.action('charge',{energy:100,sync:true});advance(x,3);x.action('clear');assert.equal(x.action('shock'),false);assert.equal(x.s.errors.at(-1).key,'cv-escalate');x.action('charge',{energy:150,sync:true});advance(x,3);x.action('clear');assert.equal(x.action('shock'),true);assert.equal(x.s.rhythm,'NSR');assert.equal(x.s.rosc,false);x.action('pulse');assert.equal(x.s.rosc,true);assert.equal(x.action('post',{}),true);});
test('bradycardia pacing requires mechanical verification and expert care',()=>{const x=base(4);assert.equal(x.action('cpr'),false);x.action('pads');x.action('pacer',{rate:70,ma:90});assert.equal(x.s.electricalCapture,true);assert.equal(x.action('post'),false);x.action('pulse');x.action('cath');assert.equal(x.action('post'),true);});
test('bradycardia permits supported infusion alternative',()=>{const x=base(4);assert.equal(x.med('dopamine',10,'mcg/kg/min'),true);x.action('cath');assert.equal(x.action('post'),true);});
test('megacode: PEA arrest needs CPR, epinephrine, ventilation, patch removal and naloxone; ROSC shown at the rhythm check; then recurrent toxicity',()=>{const x=base(5);x.action('bvm');x.action('history');x.action('pads');x.action('pacer',{rate:70,ma:90});advance(x,90);assert.equal(x.s.pulse,false);assert.equal(x.s.rhythm,'PEA');x.action('pulse');x.action('cpr');x.med('epinephrine',1,'mg');x.action('patch');advance(x,50);check(x);assert.equal(x.s.rosc,false);x.action('cpr');x.action('naloxone');advance(x,50);assert.equal(x.s.rosc,false);check(x);assert.equal(x.s.rosc,true);advance(x,35);assert.equal(x.s.renarc,true);x.action('naloxone');x.action('infusion');x.action('commands');assert.equal(x.action('post',{spo2:94,map:65,co2:40,temp:36,hours:36}),true);});
test('pause freezes simulation; stop cancels events; new scenario is clean',()=>{const x=base(2);x.action('labs');x.s.paused=true;const t=x.s.t;advance(x,30);assert.equal(x.s.t,t);assert.equal(x.s.labs,false);x.s.paused=false;x.end();advance(x,30);assert.equal(x.s.labs,false);const y=new Simulation(1);assert.equal(y.s.epi,0);assert.equal(y.events.length,1);assert.equal(y.s.t,0);});
test('CCF denominator only counts cardiac arrest time',()=>{const x=base(4);advance(x,30);assert.equal(x.report().ccf,null);const y=base(2);y.action('cpr');advance(y,10);y.action('cpr');advance(y,10);assert.equal(y.report().ccf,50);});
test('pacing cannot start without pads or retain capture after lowering output',()=>{const x=base(4);assert.equal(x.action('pacer',{rate:70,ma:90}),false);x.action('pads');assert.equal(x.action('pacer',{rate:70,ma:NaN}),false);x.action('pacer',{rate:70,ma:90});x.action('pulse');assert.equal(x.s.checkedCapture,true);x.action('pacer',{rate:70,ma:20});assert.equal(x.s.mechanicalCapture,false);assert.equal(x.s.checkedCapture,false);assert.equal(x.s.rhythm,'CHB');assert.deepEqual(x.s.bp,x.c.bp);x.action('cath');assert.equal(x.action('post'),false);});
test('persistent shockable scenario rejects stacked shocks before a full CPR cycle',()=>{const x=base(1);shock(x);x.action('charge',{energy:200,sync:false});advance(x,3);x.action('clear');assert.equal(x.action('shock'),false);assert.equal(x.s.shocks,1);x.action('cpr');advance(x,120);x.action('clear');x.action('rhythm-check');assert.equal(x.action('shock'),true);assert.equal(x.s.shocks,2);});
test('later awards do not erase earlier protocol penalties',()=>{const x=base(2);x.med('epinephrine',10,'mg');x.action('history');const y=base(2);y.action('history');assert.equal(y.s.score-x.s.score,5);x.action('history');assert.equal(y.s.score-x.s.score,5);});
test('a proper rhythm check after two minutes does not block the next indicated shock',()=>{const x=base(1);shock(x);advance(x,120);x.action('cpr');x.action('rhythm-check');x.action('charge',{energy:200,sync:false});advance(x,3);x.action('clear');assert.equal(x.action('shock'),true);assert.equal(x.s.shocks,2);});
test('bradycardia support infusion cannot count as naloxone infusion planning',()=>{const x=base(5);assert.equal(x.med('dopamine',10,'mcg/kg/min'),true);assert.equal(x.s.bradyInfusion,true);assert.equal(x.s.infusion,false);assert.equal(x.awarded.has('infusion'),false);});
test('megacode cannot skip the recurrent-toxicity phase by handing over early; intubation no longer causes a pneumothorax',()=>{const x=base(5);x.action('bvm');advance(x,90);x.action('cpr');x.med('epinephrine',1,'mg');x.action('patch');x.action('naloxone');advance(x,50);check(x);assert.equal(x.s.rosc,true);x.action('infusion');x.action('commands');const targets={spo2:94,map:65,co2:40,temp:36,hours:36};assert.equal(x.action('post',targets),false);advance(x,35);x.action('naloxone');x.action('intubate');advance(x,20);assert.equal(x.s.ptx,false);assert.equal(x.action('post',targets),true);});

test('vascular access is timed: IV 20 s, IO 10 s; with IO-only access drugs go via IO automatically (adenosine needs an IV)',()=>{
 const x=new Simulation(2);x.action('insert-iv');advance(x,19);assert.equal(x.s.iv,false);assert.equal(x.med('epinephrine',1,'mg'),false);advance(x,1);assert.equal(x.s.iv,true);assert.equal(x.s.access,'IV');
 const y=new Simulation(2);y.action('insert-io');advance(y,10);assert.equal(y.s.access,'IO');assert.equal(y.med('epinephrine',1,'mg','IV'),true);assert.match(y.events.at(-1).text,/IO/);
 const z=new Simulation(3);z.action('pulse');z.action('insert-io');advance(z,10);assert.equal(z.med('adenosine',6,'mg','IV'),false);assert.equal(z.s.errors.at(-1).key,'route-access');
});
test('fluid bolus counts as fluid therapy only in case 2 and needs access',()=>{
 const x=new Simulation(2);assert.equal(x.action('fluid-bolus',{ml:500}),false);x.action('iv');x.action('fluid-bolus',{ml:500});assert.equal(x.s.fluids,true);
 const y=new Simulation(1);y.action('iv');const sc=y.s.score;y.action('fluid-bolus',{ml:500});assert.equal(y.s.score,sc);assert.equal(y.s.errors.length,0);
});
test('initial CPR gets a 20 s window, later pauses keep the 10 s rule (real-time clock)',()=>{
 const x=new Simulation(1);advance(x,19);assert.equal(x.s.errors.length,0);x.action('cpr');advance(x,5);x.action('cpr');advance(x,10);assert.equal(x.s.errors.length,0);advance(x,1);assert.equal(x.s.errors.at(-1).key,'long-pause');
 const y=new Simulation(2);advance(y,21);assert.equal(y.s.errors.at(-1).key,'cpr-delay');assert.equal(y.s.errors.at(-1).points,3);
});
test('case 3 deteriorates after the failed adenosine trial or at 150 s',()=>{
 const x=base(3);x.action('vagal');x.med('adenosine',6,'mg');advance(x,5);x.med('adenosine',12,'mg');advance(x,9);assert.equal(x.s.unstable,false);advance(x,1);assert.equal(x.s.unstable,true);
 const y=base(3);advance(y,149);assert.equal(y.s.unstable,false);advance(y,1);assert.equal(y.s.unstable,true);
});
test('case 5 collapse restarts the recognition window and asks for reassessment',()=>{
 const x=base(5);advance(x,90);assert.equal(x.s.pulse,false);assert.equal(x.s.assessed,false);advance(x,15);assert.equal(x.s.errors.filter(e=>e.key==='long-pause'||e.key==='cpr-delay').length,0);
});
test('guided hints are case-specific',()=>{
 const x=base(3);assert.match(x.hint(),/vagal/i);const y=base(4);assert.match(y.hint(),/history|12-lead/i);const z=base(1);assert.match(z.hint(),/start compressions|CPR/i);
});
test('case 1: calcium after the history counts as treating the cause; ROSC needs epinephrine too and says what is missing',()=>{
 const x=new Simulation(1);x.action('pulse');x.action('monitor');x.action('pads');x.action('iv');x.action('cpr');
 const sh=(first)=>{if(!first){x.action('cpr');x.action('rhythm-check');}x.action('charge',{energy:200});advance(x,3);x.action('clear');assert.equal(x.action('shock'),true);x.action('cpr');};
 sh(true);advance(x,120);sh();advance(x,120);sh();
 assert.equal(x.targeted('calcium-gluconate'),false);assert.match(x.s.errors.at(-1).text,/history/);
 x.action('history');assert.equal(x.targeted('calcium-gluconate'),true);assert.equal(x.s.hyperkTreated,true);assert.equal(x.s.cause,true);
 assert.equal(x.med('amiodarone',300,'mg'),true);advance(x,20);assert.equal(x.s.rosc,false);
 assert.deepEqual(x.roscBlockers(),['epinephrine 1 mg']);x.action('cpr');x.action('rhythm-check');assert.match(x.events.at(-1).text,/epinephrine/);x.action('cpr');
 assert.equal(x.med('epinephrine',1,'mg'),true);advance(x,9);assert.equal(x.s.rosc,false);check(x);assert.equal(x.s.rosc,true);
});
test('case 2: treating documented hypoglycemia also counts as identifying the cause',()=>{
 const x=new Simulation(2);x.action('pulse');x.action('monitor');x.action('iv');x.action('cpr');assert.equal(x.targeted('glucose'),false);x.action('labs');advance(x,90);x.med('epinephrine',1,'mg');assert.equal(x.targeted('glucose'),true);x.action('fluid-bolus',{ml:500});advance(x,10);check(x);assert.equal(x.s.rosc,true);
});
test('compressor fatigue after 2 minutes lowers quality until a switch or coached CPR',()=>{
 const x=new Simulation(1);x.action('cpr');advance(x,119);assert.equal(x.s.fatigued,false);advance(x,1);assert.equal(x.s.fatigued,true);assert.ok(x.s.cprDepth<5);assert.equal(x.events.at(-1).action==='cpr-fatigue'||x.events.some(e=>e.action==='cpr-fatigue'),true);
 x.action('switch');assert.equal(x.s.fatigued,false);assert.ok(x.s.cprDepth>=5);advance(x,121);assert.equal(x.s.fatigued,true);x.action('cpr-coached');assert.equal(x.s.fatigued,false);
});
test('temperature check and selectable labs return case values',()=>{
 const x=new Simulation(2);x.action('temp');assert.equal(x.s.temp,38.9);x.action('labs',{tests:['tropt']});advance(x,90);assert.match(x.events.at(-1).text,/Troponin T/);assert.equal(x.s.labs,false);
});
test('ETCO2: about 5 with poor CPR, 10 or more with good CPR, abrupt rise with ROSC; capnography attaches to the bag-mask',()=>{
 const x=new Simulation(1);assert.equal(x.action('etco2'),false);x.action('bvm');x.action('intubate');x.action('etco2');assert.equal(x.s.capno,true);x.action('cpr');advance(x,5);assert.ok(x.s.etco2>=10);x.s.cprDepth=4.2;advance(x,2);assert.ok(x.s.etco2<8);x.rosc();advance(x,1);assert.ok(x.s.etco2>=35);
});
test('bicarbonate is a drug order: refused as routine, accepted for evidence of hyperkalemia; PEA can be named',()=>{
 const x=new Simulation(2);x.action('iv');assert.equal(x.med('bicarb',50,'mEq'),false);assert.equal(x.s.errors.at(-1).key,'routine-bicarb');
 const y=new Simulation(1);y.action('iv');y.action('history');assert.equal(y.med('bicarb',50,'mEq'),true);assert.equal(y.med('bicarb',500,'mEq'),false);
 const z=new Simulation(2);z.action('monitor');z.action('rhythm-check');z.action('rhythm-answer',{value:'pea'});assert.equal(z.s.rhythmAnswers.at(-1).correct,true);
 const w=new Simulation(2);w.action('history');assert.equal(w.action('cause',{value:'hypoglycemia'}),true);
});
test('vagal maneuver records its type; adenosine creates a transient monitor pause only',()=>{
 const x=new Simulation(3);x.action('pulse');x.action('monitor');x.action('vagal',{type:'carotid'});assert.deepEqual(x.s.vagalTypes,['carotid']);x.action('vagal',{type:'valsalva'});assert.equal(x.s.vagalTypes.length,2);
 x.action('iv');assert.equal(x.med('adenosine',6,'mg'),true);assert.equal(x.s.rhythm,'SVT');assert.ok(x.s.adenosinePause[0]>x.s.t);
});
test('ROSC is never announced mid-cycle: ETCO2 rises during CPR, pulse found only at the rhythm/pulse check',()=>{
 const x=new Simulation(2);x.action('pulse');x.action('iv');x.action('bvm');x.action('etco2');x.action('cpr');x.action('labs');advance(x,90);x.med('epinephrine',1,'mg');x.targeted('glucose');x.action('fluid-bolus',{ml:500});advance(x,20);
 assert.equal(x.s.pulse,false);assert.equal(x.events.some(e=>e.action==='stabilize'),false);assert.ok(x.s.etco2>=38);x.action('pulse');assert.equal(x.s.rosc,false);x.action('cpr');x.action('pulse');assert.equal(x.s.rosc,true);
});
test('case 4: atropine ×2 flags complete heart block; pacing needs mechanical capture and a 10 % margin before handover',()=>{
 const x=base(4);x.action('pads');x.med('atropine',1,'mg');assert.equal(x.events.at(-1).action==='medication'||x.events.some(e=>e.action==='atropine-fail'),true);advance(x,180);x.med('atropine',1,'mg');assert.ok(x.events.some(e=>e.action==='chb-alert'));
 x.action('pacer',{rate:70,ma:50});x.action('pulse');assert.equal(x.s.checkedCapture,false);x.action('pacer',{rate:70,ma:60});x.action('pulse');assert.equal(x.s.checkedCapture,true);assert.equal(x.s.pacingDone,false);x.action('cath');assert.equal(x.action('post',{}),false);assert.match(x.s.errors.at(-1).text,/10 %/);
 x.action('pacer',{rate:70,ma:70});assert.equal(x.s.pacingDone,true);assert.equal(x.action('post',{}),true);
});
test('new drug orders: calcium / insulin / dextrose / naloxone / AV-nodal blockers check indication and dose',()=>{
 const a=new Simulation(1);a.action('iv');assert.equal(a.med('calcium-gluconate',20,'mL'),false);assert.equal(a.s.errors.at(-1).points,0);a.action('history');assert.equal(a.med('calcium-gluconate',60,'mL'),false);assert.equal(a.med('calcium-gluconate',20,'mL'),true);assert.equal(a.s.hyperkTreated,true);
 const b=new Simulation(1);b.action('iv');b.action('history');assert.equal(b.med('insulin',10,'units'),true);assert.equal(b.med('dextrose',50,'mL'),true);
 const c=new Simulation(2);c.action('iv');assert.equal(c.med('dextrose',50,'mL'),false);c.action('labs',{tests:['dtx']});for(let i=0;i<15;i++)c.tick(1);assert.equal(c.med('dextrose',50,'mL'),true);assert.equal(c.s.glucose,true);
 const d=new Simulation(5);assert.equal(d.med('naloxone',0.4,'mg','IM'),false);d.action('bvm');assert.equal(d.med('naloxone',0.4,'mg','IM'),true);assert.equal(d.s.naloxone,true);assert.equal(d.med('naloxone',20,'mg','IM'),false);
 const e=new Simulation(3);e.action('pulse');e.action('iv');assert.equal(e.med('diltiazem',20,'mg'),true);assert.equal(e.s.rhythm,'SVT');e.s.unstable=true;assert.equal(e.med('metoprolol',5,'mg'),false);assert.equal(e.s.errors.at(-1).key,'avn-unstable');
 const f=new Simulation(4);f.action('patch');assert.equal(f.s.errors.length,0);assert.match(f.events.at(-1).text,/normal/);
});
test('stable SVT: cardioversion is refused before adenosine, allowed after adenosine fails; no sedation = pain',()=>{
 const x=base(3);x.action('pads');x.action('charge',{energy:100,sync:true});advance(x,3);x.action('clear');assert.equal(x.action('shock'),false);assert.equal(x.s.errors.at(-1).key,'cv-stable');
 x.med('adenosine',6,'mg');advance(x,2);x.med('adenosine',12,'mg');advance(x,2);assert.equal(x.s.unstable,false);x.action('charge',{energy:100,sync:true});advance(x,3);x.action('clear');assert.equal(x.action('shock'),true);x.action('pulse');x.action('charge',{energy:150,sync:true});advance(x,3);x.action('clear');assert.equal(x.action('shock'),true);x.action('pulse');assert.equal(x.s.rosc,true);assert.ok(x.s.errors.some(e=>e.key==='no-sedation'));
});
test('case 5: recurrent opioid effect does not trigger a breathing alarm when intubated',()=>{
 const x=base(5);x.action('bvm');advance(x,90);x.action('cpr');x.med('epinephrine',1,'mg');x.action('patch');x.action('naloxone');advance(x,50);x.action('cpr');x.action('rhythm-check');assert.equal(x.s.rosc,true);x.action('intubate');advance(x,36);assert.equal(x.s.renarc,false);assert.ok(x.events.some(e=>e.action==='renarc-vent'));x.action('infusion');x.action('commands');assert.equal(x.action('post',{spo2:94,map:65,co2:40,temp:36,hours:36}),true);
});
