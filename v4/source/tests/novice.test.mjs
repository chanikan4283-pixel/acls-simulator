// "Medical student who doesn't know the game": common wrong turns must give feedback and still allow a path to ROSC / completion.
import test from 'node:test';import assert from 'node:assert/strict';import {Simulation} from '../clinical.js';
const adv=(x,n)=>{for(let i=0;i<n;i++)x.tick(1);};
const check=x=>{if(x.s.cpr)x.action('cpr');x.action('rhythm-check');};
const shock=(x,{energy=200,sync=false}={})=>{x.action('charge',{energy,sync});adv(x,3);x.action('clear');return x.action('shock');};
const keys=x=>x.s.errors.map(e=>e.key);
const finishPost=(x,t={spo2:94,map:70,co2:40,temp:36,hours:36})=>{x.action('commands');return x.action('post',t);};

test('case 1 novice: late CPR, SYNC on VF, early epi, early amiodarone, calcium without reason — still reaches ROSC',()=>{
 const x=new Simulation(1);adv(x,25);x.action('cpr');assert.ok(keys(x).includes('cpr-delay'));
 x.action('pads');assert.equal(x.s.monitor,true);assert.equal(shock(x,{sync:true}),false);assert.ok(keys(x).includes('sync-arrest'));
 x.action('insert-io');assert.equal(shock(x),true);x.action('cpr');adv(x,10);
 assert.equal(x.med('epinephrine',1,'mg'),false);assert.ok(keys(x).includes('epi-sequence'));
 adv(x,110);check(x);assert.equal(shock(x),true);x.action('cpr');assert.equal(x.med('amiodarone',300,'mg'),false);assert.ok(keys(x).includes('anti-indication'));
 assert.equal(x.med('epinephrine',1,'mg','IV'),true);// IO only → auto IO
 assert.equal(x.med('calcium-gluconate',20,'mL'),false);assert.ok(keys(x).includes('target-indication'));
 x.action('labs',{tests:['elyte']});adv(x,120);check(x);assert.equal(shock(x),true);x.action('cpr');assert.equal(x.med('amiodarone',300,'mg'),true);
 assert.equal(x.med('calcium-gluconate',20,'mL'),true);adv(x,10);assert.equal(x.s.rosc,false);check(x);assert.equal(x.s.rosc,true);
 x.action('repeat-k');x.action('dialysis');assert.equal(finishPost(x),true);
});
test('case 1 novice who never treats potassium is told what is missing and can record the cause instead',()=>{
 const x=new Simulation(1);x.action('pulse');x.action('cpr');x.action('pads');x.action('iv');shock(x);x.action('cpr');adv(x,120);check(x);shock(x);x.action('cpr');x.med('epinephrine',1,'mg');adv(x,120);check(x);
 assert.ok(x.events.some(e=>e.action==='rosc-coach'&&/reversible cause/.test(e.text)));shock(x);x.action('cpr');x.med('lidocaine',1,'mg/kg');x.action('history');x.action('cause',{value:'hyperk'});adv(x,10);check(x);assert.equal(x.s.rosc,true);
});
test('case 2 novice: shocks PEA, gives atropine, bicarbonate, dextrose before DTX — feedback, then ROSC',()=>{
 const x=new Simulation(2);x.action('pulse');x.action('cpr');x.action('pads');assert.equal(shock(x),false);assert.ok(keys(x).includes('nonshockable'));x.action('cpr');
 x.action('insert-iv');adv(x,20);assert.equal(x.med('atropine',1,'mg'),false);assert.ok(keys(x).includes('atropine-indication'));
 assert.equal(x.med('bicarb',50,'mEq'),false);assert.equal(x.med('dextrose',50,'mL'),false);assert.match(x.s.errors.at(-1).text,/glucose/i);
 x.med('epinephrine',1,'mg');x.action('labs',{tests:['dtx','abg']});adv(x,15);assert.equal(x.med('dextrose',50,'mL'),true);adv(x,75);check(x);assert.ok(x.events.some(e=>e.action==='rosc-coach'&&/fluid/.test(e.text)));
 x.action('cpr');x.action('fluid-bolus',{ml:1000});adv(x,10);check(x);assert.equal(x.s.rosc,true);assert.equal(finishPost(x),true);
});
test('case 2 novice who delays epinephrine sees asystole but the same treatment still works',()=>{
 const x=new Simulation(2);x.action('pulse');x.action('cpr');x.action('monitor');adv(x,155);assert.equal(x.s.rhythm,'ASYSTOLE');x.action('iv');x.action('flatline');x.med('epinephrine',1,'mg');x.action('labs',{tests:['dtx']});adv(x,15);x.med('dextrose',50,'mL');x.action('fluid-bolus',{ml:500});adv(x,10);check(x);assert.equal(x.s.rosc,true);
});
test('case 3 novice: CPR on a conscious patient, adenosine 12 first, IO adenosine, unsync shock — feedback; stable cardioversion after adenosine works',()=>{
 const x=new Simulation(3);x.action('cpr');assert.ok(keys(x).includes('cpr-pulse'));x.action('pulse');x.action('monitor');x.action('insert-io');adv(x,10);
 assert.equal(x.med('adenosine',6,'mg','IO'),false);x.action('insert-iv');adv(x,20);assert.equal(x.med('adenosine',12,'mg'),false);assert.ok(keys(x).includes('adenosine-dose'));
 x.action('pads');assert.equal(shock(x,{energy:200,sync:false}),false);assert.ok(keys(x).includes('shock-pulse'));
 x.med('adenosine',6,'mg');adv(x,2);x.med('adenosine',12,'mg');adv(x,2);x.action('sedate');assert.equal(shock(x,{energy:100,sync:true}),true);assert.equal(shock(x,{energy:150,sync:true}),false);x.action('pulse');assert.equal(shock(x,{energy:150,sync:true}),true);assert.equal(x.action('post',{}),false);x.action('pulse');assert.equal(x.s.rosc,true);assert.equal(x.action('post',{}),true);
});
test('case 3 novice who waits: becomes unstable at 150 s; AV-nodal blocker refused; synchronized 100 J converts',()=>{
 const x=new Simulation(3);x.action('pulse');x.action('monitor');x.action('iv');adv(x,150);assert.equal(x.s.unstable,true);assert.equal(x.med('diltiazem',20,'mg'),false);x.action('pads');assert.equal(shock(x,{energy:50,sync:true}),false);assert.equal(shock(x,{energy:100,sync:true}),true);x.action('pulse');assert.equal(shock(x,{energy:200,sync:true}),true);x.action('pulse');assert.equal(x.s.rosc,true);
});
test('case 4 novice: epinephrine bolus, CPR, atropine 0.5 mg, pacing without pads — feedback; dopamine path completes',()=>{
 const x=new Simulation(4);x.action('pulse');x.action('cpr');x.action('iv');assert.equal(x.med('epinephrine',1,'mg'),false);assert.ok(keys(x).includes('epi-bolus'));assert.equal(x.med('atropine',0.5,'mg'),false);
 assert.equal(x.action('pacer',{rate:70,ma:80}),false);assert.ok(keys(x).includes('pacer-pads'));
 assert.equal(x.action('post',{}),false);x.med('dopamine',10,'mcg/kg/min');assert.equal(x.action('post',{}),false);assert.match(x.s.errors.at(-1).text,/cath/);x.action('cath');assert.equal(x.action('post',{}),true);
});
test('case 4 novice paces straight at 120 mA: capture confirmed, margin satisfied, pain without sedation is flagged',()=>{
 const x=new Simulation(4);x.action('pulse');x.action('pads');x.action('pacer',{rate:70,ma:120});adv(x,2);assert.ok(keys(x).includes('pacing-pain'));x.action('pulse');assert.equal(x.s.pacingDone,true);x.action('cath');assert.equal(x.action('post',{}),true);
});
test('case 5 novice: atropine and pacing for the heart block, misses ventilation; arrest needs CPR, epi, BVM, patch and naloxone',()=>{
 const x=new Simulation(5);x.action('pulse');x.action('monitor');x.action('iv');x.med('atropine',1,'mg');x.action('pads');x.action('pacer',{rate:70,ma:80});
 assert.equal(x.med('naloxone',0.4,'mg'),false);assert.ok(keys(x).includes('vent-first'));adv(x,90);assert.equal(x.s.pulse,false);
 assert.equal(x.action('pacer',{rate:70,ma:80}),false);x.action('pulse');x.action('cpr');x.med('epinephrine',1,'mg');adv(x,110);check(x);
 assert.ok(x.events.some(e=>e.action==='rosc-coach'&&/naloxone|ventilation|cause/.test(e.text)));
 x.action('cpr');x.action('bvm');x.action('patch');x.med('naloxone',2,'mg');adv(x,40);check(x);assert.equal(x.s.rosc,true);
 x.action('infusion');assert.equal(finishPost(x),false);assert.match(x.s.errors.at(-1).text,/longer|breathing/i);adv(x,36);assert.equal(x.s.renarc,true);x.med('naloxone',0.4,'mg');assert.equal(finishPost(x),true);
});
