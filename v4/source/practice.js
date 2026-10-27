export const SIMULATION_SPEED=1;
export function simulationDelta(seconds,paused=false){return paused?0:Math.max(0,seconds)*SIMULATION_SPEED;}
export function cprInRange(rate,depth){return rate>=100&&rate<=120&&depth>=5&&depth<=6;}
export const POCUS_WINDOWS={
 cardiac:{label:'Heart · subcostal',target:[.50,.62],angle:15,probe:'phased',hint:'Just below the xiphoid, probe flat, aim at the left shoulder'},
 'lung-right':{label:'Right lung · anterior',target:[.37,.30],angle:0,probe:'linear',hint:'Patient right, 2nd–3rd intercostal space, mid-clavicular line'},
 'lung-left':{label:'Left lung · anterior',target:[.63,.30],angle:0,probe:'linear',hint:'Patient left, 2nd–3rd intercostal space, mid-clavicular line'}
};
const windowKey=view=>view==='lung'?'lung-right':view;
export function probeQuality(x,y,angle,view){const w=POCUS_WINDOWS[windowKey(view)];if(!w)return 0;const d=Math.hypot(x-w.target[0],y-w.target[1]);return Math.max(0,Math.min(1,1-Math.max(0,d-.02)*3.2-Math.max(0,Math.abs(angle-w.angle)-4)/120));}
export function probeGuidance(x,y,angle,view){const w=POCUS_WINDOWS[windowKey(view)];const dx=w.target[0]-x,dy=w.target[1]-y,da=w.angle-angle;const q=probeQuality(x,y,angle,view);if(q>=.75)return 'Good window — hold still and capture the clip.';const steps=[];if(Math.abs(dy)>.03)steps.push(dy>0?'slide down ↓':'slide up ↑');if(Math.abs(dx)>.03)steps.push(dx>0?'slide right →':'slide left ←');if(Math.abs(da)>6)steps.push(da>0?'rotate ⟳':'rotate ⟲');return steps.length?'Move the probe: '+steps.join(', '):'Almost there — fine-tune position and angle.';}
// Expected teaching finding for the current simulated patient state.
export function pocusFinding(s,view){
 if(windowKey(view)!=='cardiac'){if(view!=='lung-left'&&s.ptx)return 'absent';const ventilated=s.pulse?s.rr>0:(s.bvm||s.intubated);return ventilated?'sliding':'apnea';}
 if(s.pulse)return (s.pacing&&s.electricalCapture&&!s.mechanicalCapture)?'poor':'normal';
 if(['VF','VT'].includes(s.rhythm))return 'fibrillating';
 if(s.rhythm==='ASYSTOLE')return 'standstill';
 return 'poor';
}
export const POCUS_ANSWERS={
 cardiac:[['normal','Coordinated, strong contraction'],['poor','Weak contraction (low-flow state)'],['fibrillating','Fast quivering, no effective contraction'],['standstill','Cardiac standstill — no wall motion']],
 lung:[['sliding','Lung sliding present · seashore sign'],['absent','No lung sliding · barcode sign']]
};
export const POCUS_EXPLAIN={
 normal:'The ventricular walls thicken and the valves open and close with each beat. With a palpable pulse this is expected.',
 poor:'The heart is moving, but only a little. In PEA this is pseudo-PEA / a low-flow state: keep CPR going and search hard for a reversible cause (H’s and T’s).',
 fibrillating:'The myocardium shivers fast with no coordinated squeeze. This matches VF / pulseless VT: shock and continue CPR.',
 standstill:'No wall or valve motion; blood may swirl slowly (smoke). This matches asystole and carries a poor prognosis — never use it alone to stop resuscitation.',
 sliding:'The pleural line shimmers and the M-mode shows the “seashore”: sand below the line. The two pleural layers are touching here, so pneumothorax is ruled out at this spot.',
 absent:'The pleural line does not shimmer and the M-mode shows the “barcode / stratosphere” sign. With falling BP and hard bagging after intubation, this supports tension pneumothorax: decompress.',
 apnea:'Sliding needs breathing. With no ventilation (apnea or before bag-mask) the lung does not slide even though no pneumothorax is present. Ventilate and look again.'
};
export function tapRate(intervalMs){return intervalMs>0?60000/intervalMs:0;}
export function mountPractice(host,type,sim,onBeat=()=>{}){
 let gain=65;let elapsed=0,held=0,done=false,x=.18,y=.75,angle=0,view='cardiac',captured=false,capturedFinding=null;
 const s=sim.s;let lastTap=null,combo=0,best=0,tapFeedback='Tap to the moving beat. Real-time target: 100–120 taps/min.';
 if(type==='cpr'){
 // Tap-along CPR drill: a metronome guides the rhythm, the rate is a rolling average of the last
 // four taps (single taps never fail you), and 30:2 cycles pause automatically for two breaths.
 host.innerHTML=`<p class="cpr-lead">Tap the big button (or press <kbd>Space</kbd>) in time with the pulsing ring. Aim for the green zone: <b>100–120 per minute</b>.</p>
 <div class="cpr-game"><button id="compression-tap" class="cpr-pad" aria-label="Compress"><span class="cpr-ring" id="cpr-ring"></span><b>PUSH</b><small id="cpr-count">0 / 30</small></button>
 <div class="cpr-gauge" aria-hidden="true"><div class="cpr-zone"></div><i id="cpr-needle"></i><span>60</span><span>100</span><span>120</span><span>160</span></div>
 <p id="cpr-rate" class="cpr-rate">— /min</p><p id="tap-feedback" class="cpr-feedback" role="status">Start tapping with the ring.</p>
 <div class="cpr-stats"><span>Cycles <b id="cpr-cycles">0</b></span><span>On rhythm <b id="cpr-acc">—</b></span><span>Best streak <b id="cpr-best">0</b></span></div>
 <label class="cpr-metro"><input type="checkbox" id="cpr-metronome" checked> Metronome click</label></div>
 <details class="cpr-team"><summary>Team CPR settings (rate &amp; depth)</summary><label>Rate <output id="rate-read"></output><input id="practice-rate" type="range" min="60" max="160" step="1" value="${s.cprRate}"></label><label>Depth <output id="depth-read"></output><input id="practice-depth" type="range" min="2" max="8" step="0.1" value="${s.cprDepth}"></label><button id="cpr-ideal" class="wide">Set ideal: 110/min · 5.5 cm</button><p id="practice-feedback" role="status"></p><p id="practice-etco2"></p></details>
 <small>Practice only — unscored, and it does not change the case.</small>`;
 const $q=q=>host.querySelector(q);const taps=[];let count=0,cycles=0,good=0,total=0,streak=0,breathUntil=0,lastBeat=0,cycleGood=0;
 const continuous=()=>s.intubated;
 const avgRate=()=>{if(taps.length<3)return null;const iv=[];for(let i=Math.max(1,taps.length-4);i<taps.length;i++)iv.push(taps[i]-taps[i-1]);return 60000/(iv.reduce((a,b)=>a+b,0)/iv.length);};
 const tap=()=>{if(s.paused||s.ended)return;const now=performance.now();if(now<breathUntil){$q('#tap-feedback').textContent='Breaths in progress — wait for the ring.';return;}
  if(taps.length&&now-taps.at(-1)>1500){taps.length=0;streak=0;}taps.push(now);if(taps.length>8)taps.shift();
  const pad=$q('#compression-tap');pad.classList.remove('pressed');void pad.offsetWidth;pad.classList.add('pressed');
  count++;const r=avgRate();let msg;
  if(r===null)msg='Keep going…';else{total++;const ok=r>=100&&r<=120;if(ok){good++;cycleGood++;streak++;best=Math.max(best,streak);}else streak=0;msg=ok?(streak>=10?'Perfect rhythm! 🔥':'Good — keep this pace'):r<100?'Faster ↑':'Slower ↓';onBeat(ok);}
  $q('#tap-feedback').textContent=msg;
  if(!continuous()&&count>=30){cycles++;const pct=Math.round(cycleGood/28*100);breathUntil=now+4000;$q('#tap-feedback').textContent=`Cycle ${cycles} done — ${Math.min(100,pct)}% on rhythm${pct>=80?' ★':''}. Two breaths now…`;sim.log('cpr-practice-cycle',`CPR game: cycle ${cycles}, ${Math.min(100,pct)}% on rhythm (unscored)`);if(pct>=80&&s.cpr&&!s.pulse)sim.action('cpr-coached');count=0;cycleGood=0;taps.length=0;}
 };
 $q('#compression-tap').onpointerdown=e=>{e.preventDefault();tap();};
 const key=e=>{if(!host.isConnected){document.removeEventListener('keydown',key);return;}if(e.code==='Space'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();tap();}};document.addEventListener('keydown',key);
 const rate=$q('#practice-rate'),depth=$q('#practice-depth');
 const adjust=()=>{if(s.paused||s.ended)return;s.cprRate=+rate.value;s.cprDepth=+depth.value;};rate.oninput=depth.oninput=adjust;rate.onchange=depth.onchange=()=>{adjust();sim.log('cpr-practice-settings',`Rate ${s.cprRate}/min; depth ${s.cprDepth} cm`);};
 $q('#cpr-ideal').onclick=()=>{rate.value=110;depth.value=5.5;adjust();sim.log('cpr-practice-settings','Team CPR set to 110/min, 5.5 cm');};
 return dt=>{if(!host.isConnected){document.removeEventListener('keydown',key);return;}
  const now=performance.now(),breathing=now<breathUntil;
  if(!s.paused&&!s.ended)elapsed+=dt/SIMULATION_SPEED;
  const period=60/110,phase=(elapsed%period)/period;$q('#cpr-ring').style.transform=`scale(${breathing?1:1+.35*(1-phase)})`;$q('#cpr-ring').style.opacity=breathing?.15:.35+.6*(1-phase);
  const beatIdx=Math.floor(elapsed/period);if(beatIdx!==lastBeat){lastBeat=beatIdx;if(!breathing&&!s.paused&&$q('#cpr-metronome').checked)onBeat('tick');}
  const r=avgRate();$q('#cpr-rate').textContent=breathing?'Breathing…':r?`${Math.round(r)} /min`:'— /min';$q('#cpr-rate').className='cpr-rate '+(r&&!breathing?(r>=100&&r<=120?'ok':'off'):'');
  $q('#cpr-needle').style.left=`${Math.max(0,Math.min(100,((r||60)-60)/100*100))}%`;
  $q('#cpr-count').textContent=continuous()?`${count} · continuous`:breathing?'2 breaths':`${count} / 30`;
  $q('#cpr-cycles').textContent=cycles;$q('#cpr-acc').textContent=total?`${Math.round(good/total*100)}%`:'—';$q('#cpr-best').textContent=best;
  if(!breathing&&breathUntil&&now>=breathUntil){breathUntil=0;$q('#tap-feedback').textContent='Back on the chest — keep the rhythm.';}
  $q('#rate-read').textContent=`${s.cprRate}/min`;$q('#depth-read').textContent=`${s.cprDepth.toFixed(1)} cm`;
  $q('#practice-feedback').textContent=cprInRange(s.cprRate,s.cprDepth)?'Team settings in the target range ✓':'Team settings outside 100–120/min and 5–6 cm';
  $q('#practice-etco2').textContent=s.capno?`Simulated ETCO₂: ${Math.round(s.etco2)} mmHg`:'';};
 }
 mountPocus(host,sim);
 return host.__pocusUpdate;
}

