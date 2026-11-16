import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../clinical.js';
const run=(x,s)=>{for(let i=0;i<s*10;i++)x.tick(.1);};
test('case 3: stability check reads stable, then unstable after deterioration, and scores the reassessment',()=>{
 const x=new Simulation(3,'guided');x.action('pulse');x.action('monitor');x.action('stability');
 assert.match(x.events.at(-2).text+x.events.at(-1).text,/Unstable signs: none/);
 run(x,152);assert.equal(x.s.unstable,true);x.action('stability');
 const t=x.events.filter(e=>e.action==='stability-result').at(-1).text;assert.match(t,/hypotension/);assert.match(t,/altered consciousness/);assert.match(t,/chest pain/);assert.match(t,/synchronized cardioversion/);
 assert.ok(x.awarded.has('reassess'));});
test('case 3: the second synchronized shock restores sinus rhythm and a stable blood pressure at once',()=>{
 const x=new Simulation(3,'guided');x.action('pulse');x.action('monitor');run(x,152);x.action('pads');
 x.action('charge',{energy:100,sync:true});run(x,4);x.action('clear');x.action('shock');assert.equal(x.s.rhythm,'SVT');x.action('pulse');
 x.action('charge',{energy:200,sync:true});run(x,4);x.action('clear');x.action('shock');
 assert.equal(x.s.rhythm,'NSR');assert.deepEqual(x.s.bp,[108,68]);assert.equal(x.s.conscious,true);x.action('pulse');assert.equal(x.s.rosc,true);});
test('case 4: the stability check finds an unstable bradycardia; no stability question in cardiac arrest',()=>{
 const x=new Simulation(4,'guided');x.action('stability');assert.match(x.events.filter(e=>e.action==='stability-result').at(-1).text,/UNSTABLE → atropine/);assert.ok(x.awarded.has('assess'));
 const y=new Simulation(1,'guided');assert.equal(y.action('stability'),false);});
