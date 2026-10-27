// Close-up "procedure camera" animations drawn on canvas (original artwork, educational only).
// kinds: 'valsalva' (modified Valsalva / REVERT), 'carotid' (carotid sinus massage), 'adenosine' (double-syringe rapid push).
import {waveform} from './ecg.js';

export const PROCEDURES={
 valsalva:{title:'Modified Valsalva (REVERT)',duration:16,steps:[
  [0,'Sit the patient up at 45° and give a 10 mL syringe'],
  [1.2,'Blow into the syringe hard enough to move the plunger (≈40 mmHg) for 15 s'],
  [8.2,'Immediately lie flat and raise the legs to 45° for 15 s'],
  [14.2,'Sit up and reassess the rhythm']]},
 carotid:{title:'Carotid sinus massage',duration:13,steps:[
  [0,'Neck extended, head turned away · listen for a carotid bruit first'],
  [3,'No bruit heard · one side only, never both'],
  [4.2,'Firm circular massage at the angle of the jaw for 5–10 s'],
  [11,'Stop and reassess the rhythm']]},
 push:{title:'Giving medication',duration:4.6,mini:true,steps:[[0,'Read back: drug · dose · route'],[1.0,'Push through the port closest to the patient'],[2.4,'Flush 20 mL saline'],[3.6,'Raise the limb · time noted']]},
 patch:{title:'Inspect the back · fentanyl patch',duration:10,steps:[
  [0,'Log-roll the patient toward you with the team'],
  [1.8,'Inspect the back, skin folds and under dressings'],
  [3.2,'TWO fentanyl patches found — the old one was never removed!'],
  [5.4,'Gloves on: peel both off, fold sticky sides together, discard safely'],
  [8,'Wash the skin with water (no alcohol, no heat) · effect lasts hours: watch for recurrence']]},
 auscultate:{title:'Confirm tube placement · stethoscope',duration:11.5,noStrip:true,steps:[
  [0,'Tube in — listen before you trust it'],
  [.5,'Epigastrium first: no gurgling with the breath'],
  [3.4,'Left chest, mid-axillary: breath sounds present'],
  [6.6,'Right chest, mid-axillary: breath sounds present — equal'],
  [9.8,'Equal chest rise · now confirm with waveform capnography and secure the tube']]},
 adenosine:{title:'Adenosine · double-syringe rapid push',duration:13,steps:[
  [0,'Antecubital IV · both syringes on a 3-way stopcock closest to the patient'],
  [1.8,'Push adenosine RAPIDLY (≤1 s)'],
  [3.0,'Turn the stopcock'],
  [3.6,'Immediately flush 20 mL saline, fast'],
  [5.0,'Raise the arm · warn the patient (chest tightness, flushing)'],
  [6.4,'Watch the monitor: transient AV block / pause']]}
};

const ease=x=>x<0?0:x>1?1:x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const seg=(t,a,b)=>ease((t-a)/(b-a));

export function playProcedure(host,kind,{isPaused=()=>false,onDone=()=>{},hr=190,converts=false,rhythm='SVT',label='',steps=null}={}){
 const P0=PROCEDURES[kind];if(!P0)return null;const P=steps?{...P0,steps}:P0;
 document.getElementById('proc-screen')?.remove();
 const el=document.createElement('div');el.id='proc-screen';
 if(P.mini)el.classList.add('mini');el.innerHTML=`<div class="proc-head"><b>${P.mini?'MED':'PROCEDURE CAM'}</b><span>${P.mini&&label?label:P.title}</span><button class="proc-skip" aria-label="Skip animation">Skip ▸</button></div><canvas width="720" height="420" aria-label="${P.title} animation"></canvas><p class="proc-step" role="status"></p><div class="proc-bar"><i></i></div>`;
 host.appendChild(el);
 const c=el.querySelector('canvas').getContext('2d'),stepEl=el.querySelector('.proc-step'),bar=el.querySelector('.proc-bar i');
 let t=0,last=performance.now(),done=false,raf=0;
 const finish=()=>{if(done)return;done=true;cancelAnimationFrame(raf);el.classList.add('out');setTimeout(()=>el.remove(),350);onDone();};
 el.querySelector('.proc-skip').onclick=finish;
 const frame=now=>{if(done)return;const dt=Math.min(.1,(now-last)/1000);last=now;if(!isPaused())t+=dt;
  PA_DRAW[kind](c,t,{hr,converts,label});if(!P.mini&&!P.noStrip)drawStrip(c,t,kind,hr,converts,rhythm);
  const step=[...P.steps].reverse().find(s=>t>=s[0]);if(step&&stepEl.textContent!==step[1])stepEl.textContent=step[1];
  bar.style.width=`${Math.min(100,t/P.duration*100)}%`;
  if(t>=P.duration){finish();return;}raf=requestAnimationFrame(frame);};
 raf=requestAnimationFrame(frame);
 return {el,skip:finish};
}