// ---------------------------------------------------------------------------
// POCUS practice: torso map + synthetic live ultrasound (B-mode, lung M-mode).
// Original synthetic teaching images. Never diagnostic images or measurements.
// ---------------------------------------------------------------------------
function mountPocus(host,sim){
 const s=sim.s;let view='cardiac',x=.5,y=.86,angle=-30,gain=60,elapsed=0,captured=false,expected=null,frozenFinding=null,guiding=false,answered=false;
 const windowButtons=Object.entries(POCUS_WINDOWS).map(([k,w])=>`<button data-window="${k}" class="${k===view?'active':''}">${w.label}</button>`).join('');
 host.innerHTML=` <p class="pocus-lead">1 · choose a window · 2 · drag the probe onto the glowing target (or tap it) · 3 · capture the clip and name the finding.</p>
 <div class="pocus-windows" role="group" aria-label="Ultrasound window">${windowButtons}</div>
 <div class="pocus-grid">
  <div class="pocus-map-wrap"><canvas id="probe-map" width="440" height="330" aria-label="Torso map: drag or tap to place the ultrasound probe"></canvas>
   <div class="probe-nudges"><button data-probe="left" aria-label="Probe left">←</button><button data-probe="up" aria-label="Probe up">↑</button><button data-probe="down" aria-label="Probe down">↓</button><button data-probe="right" aria-label="Probe right">→</button><button data-probe="ccw" aria-label="Rotate probe counter-clockwise">⟲</button><button data-probe="cw" aria-label="Rotate probe clockwise">⟳</button></div>
   <div class="pocus-quality"><span>Window</span><div class="pocus-meter"><i id="pocus-meter-fill"></i></div><b id="pocus-quality-num">0%</b></div>
   <p id="probe-guidance" class="pocus-guidance" role="status"></p>
   <div class="pocus-row"><button id="probe-guide">Guide me</button><label class="pocus-gain">Gain<input id="probe-gain" type="range" min="30" max="95" value="60"></label></div>
  </div>
  <div class="pocus-answers-wrap">
   <button id="probe-capture" class="primary wide" disabled>Capture clip</button>
   <div id="probe-answers" hidden><p>What does this clip show?</p><div id="probe-answer-list"></div></div>
   <p id="probe-feedback" class="pocus-feedback" role="status"></p>
  </div>
  </div>
 </div>
 <small>Synthetic teaching image, not diagnostic ultrasound. Keep CPR pauses under 10 s: look during the rhythm check, record a clip, interpret it while compressions continue. Practice is unscored.</small>`;
 // The ultrasound machine screen floats over the 3D room so the image is large and the monitor stays visible.
 document.getElementById('pocus-screen')?.remove();
 const screenEl=document.createElement('div');screenEl.id='pocus-screen';screenEl.innerHTML='<div class="pocus-screen-head"><b>ULTRASOUND</b><span id="pocus-screen-view"></span></div><canvas id="ultrasound-image" width="720" height="420" aria-label="Synthetic live ultrasound image"></canvas><p id="pocus-artifact" class="pocus-warn" hidden>Compression artifact — record the clip during the next rhythm-check pause (≤10 s).</p>';
 (document.getElementById('stage')||document.body).appendChild(screenEl);
 const map=host.querySelector('#probe-map'),m=map.getContext('2d'),image=screenEl.querySelector('#ultrasound-image'),u=image.getContext('2d');
 const $q=sel=>host.querySelector(sel);
 const reset=()=>{if(!captured)return;captured=false;answered=false;frozenFinding=null;$q('#probe-answers').hidden=true;$q('#probe-feedback').textContent='';};
 const setView=v=>{view=v;host.querySelectorAll('[data-window]').forEach(b=>b.classList.toggle('active',b.dataset.window===v));reset();};
 host.querySelectorAll('[data-window]').forEach(b=>b.onclick=()=>setView(b.dataset.window));
 function place(e){if(s.paused||s.ended)return;const r=map.getBoundingClientRect();x=Math.max(.04,Math.min(.96,(e.clientX-r.left)/r.width));y=Math.max(.04,Math.min(.96,(e.clientY-r.top)/r.height));guiding=false;
  // Easy mode: a tap close to the target snaps onto it and aligns the probe.
  const w=POCUS_WINDOWS[view];if(Math.hypot(x-w.target[0],y-w.target[1])<.07){x=w.target[0];y=w.target[1];angle=w.angle;}reset();}
 map.onpointerdown=e=>{map.setPointerCapture(e.pointerId);place(e);};map.onpointermove=e=>{if(map.hasPointerCapture(e.pointerId))place(e);};map.onpointerup=e=>{if(map.hasPointerCapture(e.pointerId))map.releasePointerCapture(e.pointerId);};
 host.querySelectorAll('[data-probe]').forEach(b=>b.onclick=()=>{if(s.paused||s.ended)return;const d=b.dataset.probe;guiding=false;if(d==='cw'||d==='ccw')angle=Math.max(-60,Math.min(60,angle+(d==='cw'?5:-5)));else{x=Math.max(.04,Math.min(.96,x+(d==='right'?.025:d==='left'?-.025:0)));y=Math.max(.04,Math.min(.96,y+(d==='down'?.025:d==='up'?-.025:0)));}reset();});
 $q('#probe-guide').onclick=()=>{guiding=true;reset();};
 $q('#probe-gain').oninput=e=>{gain=+e.target.value;};
 $q('#probe-capture').onclick=()=>{if(s.paused||s.ended||probeQuality(x,y,angle,view)<.75)return;frozenFinding=pocusFinding(s,view);expected=frozenFinding==='apnea'?'absent':frozenFinding;captured=true;answered=false;
  const kind=view==='cardiac'?'cardiac':'lung';$q('#probe-answer-list').innerHTML=POCUS_ANSWERS[kind].map(([k,l])=>`<button data-finding="${k}">${l}</button>`).join('');$q('#probe-answers').hidden=false;$q('#probe-feedback').textContent='';
  host.querySelectorAll('[data-finding]').forEach(b=>b.onclick=()=>{if(!captured||answered||s.paused||s.ended)return;answered=true;const correct=b.dataset.finding===expected;host.querySelectorAll('[data-finding]').forEach(o=>{o.classList.toggle('correct',o.dataset.finding===expected);o.classList.toggle('wrong',o===b&&!correct);});$q('#probe-feedback').innerHTML=`<b>${correct?'Correct.':'Not quite.'}</b> ${POCUS_EXPLAIN[frozenFinding]}`;sim.log('pocus-interpretation',`${POCUS_WINDOWS[view].label}: ${b.dataset.finding} — ${correct?'matches':'review'} (unscored)`);});
  if(view==='cardiac')s.pocusCardiac=true;else s.pocusLung=true;sim.log('pocus-capture',`Synthetic ${POCUS_WINDOWS[view].label} clip recorded${s.cpr?' during CPR':''}.`);sim.action('pocus');};
 // Persistent M-mode history for lung windows.
 const mm=document.createElement('canvas');mm.width=220;mm.height=420;const mctx=mm.getContext('2d');mctx.fillStyle='#000';mctx.fillRect(0,0,220,420);
 return host.__pocusUpdate=dt=>{
  if(!host.isConnected||!screenEl.isConnected){screenEl.remove();return;}
  const realDt=dt/SIMULATION_SPEED;if(!s.paused&&!s.ended)elapsed+=realDt;
  if(guiding&&!s.paused){const w=POCUS_WINDOWS[view],k=Math.min(1,realDt*3.2);x+=(w.target[0]-x)*k;y+=(w.target[1]-y)*k;angle+=(w.angle-angle)*k;if(probeQuality(x,y,angle,view)>.97)guiding=false;}
  const quality=probeQuality(x,y,angle,view);
  drawTorso(m,{x,y,angle,view,elapsed});
  const finding=captured?frozenFinding:pocusFinding(s,view);
  drawUltrasound(u,{dt:(s.paused||s.ended)?0:realDt,elapsed,quality,gain,view,finding,hr:s.pulse?(s.hr||80):s.rhythm==='PEA'?(s.hr||30):s.rhythm==='VT'?190:0,cpr:s.cpr&&!s.pulse&&!captured,cprRate:s.cprRate,rr:s.pulse?(s.rr||12):(s.intubated?10:s.bvm?10:0),mm,mctx,frozen:captured||s.paused});
  $q('#pocus-meter-fill').style.width=`${Math.round(quality*100)}%`;$q('#pocus-meter-fill').className=quality>=.75?'good':quality>=.45?'mid':'';$q('#pocus-quality-num').textContent=`${Math.round(quality*100)}%`;
  $q('#probe-guidance').textContent=captured?'Clip frozen — choose the finding. Move the probe to scan again.':probeGuidance(x,y,angle,view);
  const cap=$q('#probe-capture');cap.disabled=captured||quality<.75||s.paused||s.ended;cap.textContent=captured?'Clip captured':quality<.75?`Capture clip (window ${Math.round(quality*100)}% · need 75%)`:'Capture clip';
  screenEl.querySelector('#pocus-screen-view').textContent=`${POCUS_WINDOWS[view].label} · ${captured?'CLIP FROZEN':'LIVE'}`;screenEl.querySelector('#pocus-artifact').hidden=!(view==='cardiac'&&s.cpr&&!s.pulse&&!captured);
 };
}

