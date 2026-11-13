import test from 'node:test';
import assert from 'node:assert/strict';
import {teamMotion,compressionDuration} from '../team-motion.js';
import {Simulation} from '../clinical.js';

test('30 compressions followed by two one-second inspirations, with no simultaneous compression',()=>{
 const compress=30*60/110;
 const state={cpr:true,bvm:true,cprRate:110,teamClock:compress-.01};
 assert.equal(teamMotion(state).compressing,true);
 assert.equal(teamMotion(state).breath,0);
 for(const offset of [.5,2.5]){
  const motion=teamMotion({...state,teamClock:compress+offset});
  assert.equal(motion.compressing,false);
  assert.equal(motion.compression,0);
  assert.ok(motion.breath>.99);
 }
 assert.equal(teamMotion({...state,teamClock:compress+4.01}).compressing,true);
});
test('advanced airway keeps continuous compressions and ventilation every six seconds',()=>{
 const s={cpr:true,bvm:true,intubated:true,teamClock:18,cprRate:110};
 for(const t of [.5,6.5,12.5]){const m=teamMotion({...s,t});assert.equal(m.compressing,true);assert.ok(m.breath>.99);}
 assert.equal(teamMotion({...s,t:3}).breath,0);
 assert.equal(teamMotion({...s,t:.5,clear:true}).breath,0);
});
test('CCF excludes ventilation pauses and is invariant to tick subdivision',()=>{
 const cycle=30*60/110+4,expected=cycle-4;
 assert.ok(Math.abs(compressionDuration(0,cycle,110,true)-expected)<1e-9);
 let sum=0;for(let t=0;t<40;t+=.1)sum+=compressionDuration(t,Math.min(40,t+.1),110,true);
 assert.ok(Math.abs(sum-compressionDuration(0,40,110,true))<1e-8);
 const x=new Simulation(2);x.s.cprRate=110;x.action('cpr');x.action('bvm');for(let t=0;t<cycle;t+=.1)x.tick(Math.min(.1,cycle-t));
 assert.ok(Math.abs(x.s.cprTime-expected)<1e-8);
 x.s.paused=true;const before=x.s.teamClock;x.tick(10);assert.equal(x.s.teamClock,before);
});


test('default CPR uses a deliberate 100/min cadence and completes 30:2 correctly',()=>{
 const x=new Simulation(2);assert.equal(x.s.cprRate,100);
 x.action('cpr');x.action('bvm');
 const compressionSeconds=30*60/100,cycle=compressionSeconds+4;
 for(let t=0;t<cycle;t+=.1)x.tick(Math.min(.1,cycle-t));
 assert.ok(Math.abs(x.s.cprTime-compressionSeconds)<1e-8);
 assert.equal(teamMotion({...x.s,teamClock:compressionSeconds+1}).compressing,false);
});

test('each 30:2 cycle restarts at full recoil, including repeated cycles at 105/min',()=>{
 const rate=105,cycle=30*60/rate+4;
 for(let n=0;n<5;n++){
  const state={cpr:true,bvm:true,cprRate:rate,teamClock:n*cycle};
  assert.ok(teamMotion(state).compression<1e-8);
  assert.ok(Math.abs(teamMotion({...state,teamClock:n*cycle+30/rate}).compression-1)<1e-8);
 }
});
test('one minute of continuous 105/min CPR has 105 compression peaks and complete recoil',()=>{
 const rate=105;
 for(let n=0;n<105;n++){
  const at=t=>teamMotion({cpr:true,intubated:true,cprRate:rate,teamClock:t}).compression;
  assert.ok(at(n*60/rate)<1e-8);
  assert.ok(Math.abs(at((n+.5)*60/rate)-1)<1e-8);
 }
});
