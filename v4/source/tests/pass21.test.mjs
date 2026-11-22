import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation,CASES,RUBRICS,RHYTHMS} from '../clinical.js';
import {waveform} from '../ecg.js';
const run=(x,s)=>{for(let i=0;i<s*10;i++)x.tick(.1);};
test('tutorial case: the full VF path (2 shocks, epinephrine after the 2nd) reaches ROSC and 100',()=>{
 const c=CASES.find(c=>c.tutorial);assert.equal(c.id,6);assert.equal(CASES[c.id-1],c);assert.equal(Object.values(RUBRICS[6]).reduce((a,b)=>a+b,0),100);
 const x=new Simulation(6,'guided');x.action('pulse');x.action('cpr');x.action('monitor');x.action('pads');run(x,5);x.action('cpr');x.action('rhythm-check');x.action('rhythm-answer',{value:'shockable'});
 x.action('charge',{energy:200});run(x,3.2);x.action('clear');assert.equal(x.action('shock'),true);x.action('cpr');x.action('insert-io');x.action('history');run(x,118);
 x.action('charge',{energy:200});run(x,3.2);x.action('cpr');x.action('rhythm-check');assert.equal(x.s.rhythm,'VF');assert.equal(x.s.rosc,false);x.action('clear');x.action('shock');x.action('cpr');
 assert.equal(x.med('epinephrine',1,'mg','IO'),true);run(x,118);x.action('cpr');x.action('rhythm-check');assert.equal(x.s.rosc,true);
 x.action('pulse');x.action('commands');x.action('cause',{value:'coronary'});x.action('post',{spo2:94,map:65,co2:40,temp:36,hours:36});assert.equal(x.s.ended,true);assert.equal(x.s.score,100);assert.deepEqual(x.s.errors.map(e=>e.key),[]);});
test('tutorial case: a long pause is a gentle warning, not a penalty',()=>{const x=new Simulation(6,'guided');x.action('pulse');x.action('cpr');run(x,3);x.action('cpr');run(x,14);assert.equal(x.s.errors.length,0);assert.ok(x.events.some(e=>e.action==='long-pause-tutorial'));});
test('AF strip: no P waves — nothing P-sized and rounded in the 0.25 s before any QRS',()=>{
 const af=RHYTHMS.find(r=>r.id==='AF');let worst=0;const step=.002,peaks=[];let prev=-1,last=-9;
 for(let t=0;t<10;t+=step){const v=waveform(t,'AF',af.hr),n=waveform(t+step,'AF',af.hr);if(v>.55&&v>=prev&&v>n&&t-last>.22){peaks.push(t);last=t;}prev=v;}
 for(const r of peaks)for(let t=r-.25;t<r-.06;t+=step)worst=Math.max(worst,waveform(t,'AF',af.hr));assert.ok(worst<.12,`max pre-QRS deflection ${worst.toFixed(3)} mV`);});
test('shockable arrest: a tube before the 2nd shock gets a timing note (no penalty); after the 2nd shock it does not',()=>{
 const a=new Simulation(6,'guided');a.action('pulse');a.action('cpr');a.action('monitor');a.action('bvm');a.action('intubate');
 assert.ok(a.events.some(e=>e.action==='airway-early'));assert.equal(a.s.errors.length,0);
 const b=new Simulation(6,'guided');b.s.shocks=2;b.action('pulse');b.action('cpr');b.action('bvm');b.action('intubate');assert.ok(!b.events.some(e=>e.action==='airway-early'));});