function drawTorso(c,{x,y,angle,view,elapsed}){
 const W=440,H=330;c.clearRect(0,0,W,H);c.fillStyle='#10262c';c.fillRect(0,0,W,H);
 // Torso silhouette (anterior view, patient supine, head at top).
 c.fillStyle='#d9b79c';c.strokeStyle='#8c6a55';c.lineWidth=2;c.beginPath();
 c.moveTo(178,6);c.lineTo(262,6);c.bezierCurveTo(268,30,300,40,352,48);c.bezierCurveTo(392,56,404,92,398,140);c.lineTo(372,152);c.bezierCurveTo(364,210,360,262,356,324);c.lineTo(84,324);c.bezierCurveTo(80,262,76,210,68,152);c.lineTo(42,140);c.bezierCurveTo(36,92,48,56,88,48);c.bezierCurveTo(140,40,172,30,178,6);c.closePath();c.fill();c.stroke();
 // Clavicles, sternum, xiphoid, costal margins, ribs.
 c.strokeStyle='#a98166';c.lineWidth=3;c.beginPath();c.moveTo(212,64);c.quadraticCurveTo(160,52,104,66);c.moveTo(228,64);c.quadraticCurveTo(280,52,336,66);c.stroke();
 c.fillStyle='#c79f84';c.beginPath();c.roundRect?c.roundRect(208,64,24,120,8):c.rect(208,64,24,120);c.fill();c.beginPath();c.moveTo(210,184);c.lineTo(230,184);c.lineTo(220,202);c.closePath();c.fill();
 c.strokeStyle='#b88f74';c.lineWidth=2.4;c.beginPath();c.moveTo(218,202);c.quadraticCurveTo(160,226,112,246);c.moveTo(222,202);c.quadraticCurveTo(280,226,328,246);c.stroke();
 c.strokeStyle='#c49c81aa';c.lineWidth=1.6;for(let i=0;i<6;i++){const yy=88+i*22;c.beginPath();c.moveTo(206,yy);c.quadraticCurveTo(150,yy+6-i,100+i*4,yy+22+i*3);c.moveTo(234,yy);c.quadraticCurveTo(290,yy+6-i,340-i*4,yy+22+i*3);c.stroke();}
 c.fillStyle='#a77a63';for(const nx of [150,290]){c.beginPath();c.arc(nx,140,4,0,Math.PI*2);c.fill();}c.beginPath();c.arc(220,286,4,0,Math.PI*2);c.fill();
 c.fillStyle='#e7f2ef';c.font='bold 13px sans-serif';c.fillText('HEAD',202,24);c.font='12px sans-serif';c.fillText('Patient R',14,300);c.fillText('Patient L',366,300);
 // All targets faint; the selected window pulses.
 for(const [k,w] of Object.entries(POCUS_WINDOWS)){const tx=w.target[0]*W,ty=w.target[1]*H,active=k===view;c.strokeStyle=active?`rgba(124,237,210,${.55+.4*Math.sin(elapsed*4)})`:'#ffffff55';c.lineWidth=active?3:1.5;c.setLineDash(active?[]:[5,5]);c.beginPath();c.arc(tx,ty,active?26:18,0,Math.PI*2);c.stroke();c.setLineDash([]);if(active){c.fillStyle='#7cedd233';c.fill();c.fillStyle='#e7fff8';c.font='bold 12px sans-serif';const label=k==='cardiac'?'subcostal':'2nd–3rd ICS';c.fillText(label,tx-c.measureText(label).width/2,ty+42);}}
 // Probe with orientation marker.
 c.save();c.translate(x*W,y*H);c.rotate(angle*Math.PI/180);c.fillStyle='#1d3f4a';c.strokeStyle='#7cedd2';c.lineWidth=2;c.beginPath();c.roundRect?c.roundRect(-24,-9,48,18,6):c.rect(-24,-9,48,18);c.fill();c.stroke();c.fillStyle='#7cedd2';c.beginPath();c.arc(-17,0,3.5,0,Math.PI*2);c.fill();c.fillStyle='#7cedd255';c.fillRect(-22,9,44,4);c.restore();
}

