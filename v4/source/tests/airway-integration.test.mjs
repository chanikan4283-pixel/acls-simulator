import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../clinical.js';
import {AirwayProcedure} from '../procedure-flow.js';

// Exercise the presentation-to-clinical boundary with the real scenario engine.
// This complements the queue unit tests; it is not a browser replay.
for (const id of [1,2,3,4,5]) {
 test(`Case ${id}: airway animation does not establish capnography early or award twice`,()=>{
  const sim=new Simulation(id),queue=new AirwayProcedure();
  sim.action('bvm');queue.start(sim.s.session);
  const advance=dt=>{sim.tick(dt);if(queue.advance(dt,sim.s))sim.action('intubate');};
  advance(2);
  assert.equal(sim.s.intubated,false);assert.equal(sim.s.capno,false);
  const time=sim.s.t;sim.s.paused=true;advance(5);
  assert.equal(sim.s.t,time);assert.equal(sim.s.intubated,false);
  sim.s.paused=false;advance(2.9);
  assert.equal(sim.s.intubated,true);assert.equal(sim.s.capno,false);sim.action('etco2');assert.equal(sim.s.capno,true);
  const score=sim.s.score;advance(.1);assert.equal(sim.s.score,score);
  assert.equal(queue.snapshot(),null);
 });
}
test('ending the real simulation cancels pending airway completion',()=>{
 const sim=new Simulation(1),queue=new AirwayProcedure();sim.action('bvm');queue.start(sim.s.session);
 sim.end('stopped');assert.equal(queue.advance(10,sim.s),false);
 assert.equal(sim.s.intubated,false);assert.equal(sim.s.capno,false);
});
