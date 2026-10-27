import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../clinical.js';
import {tapRate} from '../practice.js';
const ready=()=>{const x=new Simulation(1);x.action('monitor');x.action('pads');x.action('charge',{energy:200});x.tick(1);x.tick(1);x.tick(1);return x;};
test('resume CPR after safe shock starts immediately and repeated resume never pauses',()=>{const x=ready();x.action('clear');assert.equal(x.action('shock'),true);assert.equal(x.action('resume-cpr'),true);assert.equal(x.s.cpr,true);x.action('resume-cpr');assert.equal(x.s.cpr,true);assert.equal(x.s.clear,false);x.tick(1);x.tick(1);assert.ok(x.s.sinceShockCPR>=2);});
test('unsafe discharge ends attempt without awarding a clinical shock or leaving events active',()=>{const x=ready();x.action('cpr');assert.equal(x.action('unsafe-discharge'),true);assert.equal(x.s.ended,true);assert.equal(x.s.charged,false);assert.equal(x.s.shocks,0);const before=x.s.t;x.tick(30);assert.equal(x.s.t,before);const next=new Simulation(1);assert.equal(next.s.shocks,0);assert.equal(next.s.ended,false);});
test('safe, uncharged and paused states cannot enter unsafe-discharge branch',()=>{const x=new Simulation(1);assert.equal(x.action('unsafe-discharge'),false);const y=ready();y.action('clear');assert.equal(y.action('unsafe-discharge'),false);const z=ready();z.s.paused=true;assert.equal(z.action('unsafe-discharge'),false);assert.equal(z.s.ended,false);});
test('tap tempo is real time, zero interval guarded',()=>{assert.equal(tapRate(600),100);assert.equal(tapRate(500),120);assert.equal(tapRate(0),0);assert.ok(tapRate(450)>120);});