// Shared speckle textures (generated once, shifted every frame to look live).
const speckle=[];
function speckleTexture(i){if(speckle[i])return speckle[i];const cv=document.createElement('canvas');cv.width=360;cv.height=220;const g=cv.getContext('2d'),img=g.createImageData(360,220);let seed=1234+i*999;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;for(let p=0;p<img.data.length;p+=4){const v=Math.pow(rnd(),2.2)*255;img.data[p]=img.data[p+1]=img.data[p+2]=v;img.data[p+3]=255;}g.putImageData(img,0,0);const out=document.createElement('canvas');out.width=720;out.height=440;const o=out.getContext('2d');o.imageSmoothingEnabled=true;o.filter='blur(0.6px)';o.drawImage(cv,0,0,720,440);return speckle[i]=out;}

export function drawUltrasound(c,o){
 const {elapsed,quality,gain,view,finding}=o;const W=720,H=420,lung=view!=='cardiac';
 c.fillStyle='#000';c.fillRect(0,0,W,H);
 const bright=Math.max(.35,Math.min(1.6,gain/60));
 if(!lung)drawCardiac(c,o,bright);else drawLung(c,o,bright);
 // Low-quality window: rib / gas shadowing hides the anatomy.
 if(quality<.98){c.save();c.globalAlpha=Math.min(.94,(1-quality)*1.15);c.fillStyle='#030405';c.fillRect(0,0,lung?500:W,H);c.globalAlpha=Math.min(.6,(1-quality));c.drawImage(speckleTexture(2),(elapsed*30)%40-20,0);c.restore();}
 // Screen furniture.
 c.fillStyle='#c7d4da';c.font='15px sans-serif';c.fillText(lung?'LINEAR · LUNG · B + M MODE':'PHASED · SUBCOSTAL 4-CHAMBER',14,22);c.font='13px sans-serif';c.fillText(`GAIN ${gain}%  ·  DEPTH ${lung?6:16} cm`,14,H-12);c.fillText('SYNTHETIC TRAINING',lung?300:560,H-12);
 c.fillStyle='#7cedd2';c.beginPath();c.arc(lung?20:250,lung?38:34,5,0,Math.PI*2);c.fill();
 for(let i=1;i<=4;i++){const yy=40+i*(H-70)/4;c.fillStyle='#9fb0b7';c.fillRect(lung?488:704,yy,10,2);}
}

