// Screen-space packing for a small, stable team roster. No clinical state.
export function layoutLabels(anchors,width,height,boxWidth=156,boxHeight=44){
 const margin=8,gap=6,placed=[];
 const w=Math.min(boxWidth,Math.max(1,width-2*margin)),h=boxHeight;
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 return anchors.map(anchor=>{
  if(!anchor.visible)return {...anchor,visible:false};
  const candidates=[];
  for(let row=-5;row<=5;row++)for(let col=-2;col<=2;col++){
   const x=clamp(anchor.x+col*(w+gap),margin+w/2,width-margin-w/2);
   const y=clamp(anchor.y+row*(h+gap),margin+h/2,height-margin-h/2);
   if(placed.some(p=>Math.abs(p.x-x)<w+gap&&Math.abs(p.y-y)<h+gap))continue;
   candidates.push({x,y,cost:(x-anchor.x)**2+(y-anchor.y)**2});
  }
  candidates.sort((a,b)=>a.cost-b.cost);
  if(!candidates.length)return {...anchor,visible:false};
  const best=candidates[0];placed.push(best);
  return {...anchor,x:best.x,y:best.y,width:w,height:h,visible:true};
 });
}
