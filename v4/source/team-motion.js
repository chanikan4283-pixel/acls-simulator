// AHA 2025 adult arrest teaching choreography. Four seconds for two breaths is
// a simulation timing choice, not a mandated clinical pause duration.
export function compressionDuration(start,end,rate=110,withBreaths=false){
 if(!withBreaths)return Math.max(0,end-start);
 const compress=30*60/rate,cycle=compress+4;
 const total=t=>Math.floor(t/cycle)*compress+Math.min(t%cycle,compress);
 return Math.max(0,total(end)-total(start));
}
export function teamMotion(s){
 const clock=s.teamClock||0,rate=s.cprRate||110,compress=30*60/rate;
 const coordinated=!!s.cpr&&!!s.bvm&&!s.intubated;
 const phase=clock%(compress+4),ventPause=coordinated&&phase>=compress;
 const compressing=!!s.cpr&&!ventPause;
 let breathPhase=-1;
 if(s.bvm&&!s.clear){
  if(coordinated){if(ventPause)breathPhase=(phase-compress)%2;}
  else breathPhase=(s.t||0)%6;
 }
 const assistedRise=breathPhase>=0&&breathPhase<1?Math.sin(Math.PI*breathPhase):0;
 const spontaneous=s.pulse&&!s.bvm&&s.rr>0?Math.max(0,Math.sin((s.t||0)*s.rr/60*Math.PI*2)):0;
 return {compressing,ventPause,compression:compressing?(1-Math.cos(clock*rate/60*Math.PI*2))/2:0,breath:assistedRise||spontaneous,
  label:ventPause?'VENTILATION · 2 BREATHS':compressing?(coordinated?'CPR · 30:2':'CPR · CONTINUOUS'):s.bvm?'ASSISTED VENTILATION':'TEAM READY'};
}
