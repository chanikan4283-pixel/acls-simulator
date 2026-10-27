// Synthetic 12-lead ECG on standard paper (25 mm/s, 10 mm/mV). Educational drawing, not a recording.
const TL_LEADS=[['I','aVR','V1','V4'],['II','aVL','V2','V5'],['III','aVF','V3','V6']];
// TL_QRS shape per lead: [q, r, s] in mV for a normal axis.
const TL_QRS={I:[-.05,.7,-.1],II:[-.05,1.1,-.15],III:[-.1,.6,-.2],aVR:[0,.15,-.85],aVL:[-.05,.35,-.25],aVF:[-.08,.85,-.15],V1:[0,.2,-1.0],V2:[0,.4,-1.3],V3:[0,.8,-.9],V4:[-.05,1.3,-.5],V5:[-.08,1.4,-.25],V6:[-.08,1.1,-.12]};
const TL_PAMP={I:.08,II:.14,III:.07,aVR:-.1,aVL:.04,aVF:.1,V1:.06,V2:.08,V3:.08,V4:.08,V5:.08,V6:.07};
const tlG=(x,m,w)=>Math.exp(-Math.pow((x-m)/w,2));const tlSig=x=>1/(1+Math.exp(-x));

export function twelveLeadProfile(id,s={}){
 if(s.pacing&&s.electricalCapture)return{kind:'paced',atrial:80,vent:s.pacerRate||70,qrsW:.16,st:{},t:{},title:'Paced rhythm (transcutaneous capture)',read:'Pacing spikes followed by wide TL_QRS complexes at the set rate. Confirm mechanical capture by pulse and BP.'};
 if(id===4&&!s.rosc)return{kind:'chb',atrial:84,vent:32,qrsW:.10,
  st:{II:.38,III:.55,aVF:.48,I:-.2,aVL:-.38,aVR:-.12,V1:-.1,V2:-.18,V3:-.1,V4:0,V5:.08,V6:.1},
  t:{II:.35,III:.42,aVF:.38,I:-.22,aVL:-.32,V2:.2,V3:.28,V4:.3,V5:.25,V6:.2},q:{III:-.35,aVF:-.25,II:-.15},
  title:'Inferior STEMI with complete heart block',
  read:'ST elevation in II, III and aVF (III > II) with reciprocal ST depression in I and aVL — acute inferior STEMI (likely RCA). P waves (~84/min) march through independently of the narrow escape TL_QRS (~32/min): complete (third-degree) AV block. Activate the cath lab; consider right-sided leads (V4R).'};
 if(id===1&&!s.rosc)return{kind:'sinus',atrial:88,vent:88,qrsW:.17,pFlat:true,st:{},t:{V1:.6,V2:1.2,V3:1.3,V4:1.2,V5:.9,V6:.7,I:.6,II:.8,III:.4,aVF:.6,aVL:.3,aVR:-.5},peaked:true,
  title:'Pre-arrest tracing: hyperkalemia',read:'Flattened P waves, wide TL_QRS and tall, narrow, peaked T waves across the precordium — severe hyperkalemia. This tracing is from before the collapse.'};
 if(id===3&&!s.rosc)return{kind:'svt',atrial:0,vent:s.hr||190,qrsW:.08,st:{V4:-.1,V5:-.12,V6:-.1,II:-.08},t:{},title:'Regular narrow-complex tachycardia',read:'Regular narrow TL_QRS at ~190/min with no visible P waves — SVT (likely AVNRT). Rate-related ST depression is common.'};
 if(id===5&&!s.rosc&&s.pulse)return{kind:'chb',atrial:76,vent:34,qrsW:.14,st:{},t:{},title:'Complete heart block',read:'P waves march through independently of a slow, wide ventricular escape rhythm: complete AV block. No acute ST elevation.'};
 return{kind:'sinus',atrial:s.hr||84,vent:s.hr||84,qrsW:.09,st:{},t:{},title:'Sinus rhythm',read:'Sinus rhythm with normal intervals. Correlate with the clinical picture.'};
}

