import test from 'node:test';import assert from 'node:assert/strict';import {AirwayProcedure} from '../procedure-flow.js';
test('airway order completes once after animation and prevents duplicate orders',()=>{
 const q=new AirwayProcedure(),s={session:'a'};assert.equal(q.start('a'),true);assert.equal(q.start('a'),false);
 assert.equal(q.advance(1,s),false);assert.equal(q.snapshot().label,'Laryngoscopy');assert.equal(q.advance(1,s),false);assert.equal(q.snapshot().label,'Tube in · cuff up');assert.equal(q.advance(1.1,s),true);assert.equal(q.advance(5,s),false);assert.equal(q.snapshot(),null);
});
test('paused or clear scenes hold the procedure; ended or replaced sessions cancel it',()=>{
 const q=new AirwayProcedure();q.start('a');q.advance(20,{session:'a',paused:true});q.advance(20,{session:'a',clear:true});assert.equal(q.snapshot().progress,0);
 assert.equal(q.advance(20,{session:'b'}),false);assert.equal(q.snapshot(),null);q.start('b');assert.equal(q.advance(20,{session:'b',ended:true}),false);assert.equal(q.snapshot(),null);
});
