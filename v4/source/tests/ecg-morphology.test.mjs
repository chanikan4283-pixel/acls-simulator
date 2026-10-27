import test from 'node:test';import assert from 'node:assert/strict';import {waveform,afBeatTimes} from '../ecg.js';import {RHYTHMS} from '../clinical.js';
const width=(r,hr,center=.3)=>{let n=0;for(let t=center-.05;t<center+.05;t+=.0005)if(waveform(t,r,hr)>.5)n++;return n*.0005;};
test('narrow QRS width stays constant as rate rises rather than shrinking with RR',()=>{assert.ok(Math.abs(width('NSR',75)-width('SVT',190))<.003);assert.ok(width('SVT',190)<.03);});
test('AF has variable RR and fixed sharp ventricular morphology',()=>{const beats=afBeatTimes(0,10,110),rr=beats.slice(1).map((t,i)=>t-beats[i]);assert.ok(Math.max(...rr)-Math.min(...rr)>.3);for(const t of beats){assert.ok(waveform(t,'AF',110)>.9);assert.ok(waveform(t,'AF',110)-waveform(t-.04,'AF',110)>.6);}});
test('paced capture has a visible narrow stimulus before each broad QRS',()=>{for(let n=0;n<5;n++){const q=.3+n*60/70;assert.ok(waveform(q-.085,'PACED',70)>1.4);assert.ok(waveform(q,'PACED',70)>.8);assert.ok(waveform(q+.025,'PACED',70)>.5);}assert.ok(width('PACED',70)>width('NSR',75)*2);});
test('no-capture spikes are not followed by ventricular complexes at pacing rate',()=>{let uncaptured=0;for(let n=0;n<8;n++){const spike=.24+n*60/70;if(Math.abs(waveform(spike+.085,'PACED_NO_CAPTURE',32))<.2)uncaptured++;}assert.ok(uncaptured>=5);});
test('PEA removed only from visual recognition deck, flatline stays near baseline',()=>{assert.equal(RHYTHMS.some(r=>r.id==='PEA'),false);for(let t=-2;t<5;t+=.01)assert.ok(Math.abs(waveform(t,'ASYSTOLE',0))<.01);});

import {displayRhythm} from '../ecg.js';
test('display shows noncapture pacing without changing the clinical intrinsic rhythm',()=>{const state={rhythm:'CHB',pacing:true,electricalCapture:false};assert.equal(displayRhythm(state),'PACED_NO_CAPTURE');assert.equal(state.rhythm,'CHB');assert.equal(displayRhythm({...state,pacing:false}),'CHB');assert.equal(displayRhythm({...state,rhythm:'PACED',electricalCapture:true}),'PACED');});
