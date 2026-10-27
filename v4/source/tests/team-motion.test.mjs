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
 const x=new Simulation(2);x.action('cpr');x.action('bvm');for(let t=0;t<cycle;t+=.1)x.tick(Math.min(.1,cycle-t));
 assert.ok(Math.abs(x.s.cprTime-expected)<1e-8);
 x.s.paused=true;const before=x.s.teamClock;x.tick(10);assert.equal(x.s.teamClock,before);
});