function sectorClip(c,cx,cy,r){c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,r,Math.PI*.27,Math.PI*.73);c.closePath();}
function drawCardiac(c,o,bright){
 const {elapsed,finding,hr,cpr,cprRate}=o;const cx=360,cy=22,R=396;
 c.save();sectorClip(c,cx,cy,R);c.clip();
 const jitter=cpr?Math.sin(elapsed*Math.PI*2*(cprRate||110)/60)*16:0;c.translate(0,jitter);
 c.globalAlpha=.35*bright;c.drawImage(speckleTexture(0),-((elapsed*9)%20),0);c.globalAlpha=1;
 // Cardiac cycle: sys 0 = diastole (chambers full), 1 = peak systole.
 const rate=Math.max(20,hr||60);const ph=(elapsed*rate/60)%1;
 let sys=Math.max(0,Math.sin(Math.min(1,ph/.4)*Math.PI));
 const amp=finding==='normal'?1:finding==='poor'?.18:0;
 const quiver=finding==='fibrillating'?(Math.sin(elapsed*52)*.6+Math.sin(elapsed*37+1)*.4):0;
 const k=sys*amp;
 // Liver: near-field homogeneous parenchyma with hepatic veins.
 c.save();c.beginPath();c.moveTo(120,20);c.lineTo(620,20);c.lineTo(640,120);c.bezierCurveTo(520,150,380,150,300,190);c.bezierCurveTo(230,215,170,210,110,190);c.closePath();c.clip();
 c.globalAlpha=.85*bright;c.drawImage(speckleTexture(1),-4,-4);c.globalAlpha=1;c.fillStyle=`rgba(120,128,132,${.25*bright})`;c.fillRect(0,0,720,240);
 c.fillStyle='#040506';for(const [vx,vy,rx,ry,r] of [[300,100,16,9,.4],[400,96,12,7,-.2],[236,150,9,6,.6],[470,118,8,5,0]]){c.beginPath();c.ellipse(vx,vy,rx,ry,r,0,Math.PI*2);c.fill();}
 c.restore();
 // Heart: subcostal four-chamber, apex toward the right of the screen.
 c.save();c.translate(370,292);c.rotate(.32);
 const myoPath=()=>{c.beginPath();c.moveTo(-190,-6);c.bezierCurveTo(-190,-104,-60,-118,40,-100);c.bezierCurveTo(140,-84,214,-36,226,4);c.bezierCurveTo(214,44,140,96,40,104);c.bezierCurveTo(-60,116,-190,92,-190,-6);c.closePath();};
 // Pericardium: brightest line, posterior part thickest.
 c.save();c.scale(1.07,1.1);myoPath();c.strokeStyle=`rgba(250,252,253,${Math.min(1,.9*bright)})`;c.lineWidth=6;c.stroke();c.restore();
 // Myocardium: bright speckled tissue.
 c.save();myoPath();c.clip();c.globalAlpha=Math.min(1,.95*bright);c.drawImage(speckleTexture(1),-380,-300);c.fillStyle=`rgba(200,206,210,${.32*bright})`;c.fillRect(-260,-160,520,320);c.globalAlpha=1;
 // Blood pools are echo-free; soft edges mimic endocardial borders.
 const vs=1-.2*k,va=1+.08*k,q=quiver*4;
 c.fillStyle='#020304';c.shadowColor='#020304';c.shadowBlur=10;
 const chamber=(x0,y0,rx,ry,rot)=>{c.beginPath();c.ellipse(x0,y0,Math.max(8,rx),Math.max(6,ry),rot,0,Math.PI*2);c.fill();};
 chamber(52+q,-44,96*vs,30*(1-.28*k),-.08);         // RV: crescent next to the liver
 chamber(64-q,44,112*vs,38*(1-.3*k),.06);           // LV: long bullet toward the apex
 chamber(-112,-44,50*va,34*va,0);                   // RA
 chamber(-112,46,52*va,36*va,0);                    // LA
 c.shadowBlur=0;
 // Smoke (spontaneous echo contrast) swirling in a still heart.
 if(finding==='standstill'){c.globalAlpha=.32;for(let i=0;i<70;i++){const a2=i*2.1+elapsed*.4,r2=6+(i*5)%34;c.fillStyle='#a5b0b4';c.fillRect(64+Math.cos(a2)*r2*2.2,44+Math.sin(a2)*r2*.8,2,2);}c.globalAlpha=1;}
 c.restore();
 // Septa and AV valves (leaflets open into the ventricle in diastole).
 c.strokeStyle=`rgba(232,236,238,${Math.min(1,.95*bright)})`;c.lineWidth=11;c.beginPath();c.moveTo(-180,0+q*.5);c.lineTo(-60,0);c.quadraticCurveTo(80,2+q,214,4);c.stroke();
 const open=finding==='standstill'?.15:finding==='fibrillating'?.45+quiver*.25:finding==='poor'?.7-.2*sys:1-sys;
 c.lineWidth=4.5;c.strokeStyle=`rgba(250,252,253,${Math.min(1,bright)})`;
 for(const vy of [-44,46]){const top=vy-30,bot=vy+30;const L=30;c.beginPath();c.moveTo(-58,top);c.lineTo(-58+L*Math.cos(1.2-open*1.1),top+L*Math.sin(1.2-open*1.1)*.9);c.moveTo(-58,bot);c.lineTo(-58+L*Math.cos(1.2-open*1.1),bot-L*Math.sin(1.2-open*1.1)*.9);c.stroke();}
 c.restore();
 const grad=c.createLinearGradient(0,250,0,420);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,'rgba(0,0,0,.7)');c.fillStyle=grad;c.fillRect(0,0,720,440);
 c.restore();
 c.fillStyle='#d6e2e7';c.font='bold 13px sans-serif';for(const [t,lx,ly] of [['LIVER',190,80],['RV',412,226],['LV',426,318],['RA',268,214],['LA',250,300]])c.fillText(t,lx,ly);
}

