// Presentation duration is a teaching convention, not a measured clinical time.
export const AIRWAY_SECS=8.4;
export class AirwayProcedure {
 constructor(){this.pending=null;}
 start(session){if(this.pending)return false;this.pending={session,elapsed:0};return true;}
 advance(dt,state){
  if(!this.pending)return false;
  if(state.ended||state.session!==this.pending.session){this.pending=null;return false;}
  if(state.paused||state.clear)return false;
  this.pending.elapsed+=Math.max(0,dt);
  if(this.pending.elapsed>=AIRWAY_SECS){this.pending=null;return true;}
  return false;
 }
 snapshot(){if(!this.pending)return null;const progress=Math.min(1,this.pending.elapsed/AIRWAY_SECS);return {progress,label:progress<.16?'Pre-oxygenate · position':progress<.55?'Laryngoscopy':progress<.76?'Pass the tube':'Cuff up · connect bag'};}
 cancel(){this.pending=null;}
}
