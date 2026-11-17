// ROSCo — the black-cat guide (artwork drawn with Codex, embedded by mascot-art.js).
// Moods swap the sticker; extra frames (blink, wave, run, jump, sleep, hero) make him move when they exist.
// Single-scope bundle: every top-level name here starts with MASCOT_ / mascot.
import {MASCOT_ART} from './mascot-art.js';
const MASCOT_MOODS=['happy','excited','shocked','cry','worried','proud','thinking','party','cool','hero','jump','sleep'];
const MASCOT_QUIET_KEY='acls-rosco-quiet';
function mascotFrame(name){return MASCOT_ART[name]||MASCOT_ART.happy;}
export function mascotSVG(mood='happy'){return `<div class="mascot-static" data-mood="${mood}"><img alt="" src="${mascotFrame(mood)}"></div>`;}
export function createMascot({onSound=()=>{},onQuiet=()=>{}}={}){
 const el=document.createElement('div');el.className='mascot';el.dataset.mood='happy';el.hidden=true;
 el.innerHTML=`<div class="mascot-bubble" hidden><b class="mascot-name">ROSCo</b><p></p><div class="mascot-actions"></div></div><div class="mascot-body"><button type="button" class="mascot-cat" aria-label="ROSCo the cat"><img class="m-img" alt="" src="${mascotFrame('happy')}"></button><button type="button" class="mascot-mute" aria-label="Quiet ROSCo" title="Quiet ROSCo"></button></div>`;
 const bubble=el.querySelector('.mascot-bubble'),text=bubble.querySelector('p'),acts=bubble.querySelector('.mascot-actions'),img=el.querySelector('.m-img'),mute=el.querySelector('.mascot-mute');
 let timer=0,anim=0,seq=0,quiet=false;try{quiet=localStorage.getItem(MASCOT_QUIET_KEY)==='1';}catch{}
 const paintQuiet=()=>{el.classList.toggle('is-quiet',quiet);mute.textContent=quiet?'🔕':'🔔';mute.title=quiet?'ROSCo is quiet — tap to let him talk again':'Quiet ROSCo (only answers the Hint button and the tutorial)';};paintQuiet();
 const show=name=>{img.src=mascotFrame(name);};
 const api={el,
  get isQuiet(){return quiet;},
  mount(parent,where){if(el.parentNode!==parent)parent.appendChild(el);el.dataset.where=where;el.hidden=false;return api;},
  mood(m){clearInterval(seq);el.dataset.mood=MASCOT_MOODS.includes(m)&&MASCOT_ART[m]?m:'happy';show(el.dataset.mood);el.classList.remove('jump');void el.offsetWidth;el.classList.add('jump');clearTimeout(anim);anim=setTimeout(()=>el.classList.remove('jump'),700);return api;},
  /* Flip through frames (e.g. ['wave1','wave2']) — only the frames that exist are used. */
  play(frames,{fps=6,loops=3,end='happy'}={}){const f=frames.filter(n=>MASCOT_ART[n]);if(!f.length)return api;clearInterval(seq);let i=0;const total=f.length*loops;show(f[0]);seq=setInterval(()=>{i++;if(i>=total){clearInterval(seq);api.mood(end);return;}show(f[i%f.length]);},1000/fps);return api;},
  say(msg,{mood='happy',ms=0,actions=[],sound=true,force=false}={}){if(quiet&&!force)return api;clearTimeout(timer);api.mood(mood);text.innerHTML=msg;acts.innerHTML='';
   for(const [label,fn,primary] of actions){const b=document.createElement('button');b.type='button';b.textContent=label;if(primary!==false)b.className='primary';b.onclick=e=>{e.stopPropagation();fn();};acts.appendChild(b);}
   acts.hidden=!actions.length;bubble.hidden=false;bubble.classList.remove('pop');void bubble.offsetWidth;bubble.classList.add('pop');if(sound&&!quiet)onSound(mood);
   if(ms)timer=setTimeout(()=>{bubble.hidden=true;api.mood('happy');},ms);return api;},
  quiet(){clearTimeout(timer);bubble.hidden=true;return api;},
  hide(){clearTimeout(timer);clearInterval(seq);bubble.hidden=true;el.hidden=true;return api;},
  get busy(){return !bubble.hidden&&!acts.hidden;}};
 mute.onclick=e=>{e.stopPropagation();quiet=!quiet;try{localStorage.setItem(MASCOT_QUIET_KEY,quiet?'1':'0');}catch{}paintQuiet();
  if(quiet){api.say('Okay, okay… zipping my mouth 🤐 I’ll still answer the <b>Hint</b> button.',{mood:'cool',ms:2600,sound:false,force:true});}
  else api.say('I’m back! Did you miss me? 😻',{mood:'excited',ms:2200});onQuiet(quiet);};
 /* Alive: blink now and then while idle (needs the blink frame). */
 setInterval(()=>{if(el.hidden||!MASCOT_ART.blink||el.dataset.mood!=='happy'||document.hidden)return;show('blink');setTimeout(()=>{if(el.dataset.mood==='happy')show('happy');},150);},3800+Math.random()*1500);
 el.querySelector('.mascot-cat').onclick=()=>{if(el.dataset.where==='play'&&!bubble.hidden){api.quiet();return;}const pokes=[['Hey! I’m working here 😼','cool'],['Purr… okay, one pat. ONE.','happy'],['Meow? Need help? Tap Hint on the right.','thinking'],['Don’t poke the cat during a code!! 🙀','shocked']];const [m,mo]=pokes[Math.floor(Math.random()*pokes.length)];api.say(m,{mood:mo,ms:2600,force:true});api.play(['wave1','wave2'],{fps:5,loops:2,end:mo});};
 return api;
}