function tlLeadValue(lead,tt,p){
 let v=0;const rr=60/Math.max(20,p.vent);
 // Ventricular complexes.
 const ph=((tt%rr)+rr)%rr-.2;// TL_QRS centred 0.2 s into each cycle
 const [q,r,sw]=TL_QRS[lead],w=p.qrsW/4,qx=p.q?.[lead]??q;
 v+=qx*tlG(ph,-w*1.3,w*.6)+r*tlG(ph,0,w)*(p.kind==='paced'?.8:1)+sw*tlG(ph,w*1.4,w*.7);
 if(p.kind==='paced'){v=(r>0?1:-1)*.9*tlG(ph,.03,.05)-.5*(r>0?1:-1)*tlG(ph,.2,.08);v+=(ph>-.042&&ph<-.038)?2.2:0;}
 const st=p.st[lead]||0,tAmp=p.t[lead]??(r>Math.abs(sw)?.3:-.15)*(lead==='aVR'?1:1);
 // ST segment: flat-topped elevation/depression from the J point, merging into the T wave (convex 'dome' in STEMI leads).
 v+=st*Math.exp(-Math.pow((ph-.2)/.165,4))*tlSig((ph-w*1.6)/.006);
 v+=tAmp*tlG(ph,p.peaked?.24:.3,p.peaked?.045:.07);
 // Atrial activity (independent in complete heart block).
 if(p.atrial&&!p.pFlat){const ar=60/p.atrial,pp=((tt%ar)+ar)%ar-.1;v+=TL_PAMP[lead]*tlG(pp,0,.035);}
 if(p.pFlat){const pp=ph+.16;v+=TL_PAMP[lead]*.3*tlG(pp,0,.04);}
 return v;
}

export function drawTwelveLead(canvas,profile){
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,mm=W/280;// 280 mm wide sheet
 c.fillStyle='#fff8f3';c.fillRect(0,0,W,H);
 for(let x=0;x<W;x+=mm){const major=Math.round(x/mm)%5===0;c.strokeStyle=major?'#f0a8a0':'#fbd9d3';c.lineWidth=major?1:.5;c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
 for(let y=0;y<H;y+=mm){const major=Math.round(y/mm)%5===0;c.strokeStyle=major?'#f0a8a0':'#fbd9d3';c.lineWidth=major?1:.5;c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
 const secW=25*mm,mv=10*mm,rowH=(H-40)/4,colW=(W-20)/4;
 c.strokeStyle='#1d1d1d';c.lineWidth=1.4;c.font=`bold ${Math.round(mm*3.2)}px sans-serif`;c.fillStyle='#1d1d1d';
 const trace=(lead,x0,y0,t0,secs)=>{c.beginPath();for(let i=0;i<=secs*secW;i++){const tt=t0+i/secW,y=y0-tlLeadValue(lead,tt,profile)*mv;i?c.lineTo(x0+i,y):c.moveTo(x0+i,y);}c.stroke();};
 TL_LEADS.forEach((row,ri)=>row.forEach((lead,ci)=>{const x0=10+ci*colW,y0=20+ri*rowH+rowH*.6;
  c.beginPath();if(ci===0){c.moveTo(x0,y0);c.lineTo(x0+mm,y0);c.lineTo(x0+mm,y0-mv);c.lineTo(x0+3*mm,y0-mv);c.lineTo(x0+3*mm,y0);c.stroke();}
  trace(lead,x0+(ci===0?4*mm:0),y0,ci*2.5,2.5-(ci===0?4*mm/secW:0));c.fillText(lead,x0+(ci===0?5*mm:4),20+ri*rowH+14);}));
 const y0=20+3*rowH+rowH*.6;trace('II',10,y0,0,(W-20)/secW);c.fillText('II (rhythm)',14,20+3*rowH+14);
 c.font=`${Math.round(mm*2.6)}px sans-serif`;c.fillStyle='#7a5a57';c.fillText('25 mm/s · 10 mm/mV · synthetic teaching ECG',W-mm*70,H-8);
}