function drawLung(c,o,bright){
 const {elapsed,finding,rr,mm,mctx,frozen}=o;const pl=150,sliding=finding==='sliding';
 // Breath cycle drives sliding (seashore) only when the pleura are apposed and the lung is ventilated.
 const breathRate=Math.max(0,rr||0);const breathPh=breathRate?(elapsed*breathRate/60)%1:0;const moving=sliding&&breathRate>0&&breathPh<.55;
 const shift=sliding?Math.sin(breathPh*Math.PI*2)*10:0;
 c.save();c.beginPath();c.rect(0,0,500,420);c.clip();
 // Soft tissue layers with fibrillar muscle texture.
 c.globalAlpha=.5*bright;c.drawImage(speckleTexture(1),-8,-6);c.globalAlpha=1;
 for(let yy=40;yy<pl-20;yy+=10){c.strokeStyle=`rgba(190,200,205,${(.16+((yy/10)%3)*.05)*bright})`;c.lineWidth=2;c.beginPath();c.moveTo(0,yy);for(let xx=0;xx<=500;xx+=25)c.lineTo(xx,yy+Math.sin(xx*.03+yy)*2);c.stroke();}
 // Ribs with posterior acoustic shadow ("bat sign").
 for(const rx of [70,430]){c.fillStyle='#000';c.fillRect(rx-46,pl-26,92,420);c.strokeStyle=`rgba(238,242,244,${Math.min(1,bright)})`;c.lineWidth=7;c.beginPath();c.arc(rx,pl-6,44,Math.PI*1.08,Math.PI*1.92);c.stroke();}
 // Pleural line and its shimmer.
 c.strokeStyle=`rgba(250,252,253,${Math.min(1,bright)})`;c.lineWidth=5;c.beginPath();c.moveTo(118,pl);c.lineTo(382,pl);c.stroke();
 if(moving){for(let i=0;i<30;i++){const px=118+((i*37+shift*6+elapsed*60)%264);c.fillStyle=`rgba(255,255,255,${.4+.4*Math.sin(i+elapsed*9)})`;c.fillRect(px,pl-3+((i*7)%6),5,2);}}
 // Below the pleura: speckle that moves with sliding + reverberation A-lines.
 c.save();c.beginPath();c.rect(118,pl+4,264,270);c.clip();c.globalAlpha=.35*bright;c.drawImage(speckleTexture(2),-20+(moving?shift*2:0),-20);c.globalAlpha=1;
 for(const yy of [pl*2-30,pl*3-60]){c.strokeStyle=`rgba(200,210,214,${.55*bright})`;c.lineWidth=3;c.beginPath();c.moveTo(118,yy);c.lineTo(382,yy);c.stroke();}c.restore();
 // M-mode cursor.
 c.setLineDash([6,6]);c.strokeStyle='#7cedd2';c.lineWidth=1.5;c.beginPath();c.moveTo(250,40);c.lineTo(250,410);c.stroke();c.setLineDash([]);
 c.restore();
 // M-mode: scroll left, draw one new column per frame.
 if(!frozen){let cols=Math.max(0,Math.round((o.dt||0)*90));cols=Math.min(cols,40);for(let n=0;n<cols;n++){mctx.drawImage(mm,-2,0);const live=moving||(sliding&&breathRate>0&&Math.random()<.35);for(let yy=0;yy<420;yy+=2){let v;if(yy<pl-24)v=40+((yy*13)%7)*14+(yy%20<3?70:0);else if(Math.abs(yy-pl)<4)v=245;else if(live&&sliding)v=Math.random()*150+20;else v=(yy%(pl-30)<5?140:30)+((yy*7)%5)*6;mctx.fillStyle=`rgb(${v|0},${v|0},${v|0})`;mctx.fillRect(218,yy,2,2);}}}
 c.save();c.globalAlpha=Math.min(1,bright);c.drawImage(mm,500,0);c.restore();c.fillStyle='#000';c.fillRect(498,0,4,420);
 c.fillStyle='#c7d4da';c.font='13px sans-serif';c.fillText('M-MODE',512,40);c.fillText('PLEURAL LINE',122,pl-12);c.fillText('A-LINE',300,pl*2-38);c.fillText('RIB',52,pl-56);
}
