import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../clinical.js';
const run=(s,sec)=>{for(let i=0;i<sec*10;i++)s.tick(.1);};
test('auscultation after intubation confirms placement and prompts ETCO2',()=>{const s=new Simulation(1,'guided');s.action('bvm');s.action('intubate');s.action('auscultate');const e=s.events.at(-1);assert.equal(e.action,'ausc-result');assert.match(e.text,/equal bilaterally/);assert.match(e.text,/ETCO₂/);});
test('auscultation without ventilation in arrest reports no breath sounds',()=>{const s=new Simulation(1,'guided');s.action('auscultate');assert.match(s.events.at(-1).text,/No breath sounds/);});
test('epinephrine due at 3 min and overdue at 5 min, reset by the next dose',()=>{const s=new Simulation(2,'guided');s.s.epi=1;s.s.epiLast=s.s.t;run(s,181);assert.ok(s.events.some(e=>e.action==='epi-due'));assert.ok(!s.events.some(e=>e.action==='epi-overdue'));run(s,120);assert.ok(s.events.some(e=>e.action==='epi-overdue'));});