// Mini rhythm strip along the bottom: SVT continues, with a transient pause after adenosine.
function drawStrip(c,t,kind,hr,converts,rhythm='SVT'){
 const x0=20,y0=360,w=680,h=50;c.fillStyle='#06141a';c.fillRect(x0-6,y0-6,w+12,h+12);
 c.strokeStyle='#123a3a';c.lineWidth=1;for(let gx=x0;gx<x0+w;gx+=17){c.beginPath();c.moveTo(gx,y0);c.lineTo(gx,y0+h);c.stroke();}
 c.strokeStyle='#8af0b5';c.lineWidth=1.6;c.beginPath();
 const secs=6;for(let i=0;i<w;i+=.25){const tt=t-secs+i/w*secs;let rh=rhythm,rate=hr;
  if(kind==='adenosine'&&tt>6.4&&tt<10.2){rh='ASYSTOLE';}
  if(converts&&tt>(kind==='adenosine'?10.2:PROCEDURES[kind].duration-3)){rh='NSR';rate=88;}
  const v=rh==='ASYSTOLE'?(.1*Math.exp(-Math.pow(((tt*1.2)%1)-.5,2)/.002)):waveform(tt,rh,rate);const yy=y0+h*.7-v*h*.42;i?c.lineTo(x0+i,yy):c.moveTo(x0+i,yy);}
 c.stroke();c.fillStyle='#8af0b5';c.font='bold 12px sans-serif';c.fillText('II',x0+4,y0+12);
 const label=kind==='adenosine'&&t>6.4&&t<10.6?'PAUSE — transient AV block':converts&&t>PROCEDURES[kind].duration-2.5?'Sinus rhythm':`${rhythm==='SVT'?'SVT':rhythm==='CHB'?'CHB':rhythm} ${hr}/min`;c.textAlign='right';c.fillText(label,x0+w-4,y0+12);c.textAlign='left';
}

function paBg(c,top='#20343b',bottom='#0e1d22'){const g=c.createLinearGradient(0,0,0,350);g.addColorStop(0,top);g.addColorStop(1,bottom);c.fillStyle=g;c.fillRect(0,0,720,350);}
function paCaption(c,text,x,y,color='#ffe2a8'){c.font='bold 15px sans-serif';c.fillStyle=color;c.fillText(text,x,y);}
function paSkin(c){const g=c.createLinearGradient(0,0,0,40);g.addColorStop(0,'#e3b694');g.addColorStop(1,'#c99271');return g;}

