import test from 'node:test';import assert from 'node:assert/strict';
import {personalFeedback,feedbackDomain} from '../feedback.js';
test('error keys map to coaching domains',()=>{assert.equal(feedbackDomain('long-pause'),'cpr');assert.equal(feedbackDomain('unsafe-discharge'),'rhythm');assert.equal(feedbackDomain('epi-dose'),'drugs');assert.equal(feedbackDomain('post-targets'),'post');assert.equal(feedbackDomain('pacing-pain'),'team');});
test('feedback quotes the learner\'s own numbers and ranks their costliest deviation first',()=>{
 const r={playerName:'Praew',completed:true,ccf:68,cprInTarget:90,firstCPR:12,firstShock:95,hints:0,rhythmAnswers:[{correct:true}],achieved:['cpr','shock'],errors:[{t:70,key:'long-pause',text:'Compressions interrupted for more than 10 seconds',points:3},{t:190,key:'long-pause',text:'Compressions interrupted for more than 10 seconds',points:3},{t:120,key:'epi-dose',text:'Epinephrine dose should be 1 mg',points:5}]};
 const f=personalFeedback(r,[['cause','Identify a cause',15],['cpr','Start CPR',10]]);
 assert.match(f.headline,/Praew/);assert.match(f.improve[0].text,/2 times, first at 1:10/);assert.equal(f.improve[0].domain,'cpr');
 assert.ok(f.strengths.some(t=>/12 s/.test(t)));assert.ok(f.strengths.some(t=>/1:35/.test(t)));
 assert.ok(f.improve.some(i=>/Identify a cause/.test(i.text)));assert.match(f.drill,/10 s/);
 assert.ok(f.domains.find(d=>d.key==='cpr').value<f.domains.find(d=>d.key==='team').value);
});
test('a clean run gets strengths and no invented priorities',()=>{const f=personalFeedback({playerName:'A',completed:true,ccf:92,cprInTarget:95,firstCPR:8,hints:0,rhythmAnswers:[],achieved:['post','cause'],errors:[]},[]);assert.equal(f.improve.length,0);assert.ok(f.strengths.length>=3);assert.match(f.headline,/clean run/);});
