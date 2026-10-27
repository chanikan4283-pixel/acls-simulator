(()=>{
 const realPerf=performance.now.bind(performance),realDate=Date.now;let now=1000;const epoch=1800000000000;
 performance.now=()=>now;Date.now=()=>epoch+now;
 const OD=Date;window.Date=class extends OD{constructor(...a){if(a.length)super(...a);else super(epoch+now);} static now(){return epoch+now;}};
 let raf=[],id=1;const timers=new Map();
 window.requestAnimationFrame=cb=>{const i=id++;raf.push([i,cb]);return i;};
 window.cancelAnimationFrame=i=>{raf=raf.filter(r=>r[0]!==i);};
 window.setTimeout=(cb,ms=0,...args)=>{const i=id++;timers.set(i,{at:now+Math.max(0,+ms||0),cb,args});return i;};
 window.setInterval=(cb,ms=0,...args)=>{const i=id++;timers.set(i,{at:now+Math.max(1,+ms||0),cb,args,every:Math.max(1,+ms||0)});return i;};
 window.clearTimeout=window.clearInterval=i=>timers.delete(i);
 window.queueMicrotask=window.queueMicrotask;
 window.__vstep=(ms)=>{const end=now+ms;
  for(let guard=0;guard<10000;guard++){let nx=null,nid=null;for(const [i,t] of timers)if(t.at<=end&&(nx===null||t.at<nx.at)){nx=t;nid=i;}if(!nx)break;now=Math.max(now,nx.at);if(nx.every)nx.at+=nx.every;else timers.delete(nid);try{typeof nx.cb==='function'?nx.cb(...nx.args):eval(nx.cb);}catch(e){console.error(e);}}
  now=end;const q=raf;raf=[];for(const [,cb] of q){try{cb(now);}catch(e){console.error(e);}}
  return now;};
})();