const PA_DRAW={
 valsalva(c,t){paBg(c);
  // Bed recline: 45° (sitting) → flat at 8.2 s → sitting again at 14.2 s.
  const flat=seg(t,8.2,9.2)*(1-seg(t,14.2,15.2)),legs=seg(t,8.6,9.6)*(1-seg(t,14.2,15.2));
  const hipX=330,hipY=270;
  c.fillStyle='#5d7479';c.fillRect(120,282,480,14);c.fillStyle='#d9e4e2';c.fillRect(120,268,480,16);// bed + mattress
  const back=(Math.PI/4)*(1-flat);// torso angle
  c.save();c.translate(hipX,hipY);
  // Legs (thigh + shin), raised by nurse in phase 2.
  c.save();c.rotate(-legs*Math.PI/4);c.fillStyle='#3d6f8f';c.beginPath();c.roundRect?c.roundRect(0,-16,170,32,14):c.rect(0,-16,170,32);c.fill();c.fillStyle='#e0b291';c.beginPath();c.ellipse(178,-4,16,20,0,0,Math.PI*2);c.fill();
  if(legs>.2){c.fillStyle='#2f6f62';c.beginPath();c.ellipse(120,-34,22,14,0,0,Math.PI*2);c.fill();c.strokeStyle='#2f6f62';c.lineWidth=10;c.beginPath();c.moveTo(120,-40);c.lineTo(120+20,-120+legs*10);c.stroke();paCaption(c,'legs 45°',60,-60,'#bff3e2');}
  c.restore();
  // Torso + head.
  c.save();c.rotate(Math.PI+back);c.fillStyle='#7aa7b8';c.beginPath();c.roundRect?c.roundRect(0,-22,150,44,18):c.rect(0,-22,150,44);c.fill();
  c.fillStyle=paSkin(c);c.beginPath();c.arc(178,0,28,0,Math.PI*2);c.fill();
  const blowing=t>1.2&&t<8.2;const cheek=blowing?1+.12*Math.sin(t*6):1;
  c.fillStyle='#d9a688';c.beginPath();c.moveTo(186,26);c.lineTo(178,40);c.lineTo(172,28);c.fill();// nose
  c.fillStyle='#2b2b2b';c.beginPath();c.arc(190,16,3,0,Math.PI*2);c.fill();// eye
  c.fillStyle='#4a3428';c.beginPath();c.arc(186,-8,26,Math.PI*.9,Math.PI*1.9);c.fill();// hair
  c.fillStyle='#d79c80';c.beginPath();c.ellipse(164,22*cheek,8*cheek,7,0,0,Math.PI*2);c.fill();// cheek
  // Arm holding a 10 mL syringe to the lips.
  if(t<8.4){c.strokeStyle='#e0b291';c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(118,20);c.lineTo(126,72);c.lineTo(156,72);c.stroke();
   // 10 mL syringe held at the lips, pointing away from the face; the plunger moves out while she blows.
   c.save();c.translate(160,28);c.fillStyle='#eef6f8';c.fillRect(-6,0,12,64);c.strokeStyle='#90a4ab';c.lineWidth=1;for(let k=1;k<6;k++){c.beginPath();c.moveTo(-6,k*10);c.lineTo(0,k*10);c.stroke();}
   const plunger=blowing?Math.min(18,(t-1.2)*5):0;c.fillStyle='#4a5a60';c.fillRect(-5,40+plunger,10,6);c.fillRect(-1.5,46+plunger,3,26);c.fillRect(-7,72+plunger,14,4);c.fillStyle='#8fa5ad';c.fillRect(-2,-6,4,8);c.restore();}
  c.restore();c.restore();
  // Pressure gauge during the strain.
  if(t>1.2&&t<8.2){const p=Math.min(40,(t-1.2)*25)+Math.sin(t*9)*2;const gx=610,gy=90;c.fillStyle='#0b1a1f';c.beginPath();c.arc(gx,gy,48,0,Math.PI*2);c.fill();c.strokeStyle='#5fe0b5';c.lineWidth=4;c.beginPath();c.arc(gx,gy,40,Math.PI*.75,Math.PI*.75+Math.PI*1.5*(p/60));c.stroke();c.fillStyle='#fff';c.font='bold 22px sans-serif';c.textAlign='center';c.fillText(Math.round(p),gx,gy+8);c.font='11px sans-serif';c.fillText('mmHg',gx,gy+24);c.textAlign='left';
   paCaption(c,`Strain ${Math.max(0,Math.ceil(15-(t-1.2)*15/7))} s`,40,60);}
  if(t>8.2&&t<14.2)paCaption(c,`Flat + legs up ${Math.max(0,Math.ceil(15-(t-8.2)*15/6))} s`,40,60,'#bff3e2');
  if(t<1.2)paCaption(c,'Semi-recumbent 45°',40,60,'#cfe');
  c.font='12px sans-serif';c.fillStyle='#9fb6bb';c.fillText('REVERT trial: modified Valsalva ≈ 3× more effective than the standard maneuver',40,330);
 },
 carotid(c,t){paBg(c,'#2a3a44','#121e24');
  // Right lateral view: face turned to the left (away from the examiner), neck extended.
  c.save();c.translate(380,215);
  const skinG=c.createLinearGradient(-120,-200,120,140);skinG.addColorStop(0,'#e2b493');skinG.addColorStop(1,'#c48a69');
  c.fillStyle=skinG;c.beginPath();c.moveTo(-58,-30);c.lineTo(-78,135);c.lineTo(110,135);c.lineTo(70,-40);c.closePath();c.fill();// neck
  c.beginPath();c.moveTo(70,-60);c.bezierCurveTo(80,-170,30,-230,-30,-225);c.bezierCurveTo(-70,-222,-92,-195,-92,-160);// crown → forehead
  c.lineTo(-100,-140);c.lineTo(-126,-112);c.lineTo(-104,-104);// brow, nose
  c.quadraticCurveTo(-112,-92,-104,-86);c.quadraticCurveTo(-112,-76,-100,-70);// lips
  c.quadraticCurveTo(-108,-48,-84,-42);// chin
  c.quadraticCurveTo(-30,-38,10,-48);c.lineTo(40,-58);c.closePath();c.fill();// jaw to angle
  c.strokeStyle='#9c6a52';c.lineWidth=2;c.beginPath();c.moveTo(-84,-42);c.quadraticCurveTo(-30,-38,12,-50);c.stroke();// jaw line
  c.fillStyle='#3a2a24';c.beginPath();c.moveTo(70,-60);c.bezierCurveTo(84,-170,32,-234,-30,-226);c.bezierCurveTo(-74,-222,-92,-196,-90,-172);c.quadraticCurveTo(-20,-200,30,-150);c.quadraticCurveTo(50,-100,70,-60);c.fill();// hair
  c.fillStyle='#d9a283';c.beginPath();c.ellipse(28,-112,14,22,.2,0,Math.PI*2);c.fill();// ear
  c.fillStyle='#2b2b2b';c.beginPath();c.ellipse(-80,-132,6,3,0,0,Math.PI*2);c.fill();// eye
  // Sternocleidomastoid (shaded band) from mastoid to sternum.
  c.strokeStyle='rgba(150,95,70,.55)';c.lineWidth=18;c.lineCap='round';c.beginPath();c.moveTo(30,-82);c.quadraticCurveTo(0,30,-40,128);c.stroke();
  // Carotid pulse anterior to the SCM at the level of the jaw angle.
  const cx=-14,cy=-22,pulse=.5+.5*Math.sin(t*Math.PI*2*190/60);c.strokeStyle=`rgba(255,110,110,${.35+.45*pulse})`;c.lineWidth=3;c.beginPath();c.arc(cx,cy,9+pulse*6,0,Math.PI*2);c.stroke();
  if(t<4){const k=seg(t,0,1);const sx=cx+180-180*k;c.strokeStyle='#2c3a40';c.lineWidth=4;c.beginPath();c.moveTo(sx+14,cy+6);c.quadraticCurveTo(sx+120,cy+90,sx+230,cy-30);c.stroke();c.fillStyle='#9aa7ad';c.beginPath();c.arc(sx,cy+6,16,0,Math.PI*2);c.fill();c.fillStyle='#5c6a70';c.beginPath();c.arc(sx,cy+6,10,0,Math.PI*2);c.fill();
   if(t>1.2&&t<3.2)paCaption(c,'listening… no bruit',cx+30,cy+70,'#bff3e2');}
  else if(t<11){const a=(t-4.2)*7,fx=cx+Math.cos(a)*6,fy=cy+Math.sin(a)*6,k=seg(t,4,4.6);
   c.save();c.translate(fx+200*(1-k),fy);c.rotate(.25);c.fillStyle='#e6b896';c.strokeStyle='#b98466';c.lineWidth=1.5;for(const o of [-8,8]){c.beginPath();c.roundRect?c.roundRect(0,o-7,130,14,7):c.rect(0,o-7,130,14);c.fill();c.stroke();}c.fillStyle='#dcaa88';c.beginPath();c.ellipse(150,0,44,28,0,0,Math.PI*2);c.fill();c.restore();
   paCaption(c,`Massage ${Math.max(0,Math.ceil(10-(t-4.2)*10/6.8))} s · one side`,cx+40,cy+100);}
  c.restore();
  c.font='12px sans-serif';c.fillStyle='#ffb4a8';c.fillText('Avoid if carotid bruit, prior stroke / TIA or older age · never massage both sides',40,330);
 },
 patch(c,t){paBg(c,'#2b3b40','#121e22');
  // Back view of the patient lying on her side after a log-roll.
  const roll=seg(t,0,1.6);c.save();c.translate(360,190);c.scale(1,.55+.45*roll);
  const skinG=c.createLinearGradient(-200,-140,200,140);skinG.addColorStop(0,'#e4b998');skinG.addColorStop(1,'#c99272');
  c.fillStyle=skinG;c.beginPath();c.moveTo(-210,-120);c.bezierCurveTo(-120,-160,120,-160,210,-120);c.bezierCurveTo(240,-20,220,90,170,150);c.lineTo(-170,150);c.bezierCurveTo(-220,90,-240,-20,-210,-120);c.fill();
  c.strokeStyle='rgba(150,95,72,.55)';c.lineWidth=4;c.beginPath();c.moveTo(0,-140);c.quadraticCurveTo(6,10,0,150);c.stroke();// spine
  c.lineWidth=3;for(const sx of [-1,1]){c.beginPath();c.moveTo(sx*40,-105);c.quadraticCurveTo(sx*120,-115,sx*130,-30);c.quadraticCurveTo(sx*90,-10,sx*45,-40);c.stroke();}// scapulae
  c.fillStyle='#6d8fa0';c.fillRect(-230,140,460,40);// gown edge
  c.restore();
  const found=t>3.2;const peel=[seg(t,5.6,6.8),seg(t,6.6,7.8)];
  const patches=[[-120,170,-.15,'FENTANYL 50 mcg/h','new'],[95,215,.12,'FENTANYL 50 mcg/h','old — not removed']];
  patches.forEach(([px,py,rot,txt,note],i)=>{const p=peel[i];if(p>=1)return;c.save();c.translate(px+p*220,py-p*170);c.rotate(rot+p*1.2);c.globalAlpha=Math.max(0,1-p*.9)*Math.min(1,roll*1.5);
   c.fillStyle='#f3ead8';c.strokeStyle='#bfae8e';c.lineWidth=2;c.beginPath();c.roundRect?c.roundRect(-52,-34,104,68,12):c.rect(-52,-34,104,68);c.fill();c.stroke();
   c.fillStyle='#8a6d3b';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText(txt,0,-4);c.font='10px sans-serif';c.fillText('transdermal system',0,12);c.textAlign='left';c.restore();
   if(found&&p===0){const pulse=.5+.5*Math.sin(t*6);c.strokeStyle=`rgba(255,90,90,${.5+.5*pulse})`;c.lineWidth=4;c.beginPath();c.ellipse(px,py,72+pulse*6,52+pulse*5,rot,0,Math.PI*2);c.stroke();paCaption(c,note,px-48,py+72,'#ffb4a8');}});
  // Gloved hand peeling.
  if(t>5.2&&t<8.2){const which=t<6.6?0:1,[px,py]=patches[which],p=peel[which];c.save();c.translate(px+40+p*220,py-30-p*170);c.rotate(-.5);c.fillStyle='#5aa9e6';c.beginPath();c.ellipse(0,0,38,24,0,0,Math.PI*2);c.fill();for(let k=0;k<3;k++){c.beginPath();c.roundRect?c.roundRect(-46,-20+k*13,30,11,5):c.rect(-46,-20+k*13,30,11);c.fill();}c.restore();}
  if(found&&t<5.4){c.font='bold 22px sans-serif';c.fillStyle='#ff9a8c';c.fillText('2 PATCHES FOUND!',470,70);}
  c.font='12px sans-serif';c.fillStyle='#9fb6bb';c.fillText('Also check skin folds, axillae, scalp and under dressings · keep ventilating throughout',40,330);
 },
 push(c,t,{label}){paBg(c,'#24363c','#0f1c21');c.fillStyle='#24363c';c.fillRect(0,350,720,70);
  // Forearm with IV hub, extension set and a port; drug syringe then flush.
  const lift=seg(t,3.6,4.3)*-.15;c.save();c.translate(70,300);c.rotate(lift);c.fillStyle='#e0b291';c.beginPath();c.roundRect?c.roundRect(0,-30,600,60,30):c.rect(0,-30,600,60);c.fill();c.fillStyle='#ffffffcc';c.fillRect(260,-34,64,28);c.fillStyle='#f4c542';c.fillRect(278,-40,28,10);
  c.strokeStyle='#cfe7ee';c.lineWidth=6;c.beginPath();c.moveTo(292,-40);c.quadraticCurveTo(300,-110,360,-130);c.stroke();c.fillStyle='#e9eef0';c.beginPath();c.arc(362,-132,14,0,Math.PI*2);c.fill();
  const drug=seg(t,1.0,2.2),flush=seg(t,2.4,3.4);const first=t<2.3;
  const push=first?drug:flush,len=first?120:170,r=first?16:22,fluid=first?'#f6d8e8':'#dff1ff',name=first?(label||'DRUG'):'NS 20 mL FLUSH';
  const inX=first?0:seg(t,2.25,2.45)*0;c.save();c.translate(372+inX,-138);c.rotate(-.55);c.fillStyle='#f5fbfc';c.strokeStyle='#8fa5ad';c.lineWidth=1.5;c.beginPath();c.rect(10,-r/2,len,r);c.fill();c.stroke();const fill=(1-push)*(len-14);c.fillStyle=fluid;c.fillRect(12,-r/2+2,fill,r-4);c.fillStyle='#8fa5ad';c.fillRect(0,-3,12,6);const px=12+fill;c.fillStyle='#43525a';c.fillRect(px,-r/2+1,6,r-2);c.fillRect(px+6,-2,len+10-fill,4);c.fillRect(px+len+14-fill,-r/2-4,6,r+8);
  // thumb on the plunger
  c.fillStyle='#d9a888';c.beginPath();c.ellipse(px+len+26-fill,0,16,12,0,0,Math.PI*2);c.fill();c.restore();
  c.save();c.translate(440,-215);c.fillStyle='#ffffff';c.font='bold 16px sans-serif';c.fillText(name,0,0);c.restore();c.restore();
  if(t<1.0){c.font='bold 22px sans-serif';c.fillStyle='#bff3e2';c.fillText('“'+(label||'Drug')+' — confirm?”',40,60);c.font='15px sans-serif';c.fillText('“Confirmed.”',40,88);}
  if(t>1&&t<2.3)paCaption(c,'PUSH',560,60,'#ff9a8c');if(t>2.4&&t<3.5)paCaption(c,'FLUSH',560,60,'#8fd0ff');if(t>3.6)paCaption(c,'Limb up ↑',540,60,'#bff3e2');
 },
 auscultate(c,t,{label='tube'}){{const g=c.createLinearGradient(0,0,0,420);g.addColorStop(0,'#22363d');g.addColorStop(1,'#0f1c21');c.fillStyle=g;c.fillRect(0,0,720,420);}
  const vent=label==='tube'||label==='bvm',breathing=vent||label==='spont';
  const breathAt=[1.4,4.6,7.8,11],br=breathing?Math.max(0,...breathAt.map(b=>Math.sin(Math.PI*Math.min(1,Math.max(0,(t-b)/1.1))))):0;
  const cx=330,cy=272;
  // Patient seen from above: head at the top, chest rises with each breath.
  c.fillStyle='#98cbd1';c.beginPath();c.ellipse(cx,cy+150,210,90,0,0,Math.PI*2);c.fill();
  c.fillStyle=paSkin(c);c.fillStyle='#d9a988';c.beginPath();c.ellipse(cx,cy,168*(1+.035*br),128*(1+.05*br),0,0,Math.PI*2);c.fill();
  c.fillStyle='#cf9c7c';c.fillRect(cx-28,cy-150,56,40);
  c.fillStyle='#e0b291';c.beginPath();c.ellipse(cx,cy-178,46,54,0,0,Math.PI*2);c.fill();
  c.fillStyle='#70727b';c.beginPath();c.ellipse(cx,cy-214,44,22,0,Math.PI,0);c.fill();
  c.fillStyle='#b98568';for(const x of [-60,60]){c.beginPath();c.arc(cx+x,cy-28,5,0,Math.PI*2);c.fill();}
  c.strokeStyle='#c08d6e';c.lineWidth=2;c.beginPath();c.moveTo(cx,cy-110);c.lineTo(cx,cy+40);c.stroke();// sternum
  c.fillStyle='#965c53';c.beginPath();c.ellipse(cx,cy-150,12,4,0,0,Math.PI*2);c.fill();// mouth
  // Airway device.
  const sq=br;if(label==='tube'){c.strokeStyle='#e8f1ee';c.lineWidth=7;c.beginPath();c.moveTo(cx,cy-150);c.quadraticCurveTo(cx-6,cy-205,cx-70,cy-232);c.stroke();c.fillStyle='#222';c.fillRect(cx-6,cy-163,12,4);c.fillStyle='#f4f1e6';c.fillRect(cx-46,cy-153,92,5);c.font='11px sans-serif';c.fillStyle='#bfe3d8';c.fillText('22 cm at the teeth',cx+52,cy-146);}
  if(label==='bvm'){c.fillStyle='#c7e3dacc';c.beginPath();c.ellipse(cx,cy-160,30,22,0,0,Math.PI*2);c.fill();c.strokeStyle='#e8f1ee';c.lineWidth=7;c.beginPath();c.moveTo(cx,cy-176);c.lineTo(cx-70,cy-232);c.stroke();}
  if(vent){c.fillStyle='#89c9af';c.beginPath();c.ellipse(cx-120,cy-238,58*(1-.35*sq),30*(1-.2*sq),-.3,0,Math.PI*2);c.fill();c.fillStyle='#e0b291';c.beginPath();c.ellipse(cx-120,cy-238,22,14+10*sq,-.3,0,Math.PI*2);c.fill();if(sq>.2)paCaption(c,'squeeze',cx-190,cy-262,'#bff3e2');}
  // Stethoscope: epigastrium → left → right (patient's left is on the viewer's right).
  const sites=[[cx,cy+86],[cx+132,cy-6],[cx-132,cy-6],[cx-132,cy-6]],times=[[0,3.4],[3.4,6.6],[6.6,9.8],[9.8,99]];
  let i=times.findIndex(([a,b])=>t>=a&&t<b);if(i<0)i=0;const prev=sites[Math.max(0,i-1)],cur=sites[i],m=i?seg(t,times[i][0],times[i][0]+.6):1;
  const sx=prev[0]+(cur[0]-prev[0])*m,sy=prev[1]+(cur[1]-prev[1])*m;
  c.strokeStyle='#2c3b44';c.lineWidth=5;c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(sx+40,sy-90,620,40,700,20);c.stroke();
  c.fillStyle='#c9d3d8';c.beginPath();c.arc(sx,sy,19,0,Math.PI*2);c.fill();c.fillStyle='#8a979e';c.beginPath();c.arc(sx,sy,12,0,Math.PI*2);c.fill();c.strokeStyle='#eef3f5';c.lineWidth=2;c.beginPath();c.arc(sx,sy,19,0,Math.PI*2);c.stroke();
  const listening=m>.95&&i<3&&br>.15;
  if(listening){if(i===0){c.strokeStyle='#ffb4a8';c.lineWidth=3;c.beginPath();c.arc(sx+44,sy-14,14,0,Math.PI*2);c.moveTo(sx+34,sy-24);c.lineTo(sx+54,sy-4);c.stroke();c.font='bold 13px sans-serif';c.fillStyle='#ffd3cb';c.fillText(label==='tube'||label==='bvm'?'silent — no gurgle':'—',sx+64,sy-9);}
   else if(breathing){c.strokeStyle=`rgba(160,240,210,${.4+.6*br})`;c.lineWidth=3;for(let k=1;k<=3;k++){c.beginPath();c.arc(sx,sy,22+k*12*br,i===1?-.9:Math.PI-.9,i===1?.9:Math.PI+.9);c.stroke();}c.font='bold 13px sans-serif';c.fillStyle='#bff3e2';c.textAlign=i===1?'left':'right';c.fillText('whoosh ✓',sx+(i===1?62:-62),sy+5);c.textAlign='left';}}
  if(!breathing&&i>0&&m>.95&&i<3){c.font='bold 13px sans-serif';c.fillStyle='#ffd3cb';c.fillText('no breath sounds',sx-50,sy+40);}
  // Checklist panel.
  const items=label==='tube'?[['Epigastrium silent',3.4],['Left breath sounds',6.6],['Right breath sounds',9.8],['Equal chest rise',10.4],['ETCO₂ waveform → attach',99]]:[['Epigastrium',3.4],['Left lung',6.6],['Right lung',9.8]];
  c.fillStyle='#0b171bcc';c.fillRect(530,92,178,24+items.length*26);c.font='bold 12px sans-serif';c.fillStyle='#9fb6bb';c.fillText('PLACEMENT CHECK',542,110);
  items.forEach(([txt,at],k)=>{const ok=t>=at;c.font='13px sans-serif';c.fillStyle=ok?'#8af0b5':'#d5e2e4';c.fillText((ok?'✓ ':'○ ')+txt,542,136+k*26);});
  c.font='11px sans-serif';c.fillStyle='#9fb6bb';c.fillText(vent?'Demo timing · real rate: 1 breath every 6 s (10/min)':'Listen through a full breath at each site',430,26);
 },
 adenosine(c,t){paBg(c,'#25373e','#101d22');
  // Forearm with antecubital cannula; arm raises at the end.
  const lift=seg(t,5,6.2)*-.2;c.save();c.translate(120,275);c.rotate(lift);
  c.fillStyle='#e0b291';c.beginPath();c.roundRect?c.roundRect(-40,-26,560,52,26):c.rect(-40,-26,560,52);c.fill();c.fillStyle='#d4a382';c.beginPath();c.ellipse(-46,0,34,30,0,0,Math.PI*2);c.fill();
  c.fillStyle='#ffffffcc';c.fillRect(240,-30,60,26);// dressing
  c.fillStyle='#f4c542';c.fillRect(256,-36,26,10);// yellow cannula hub
  // Extension line to the stopcock.
  c.strokeStyle='#cfe7ee';c.lineWidth=5;c.beginPath();c.moveTo(270,-36);c.quadraticCurveTo(270,-80,300,-96);c.stroke();
  const sx=310,sy=-104;c.fillStyle='#e9eef0';c.beginPath();c.roundRect?c.roundRect(sx-16,sy-12,32,24,6):c.rect(sx-16,sy-12,32,24);c.fill();
  const lever=seg(t,3,3.5)*Math.PI/2;c.save();c.translate(sx,sy);c.rotate(lever);c.fillStyle='#1f6fd1';c.fillRect(-4,-26,8,24);c.restore();
  // Syringe A: adenosine 6 mg / 2 mL (small). Syringe B: 20 mL saline (large).
  const pushA=seg(t,1.8,2.6),pushB=seg(t,3.6,4.8);
  paSyringe(c,sx-20,sy-10,-Math.PI*.82,70,12,pushA,'#f6d8e8','ADENOSINE 6 mg');
  paSyringe(c,sx+20,sy-10,-Math.PI*.18,150,20,pushB,'#dff1ff','NS 20 mL');
  c.restore();
  if(t>1.8&&t<2.7)paCaption(c,'PUSH!',420,70,'#ff9a8c');if(t>3.6&&t<4.9)paCaption(c,'FLUSH!',420,70,'#8fd0ff');if(t>5)paCaption(c,'Arm up ↑',420,70,'#bff3e2');
  c.font='12px sans-serif';c.fillStyle='#9fb6bb';c.fillText('First dose 6 mg, second dose 12 mg · rapid push, then 20 mL flush at once',40,330);
 }
};
function paSyringe(c,x,y,angle,len,r,push,fluid,label){c.save();c.translate(x,y);c.rotate(angle);
 c.fillStyle='#f5fbfc';c.strokeStyle='#8fa5ad';c.lineWidth=1.5;c.beginPath();c.rect(10,-r/2,len,r);c.fill();c.stroke();
 const fill=(1-push)*(len-14);c.fillStyle=fluid;c.fillRect(12,-r/2+2,fill,r-4);
 c.fillStyle='#8fa5ad';c.fillRect(0,-3,12,6);// tip
 const px=12+fill;c.fillStyle='#43525a';c.fillRect(px,-r/2+1,6,r-2);c.fillRect(px+6,-2,len+10-fill,4);c.fillRect(px+len+14-fill,-r/2-4,6,r+8);// plunger
 c.save();c.translate(len*.45,0);if(Math.cos(angle)<0)c.rotate(Math.PI);c.fillStyle='#e7f1f4';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText(label,0,-r/2-6);c.restore();c.restore();}

