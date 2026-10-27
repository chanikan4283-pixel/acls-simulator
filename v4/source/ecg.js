// Educational single-lead synthesis: time constants are seconds, amplitudes are mV.
const gaussian=(x,mu,width)=>Math.exp(-Math.pow((x-mu)/width,2));
const mod=(a,b)=>((a%b)+b)%b;
const phase=(t,rr,offset=.30)=>mod(t-offset+rr/2,rr)-rr/2;
const narrow=(x,rr)=>-.13*gaussian(x,-.023,.008)+1.0*gaussian(x,0,.010)-.25*gaussian(x,.023,.010)+.24*gaussian(x,Math.min(.25,rr*.49),Math.min(.065,rr*.12));
const wide=x=>-.16*gaussian(x,-.052,.018)+.9*gaussian(x,0,.043)-.42*gaussian(x,.064,.023)-.20*gaussian(x,.26,.07);
// Irregular RR event sequence, rather than phase modulation that distorts each QRS.
const afIntervals=[.61,.94,.73,1.45,.82,1.17,.65,1.30,.91,.70,1.52,.78,1.07,.62,1.23,1.04];
const afTotal=afIntervals.reduce((a,b)=>a+b,0),afMean=afTotal/afIntervals.length;
export function afBeatTimes(start,end,hr=110){const scale=60/hr/afMean,period=afTotal*scale,out=[];for(let block=Math.floor((start-.3)/period)-1;block<=Math.ceil((end-.3)/period)+1;block++){let t=block*period+.3;for(const interval of afIntervals){if(t>=start&&t<=end)out.push(t);t+=interval*scale;}}return out;}
export function displayRhythm(s){if(s.adenosinePause&&s.t>=s.adenosinePause[0]&&s.t<s.adenosinePause[1])return 'ASYSTOLE';return s.pacing&&!s.electricalCapture?'PACED_NO_CAPTURE':s.rhythm;}
export function waveform(t,rhythm,hr=75,pacerRate=70){
 const rr=60/Math.max(20,hr||75),x=phase(t,rr);
 if(rhythm==='VF_FINE')return waveform(t,'VF')*.28;
 if(rhythm==='VF_COARSE')return waveform(t,'VF')*1.6;
 if(rhythm==='VF')return (.8+.2*Math.sin(t*1.7))*(.20*Math.sin(t*19+.7*Math.sin(t*2.1))+.16*Math.sin(t*31.2)+.08*Math.sin(t*47.5));
 if(rhythm==='ASYSTOLE')return .004*Math.sin(t*17);
 if(rhythm==='TORSADES')return (.3+.65*Math.pow(Math.sin(t*1.1),2))*Math.sin(t*22)*Math.cos(t*.65);
 if(rhythm==='AF'){let out=.018*Math.sin(t*37)+.012*Math.sin(t*53.7)+.009*Math.sin(t*71);for(const beat of afBeatTimes(t-.5,t+.1,hr))out+=narrow(t-beat,rr);return out;}
 if(rhythm==='MOBITZ1'||rhythm==='MOBITZ2'){
  let out=0;const period=.8,n=Math.floor(t/period);for(let i=n-2;i<=n+1;i++){const step=mod(i,rhythm==='MOBITZ1'?4:3),p=i*period+.10,pr=.18+(rhythm==='MOBITZ1'?step*.06:0);out+=.12*gaussian(t,p,.032);if(step!==(rhythm==='MOBITZ1'?3:2))out+=narrow(t-(p+pr),period);}return out;
 }
 if(rhythm==='CHB')return wide(x)+.12*gaussian(phase(t,.8,.10),0,.032);
 if(rhythm==='PACED_NO_CAPTURE')return waveform(t,'CHB',hr)+1.55*gaussian(phase(t,60/pacerRate,.24),0,.002);
 if(rhythm==='PACED'){const q=phase(t,rr,.30);return 1.55*gaussian(q,-.085,.002)+wide(q);}
 // PEA in these cases (severe acidosis / hypoxia) is shown as a slow, wide idioventricular rhythm without P waves.
 if(rhythm==='PEA')return [-1,0,1].reduce((v,k)=>v+.85*wide(x+k*rr),0);
 if(rhythm==='VT')return [-1,0,1].reduce((v,k)=>{const z=x+k*rr;return v+.95*gaussian(z,-.025,.05)-.75*gaussian(z,.065,.045)-.16*gaussian(z,Math.min(.19,rr*.48),.04);},0);
 return [-1,0,1].reduce((v,k)=>{const z=x+k*rr;return v+narrow(z,rr)+(rhythm==='SVT'?0:.12*gaussian(z,-.17,.032));},0);
}
export class Trace{
 constructor(canvas,{paper=false,seconds=null,gain=1}={}){this.canvas=canvas;this.paper=paper;this.seconds=seconds;this.gain=gain;this.ctx=canvas.getContext('2d');this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();}
 resize(){const r=this.canvas.getBoundingClientRect();const d=Math.min(devicePixelRatio,2);this.canvas.width=Math.max(1,r.width*d);this.canvas.height=Math.max(1,r.height*d);this.ctx.setTransform(d,0,0,d,0,0);this.w=r.width;this.h=r.height;}
 draw(time,rhythm,hr,{active=true,cpr=false,staticStrip=false,pacerRate=70,sync=false}={}){const x=this.ctx,w=this.w,h=this.h;if(!w||!h)return;x.clearRect(0,0,w,h);x.fillStyle=this.paper?'#f8f1e9':'#101e23';x.fillRect(0,0,w,h);
  const pxPerSec=this.seconds?w/this.seconds:100,small=pxPerSec/25,effectiveGain=[.25,.5,1,2].filter(g=>g<=this.gain&&small*10*g<=h*.35).at(-1)||.25,voltage=small*10*effectiveGain;x.lineWidth=.5;for(let n=0;n*small<w;n++){const i=n*small;x.strokeStyle=this.paper?(n%5===0?'#dba8a3':'#efdad2'):(n%5===0?'#263b40':'#192b30');x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();}for(let n=0;n*small<h;n++){const i=n*small;x.strokeStyle=this.paper?(n%5===0?'#dba8a3':'#efdad2'):(n%5===0?'#263b40':'#192b30');x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke();}
  if(!active){x.fillStyle='#83989b';x.font='13px sans-serif';x.textAlign='center';x.fillText('ATTACH MONITOR',w/2,h/2);return;}
  const start=staticStrip?0:time-w/pxPerSec;x.strokeStyle=this.paper?'#293c40':'#9be4b9';x.lineWidth=1.8;x.lineJoin='round';const sig=[];x.beginPath();
  // Sample at ≤2 ms (sub-pixel) so the narrow QRS is never aliased: otherwise R-wave heights jump up and down as the strip scrolls.
  const sub=Math.max(1,Math.ceil(1/(pxPerSec*.002)));let first=true;for(let i=0;i<w;i++){let peak=-1e9;for(let k=0;k<sub;k++){const xi=i+k/sub,t=start+xi/pxPerSec;const signal=waveform(t,rhythm,hr,pacerRate)+(cpr?.12*Math.sin(t*11.52):0);if(signal>peak)peak=signal;const y=h*.62-signal*voltage;if(first){x.moveTo(xi,y);first=false;}else x.lineTo(xi,y);}sig.push(peak);}x.stroke();
  // SYNC mode: the defibrillator marks each detected R wave (no marker on VF / asystole).
  if(sync&&!['VF','ASYSTOLE','VF_FINE','VF_COARSE'].includes(rhythm)){const win=Math.max(4,Math.round(pxPerSec*.12));x.fillStyle=this.paper?'#b0302a':'#ffffff';for(let i=win;i<sig.length-win;i++){if(sig[i]<.45)continue;let peak=true;for(let k=i-win;k<=i+win;k++)if(sig[k]>sig[i]){peak=false;break;}if(peak){const yy=h*.62-sig[i]*voltage-8;x.beginPath();x.moveTo(i-5,yy-9);x.lineTo(i+5,yy-9);x.lineTo(i,yy-1);x.closePath();x.fill();i+=win;}}x.font='bold 10px sans-serif';x.textAlign='right';x.fillText('SYNC',w-8,15);x.textAlign='left';}
  if(rhythm==='PACED'||rhythm==='PACED_NO_CAPTURE'){const rr=60/(rhythm==='PACED'?Math.max(20,hr||70):pacerRate),offset=rhythm==='PACED'?.215:.24;x.beginPath();for(let n=Math.ceil((start-offset)/rr);n*rr+offset<=start+w/pxPerSec;n++){const xx=(n*rr+offset-start)*pxPerSec;x.moveTo(xx,h*.62+.3*voltage);x.lineTo(xx,h*.62-2.1*voltage);}x.save();x.strokeStyle=this.paper?'#1a1a1a':'#ffe066';x.lineWidth=2.4;x.stroke();x.fillStyle=this.paper?'#1a1a1a':'#ffe066';x.font='bold 10px sans-serif';x.textAlign='right';x.fillText(rhythm==='PACED'?'PACING · CAPTURE':'PACING · NO CAPTURE',w-8,28);x.restore();}
  x.fillStyle=this.paper?'#765b59':'#7fa59b';x.font='10px sans-serif';x.textAlign='left';x.fillText(`II · 25 mm/s · ${10*effectiveGain} mm/mV`,10,15);
  for(let n=0;n<w/pxPerSec;n++){x.fillRect(n*pxPerSec,h-10,1,5);x.fillText(`${n}s`,n*pxPerSec+3,h-3);}
 }
}

