import test from 'node:test';import assert from 'node:assert/strict';import {facialTargets} from '../pose.js';
test('family history response ends and never starts before history is requested',()=>{
 const state={history:true};let moved=false;
 for(let t=0;t<10;t+=.05){const p=facialTargets(state,'family',t,2);assert.ok(p.speaking>=0&&p.speaking<=.065);if(t<2||t>=8)assert.equal(p.speaking,0);else moved ||= p.speaking>0;}
 assert.ok(moved);assert.equal(facialTargets({history:false},'family',3,2).speaking,0);assert.equal(facialTargets(state,'family',3,null).speaking,0);
});
test('unresponsive patient has no talking expression and family concern eases after ROSC',()=>{
 assert.deepEqual(facialTargets({conscious:false,history:true},'patient',3,2),{concern:0,speaking:0});
 assert.ok(facialTargets({rosc:true},'family',0).concern<facialTargets({rosc:false},'family',0).concern);
 assert.ok(facialTargets({conscious:true,unstable:true},'patient',0).concern>facialTargets({conscious:true,unstable:false},'patient',0).concern);
});
test('reduced motion suppresses decorative speech without erasing clinical concern states',()=>{
 for(let t=0;t<8;t+=.1){
  const state={history:true,rosc:false};
  const normal=facialTargets(state,'family',t,0);
  const reduced=facialTargets(state,'family',t,0,true);
  assert.equal(reduced.speaking,0);assert.equal(reduced.concern,normal.concern);
 }
 assert.equal(facialTargets({conscious:true,unstable:true},'patient',2,null,true).concern,.85);
});