// Interactive back inspection: the player must find and peel off every patch.
export function playPatchHunt(host,{onDone=()=>{},onCancel=()=>{}}={}){
 document.getElementById('proc-screen')?.remove();
 const el=document.createElement('div');el.id='proc-screen';el.classList.add('interactive');
 el.innerHTML=`<div class="proc-head"><b>INSPECT THE SKIN</b><span>Log-roll · look everywhere · tap each patch to remove it</span><button class="proc-skip" aria-label="Close">✕</button></div><canvas width="720" height="420" aria-label="Patient's back: tap patches to remove them"></canvas><p class="proc-step" role="status">Log-rolling the patient…</p><button class="primary wide patch-done" hidden>Done — all patches removed</button>`;
 host.appendChild(el);const cv=el.querySelector('canvas'),c=cv.getContext('2d'),msg=el.querySelector('.proc-step'),done=el.querySelector('.patch-done');
 const patches=[{x:250,y:170,r:-.15,label:'FENTANYL 25 mcg/h',date:'applied 3 days ago'},{x:470,y:215,r:.12,label:'FENTANYL 50 mcg/h',date:'applied last night'},{x:150,y:268,r:.4,label:'FENTANYL 50 mcg/h',date:'last night · flank'},{x:575,y:118,r:-.3,label:'FENTANYL 25 mcg/h',date:'axilla · old'}];
 let t=0,last=performance.now(),raf=0,removed=0,closed=false;
 const close=(ok)=>{if(closed)return;closed=true;cancelAnimationFrame(raf);el.remove();ok?onDone(removed):onCancel(removed);};
 el.querySelector('.proc-skip').onclick=()=>close(false);done.onclick=()=>close(true);
 cv.onpointerdown=e=>{if(t<1.2)return;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*720/r.width,y=(e.clientY-r.top)*420/r.height;const p=patches.find(p=>!p.peel&&Math.hypot(x-p.x,y-p.y)<60);if(p){p.peel=t;removed++;msg.textContent=removed<patches.length?`Patch removed (${removed}). Keep looking — flanks, axillae, under the gown…`:`All ${patches.length} fentanyl patches removed — she has used fentanyl patches for months (chronic use) and extra ones were added last night.`;if(removed===patches.length)done.hidden=false;}else msg.textContent='Nothing there — keep looking.';};
 const frame=now=>{if(closed)return;t+=Math.min(.25,(now-last)/1000);last=now;
  c.fillStyle='#22343a';c.fillRect(0,0,720,420);const roll=seg(t,0,1.2);
  c.save();c.translate(360,215);c.scale(1,.55+.45*roll);const g=c.createLinearGradient(-220,-160,220,160);g.addColorStop(0,'#e4b998');g.addColorStop(1,'#c99272');c.fillStyle=g;c.beginPath();c.moveTo(-240,-150);c.bezierCurveTo(-130,-190,130,-190,240,-150);c.bezierCurveTo(270,-30,250,110,190,175);c.lineTo(-190,175);c.bezierCurveTo(-250,110,-270,-30,-240,-150);c.fill();
  c.strokeStyle='rgba(150,95,72,.55)';c.lineWidth=4;c.beginPath();c.moveTo(0,-170);c.quadraticCurveTo(6,10,0,175);c.stroke();c.lineWidth=3;for(const sx of [-1,1]){c.beginPath();c.moveTo(sx*45,-125);c.quadraticCurveTo(sx*130,-135,sx*145,-40);c.quadraticCurveTo(sx*100,-15,sx*50,-45);c.stroke();}
  c.fillStyle='#6d8fa0';c.fillRect(-260,165,520,40);c.restore();
  if(roll>=1)for(const p of patches){const k=p.peel?seg(t,p.peel,p.peel+.7):0;if(k>=1)continue;c.save();c.translate(p.x+k*160,p.y-k*140);c.rotate(p.r+k*1.4);c.globalAlpha=1-k*.9;c.fillStyle='#f3ead8';c.strokeStyle='#bfae8e';c.lineWidth=2;c.beginPath();c.roundRect?c.roundRect(-46,-30,92,60,10):c.rect(-46,-30,92,60);c.fill();c.stroke();c.fillStyle='#8a6d3b';c.font='bold 10px sans-serif';c.textAlign='center';c.fillText(p.label,0,-4);c.font='9px sans-serif';c.fillText(p.date,0,12);c.restore();}
  if(roll>=1&&t<1.4)msg.textContent='Tap any patch you find to peel it off.';
  c.font='12px sans-serif';c.fillStyle='#9fb6bb';c.fillText(`Removed: ${removed}`,20,404);
  raf=requestAnimationFrame(frame);};
 raf=requestAnimationFrame(frame);return {el,close};
}
