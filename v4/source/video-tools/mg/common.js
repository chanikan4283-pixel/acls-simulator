const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const eout=x=>{x=clamp(x);return 1-Math.pow(1-x,3)};
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const inout=(t,a,b,c,d)=>Math.min(eout(seg(t,a,b)),1-ease(seg(t,c,d)));
const $=id=>document.getElementById(id);
function show(el,o,{y=0,blur=0,scale=1}={}){el.style.opacity=o;el.style.transform=`translateY(${y}px) scale(${scale})`;el.style.filter=blur?`blur(${blur}px)`:'none';}
// ECG beat shape (normalized), period 1
function ecgBeat(x){const g=(m,w)=>Math.exp(-Math.pow((x-m)/w,2));return .12*g(.18,.03)-.12*g(.33,.008)+1.0*g(.35,.012)-.28*g(.375,.012)+.25*g(.58,.05);}
