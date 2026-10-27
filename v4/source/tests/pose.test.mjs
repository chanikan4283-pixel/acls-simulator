import test from 'node:test';import assert from 'node:assert/strict';import {smoothValue,NECK} from '../pose.js';import {teamMotion} from '../team-motion.js';
test('neck overlaps lower face and torso instead of leaving a detached gap',()=>{assert.ok(NECK.top>NECK.headBase);assert.ok(NECK.bottom<.39);});
test('pose smoothing is frame-rate independent and does not overshoot or move during pause',()=>{let a=0,b=0;for(let i=0;i<60;i++)a=smoothValue(a,1,1/60);for(let i=0;i<30;i++)b=smoothValue(b,1,1/30);assert.ok(Math.abs(a-b)<1e-12);assert.ok(a<1&&a>.99);assert.equal(smoothValue(a,0,0),a);});
test('unventilated pulseless patient never has decorative breathing',()=>{for(let t=0;t<10;t+=.1)assert.equal(teamMotion({t,pulse:false,bvm:false,rr:14}).breath,0);});
import {procedureBlend} from '../pose.js';
test('procedure transition is bounded and ends without changing clinical time',()=>{assert.equal(procedureBlend(-1),0);assert.equal(procedureBlend(0),0);assert.equal(procedureBlend(.4),.5);assert.equal(procedureBlend(.8),1);assert.equal(procedureBlend(10),1);});
import {BVM_ANCHORS} from '../pose.js';
test('both seal hands remain within8cm of mask and bag assistant targets a distinct point',()=>{const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));for(const hand of [BVM_ANCHORS.leftHand,BVM_ANCHORS.rightHand])assert.ok(distance(hand,BVM_ANCHORS.mask)<.08);assert.ok(distance(BVM_ANCHORS.bagHand,BVM_ANCHORS.mask)>.2);assert.notDeepEqual(BVM_ANCHORS.leftHand,BVM_ANCHORS.rightHand);});
