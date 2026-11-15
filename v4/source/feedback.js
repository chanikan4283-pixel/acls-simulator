// Individual debrief: turns one learner's own timeline into strengths, priorities and a next-attempt drill.
// Pure function of the report object (no DOM), so it can be tested and exported with the report.
const FB_DOMAINS={
 cpr:{label:'CPR quality',tip:'Charge the defibrillator while compressions continue and keep every pause under 10 seconds.',drill:'keep every hands-off pause under 10 s and CCF above 80%'},
 rhythm:{label:'Rhythm & shock',tip:'Check the rhythm at the 2-minute mark, call "clear", shock once, and resume compressions immediately.',drill:'say the rhythm out loud before each decision: shockable or not?'},
 drugs:{label:'Drugs & access',tip:'Confirm access, then indication, dose and route before each drug (e.g. epinephrine 1 mg every 3–5 min in arrest).',drill:'state indication, dose and route before every drug order'},
 cause:{label:'Finding the cause',tip:'Use history, exam, labs and POCUS to work through the Hs and Ts while CPR continues.',drill:'name one H or T and the evidence for it within the first two cycles'},
 team:{label:'Safety & comfort',tip:'Protect the team before discharge and give analgesia or sedation to a conscious patient when it does not delay treatment.',drill:'call "everyone clear" and look before every shock'},
 post:{label:'After ROSC',tip:'After ROSC: airway and SpO₂ 90–98%, MAP ≥65 mmHg, 12-lead ECG, treat the cause, temperature control, and a structured handover.',drill:'run the post-ROSC checklist before you hand over'}
};
const FB_KEY_DOMAIN=[
 [/^(long-pause|cpr-|vent-first|airway-first|etco2-|tube-check)/,'cpr'],
 [/^(unsafe-|stacked-shocks|shock-pulse|nonshockable|fresh-rhythm|energy|sync-arrest|not-charged|no-pads|cv-|check-artifact|rhythm-no-monitor|pacer-|not-stable)/,'rhythm'],
 [/^(pacing-pain|no-sedation|comfort|sedate-arrest)/,'team'],
 [/^(cause-|no-ptx|routine-bicarb|ecg12-arrest)/,'cause'],
 [/^(post-|renal-handover|commands-first|mega-incomplete|brady-incomplete)/,'post'],
 [/./,'drugs']
];
export function feedbackDomain(key){return FB_KEY_DOMAIN.find(([re])=>re.test(key))[1];}
const fbLower=t=>t.toLowerCase().replace(/\bcpr\b/,'CPR').replace(/\brosc\b/,'ROSC');
const fbClock=s=>s==null?'—':`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
export function personalFeedback(r,goals=[]){
 const errors=r.errors||[],achieved=new Set(r.achieved||[]),arrest=r.ccf!=null,name=r.playerName||'You';
 const strengths=[],improve=[];
 // Group this learner's own errors: what, how often, when it first happened, what it cost.
 const groups=new Map();
 for(const e of errors){const g=groups.get(e.key)||{key:e.key,text:e.text,n:0,points:0,first:e.t,domain:feedbackDomain(e.key)};g.n++;g.points+=e.points||0;groups.set(e.key,g);}
 const ranked=[...groups.values()].sort((a,b)=>b.points-a.points||b.n-a.n);
 const lost=Object.fromEntries(Object.keys(FB_DOMAINS).map(k=>[k,0]));for(const g of ranked)lost[g.domain]+=g.points+g.n;
 const pauses=groups.get('long-pause');
 // Strengths are only claimed when the learner's own numbers show them.
 if(arrest&&r.firstCPR!=null&&r.firstCPR<=20)strengths.push(`Compressions started ${Math.round(r.firstCPR)} s into the case — fast recognition of arrest.`);
 if(arrest&&r.ccf>=80)strengths.push(`Chest compression fraction ${r.ccf}% (target above 80%)${pauses?'':' with no pause over 10 s'}.`);
 if(r.cprInTarget!=null&&r.cprInTarget>=85)strengths.push(`Compressions stayed in the target rate and depth ${r.cprInTarget}% of the time.`);
 if(r.firstShock!=null&&r.firstShock<=150)strengths.push(`First shock at ${fbClock(r.firstShock)} — early defibrillation for a shockable rhythm.`);
 const ra=r.rhythmAnswers||[];if(ra.length&&ra.every(a=>a.correct))strengths.push(`Read the rhythm correctly ${ra.length===1?'on the first look':`all ${ra.length} times`}.`);
 if(achieved.has('cause'))strengths.push('Found the reversible cause and backed it with evidence.');
 if(!r.hints&&r.completed)strengths.push('Finished without using a hint — independent decisions.');
 if(!errors.length&&r.completed)strengths.push('No protocol deviations were recorded on this attempt.');
 if(achieved.has('post')&&!lost.post)strengths.push('Post-event care and handover were complete.');
 // Priorities: the learner's costliest deviations first, in their own numbers.
 for(const g of ranked.slice(0,3))improve.push({domain:g.domain,text:`${g.text}${g.n>1?` — ${g.n} times, first at ${fbClock(g.first)}`:` (at ${fbClock(g.first)})`}.`,tip:FB_DOMAINS[g.domain].tip});
 if(arrest&&r.ccf<80&&!improve.some(i=>i.domain==='cpr'))improve.push({domain:'cpr',text:`Chest compression fraction was ${r.ccf}% — the target is above 80%.`,tip:FB_DOMAINS.cpr.tip});
 if(arrest&&r.firstCPR!=null&&r.firstCPR>30)improve.push({domain:'cpr',text:`Compressions started at ${fbClock(r.firstCPR)} — begin within 10 s of finding no pulse.`,tip:'Check responsiveness, breathing and pulse together in under 10 s, then start compressions.'});
 if(r.cprInTarget!=null&&r.cprInTarget<70)improve.push({domain:'cpr',text:`Rate and depth were in target only ${r.cprInTarget}% of the time.`,tip:'Aim for 100–120/min and 5–6 cm with full recoil; swap the compressor every 2 minutes or when tired.'});
 if(ra.length&&ra.some(a=>!a.correct))improve.push({domain:'rhythm',text:`Rhythm interpretation: ${ra.filter(a=>a.correct).length} of ${ra.length} correct.`,tip:'Practise in the ECG coach: organised or not, wide or narrow, pulse or no pulse.'});
 const missed=goals.filter(([key,,points])=>!(key==='stabilization'?(achieved.has('capture')||achieved.has('brady-infusion')):achieved.has(key))).sort((a,b)=>b[2]-a[2]);
 for(const [key,label,points] of missed.slice(0,2))if(improve.length<4)improve.push({domain:feedbackDomain(key==='post'?'post-':key==='cause'?'cause-':key),text:`Not completed: ${label} (${points} points).`,tip:''});
 if(r.hints>=3)improve.push({domain:'cause',text:`${r.hints} hints used.`,tip:'Before opening a hint, say what you know and what single piece of information would change your plan.'});
 // Domain picture, 0–100, from this attempt only.
 const domains=Object.entries(FB_DOMAINS).map(([key,d])=>{let v=100-lost[key]*6;if(key==='cpr'&&arrest)v=Math.min(v,Math.round((r.ccf+(r.cprInTarget??r.ccf))/2)+(r.firstCPR!=null&&r.firstCPR<=20?8:0));if(key==='rhythm'&&ra.length)v-=ra.filter(a=>!a.correct).length*12;if(key==='post'&&!achieved.has('post'))v=Math.min(v,r.completed?70:40);if(key==='cause'&&goals.some(g=>g[0]==='cause')&&!achieved.has('cause'))v=Math.min(v,50);return {key,label:d.label,value:Math.max(5,Math.min(100,Math.round(v)))};});
 const weakest=improve[0]?.domain||[...domains].sort((a,b)=>a.value-b.value)[0].key,strongest=[...domains].sort((a,b)=>b.value-a.value)[0];
 const headline=!improve.length?`${name}, a clean run. Try the same case in Exam mode, or a harder case.`:`${name}, your strongest area was ${fbLower(strongest.label)}; the biggest gain next time is ${fbLower(FB_DOMAINS[weakest].label)}.`;
 return {headline,strengths:strengths.slice(0,4),improve:improve.slice(0,4),domains,drill:improve.length?`Next attempt: ${FB_DOMAINS[weakest].drill}.`:'Next attempt: repeat without hints and beat your time to the first critical action.'};
}
