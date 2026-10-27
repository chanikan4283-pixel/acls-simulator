// Frame-rate-independent pose transition, kept separate from clinical clocks.
export function smoothValue(current,target,dt,speed=10){return current+(target-current)*(1-Math.exp(-speed*Math.max(0,dt)));}
export const NECK={bottom:.29,top:.44,headBase:.53-.177};
export function procedureBlend(elapsed,duration=.8){const t=Math.max(0,Math.min(1,elapsed/duration));return t*t*(3-2*t);}
export const BVM_ANCHORS={mask:[0,1.50,-.5],leftHand:[.015,1.53,-.51],rightHand:[-.045,1.53,-.51],bagHand:[.12,1.66,-.77]};
// A brief family response, not perpetual talking after history has been taken.
export function facialTargets(state,role,time,historyAt=null,reduced=false){
 const concern=role==='patient'?(state.conscious?(state.unstable?.85:.35):0):role==='family'?(state.rosc?.15:.7):.25;
 const elapsed=historyAt===null?-1:time-historyAt;
 const envelope=elapsed>=0&&elapsed<6?Math.min(1,elapsed/.35,(6-elapsed)/.8):0;
 const speaking=role==='family'&&state.history&&!reduced?Math.max(0,Math.sin(elapsed*5))*Math.max(0,envelope)*.065:0;
 return {concern,speaking};
}
