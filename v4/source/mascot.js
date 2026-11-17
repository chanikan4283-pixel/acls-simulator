// ROSCo — the black-cat guide. A 2D SVG mascot with dramatic moods, a speech bubble and optional buttons.
// Single-scope bundle: every top-level name here starts with MASCOT_ / mascot.
import {MASCOT_ART} from './mascot-art.js';
const MASCOT_MOODS=['happy','excited','shocked','cry','worried','proud','thinking','party','cool'];
export function mascotSVG(mood='happy'){return `<div class="mascot-static" data-mood="${mood}"><img alt="" src="${MASCOT_ART[mood]||MASCOT_ART.happy}"></div>`;}
export function createMascot({onSound=()=>{}}={}){
 const el=document.createElement('div');el.className='mascot';el.dataset.mood='happy';el.hidden=true;
 el.innerHTML=`<div class="mascot-bubble" hidden><b class="mascot-name">ROSCo</b><p></p><div class="mascot-actions"></div></div><button type="button" class="mascot-cat" aria-label="ROSCo the cat"><img class="m-img" alt="" src="${MASCOT_ART.happy}"></button>`;
 const bubble=el.querySelector('.mascot-bubble'),text=bubble.querySelector('p'),acts=bubble.querySelector('.mascot-actions');let timer=0,anim=0;
 const api={el,
  mount(parent,where){if(el.parentNode!==parent)parent.appendChild(el);el.dataset.where=where;el.hidden=false;return api;},
  mood(m){el.dataset.mood=MASCOT_MOODS.includes(m)?m:'happy';el.querySelector('.m-img').src=MASCOT_ART[el.dataset.mood];el.classList.remove('jump');void el.offsetWidth;el.classList.add('jump');clearTimeout(anim);anim=setTimeout(()=>el.classList.remove('jump'),700);return api;},
  say(msg,{mood='happy',ms=0,actions=[],sound=true}={}){clearTimeout(timer);api.mood(mood);text.innerHTML=msg;acts.innerHTML='';
   for(const [label,fn,primary] of actions){const b=document.createElement('button');b.type='button';b.textContent=label;if(primary!==false)b.className='primary';b.onclick=e=>{e.stopPropagation();fn();};acts.appendChild(b);}
   acts.hidden=!actions.length;bubble.hidden=false;bubble.classList.remove('pop');void bubble.offsetWidth;bubble.classList.add('pop');if(sound)onSound(mood);
   if(ms)timer=setTimeout(()=>{bubble.hidden=true;api.mood('happy');},ms);return api;},
  quiet(){clearTimeout(timer);bubble.hidden=true;return api;},
  hide(){clearTimeout(timer);bubble.hidden=true;el.hidden=true;return api;},
  get busy(){return !bubble.hidden&&!acts.hidden;}};
 el.querySelector('.mascot-cat').onclick=()=>{if(el.dataset.where==='play'&&!bubble.hidden){api.quiet();return;}const pokes=[['Hey! I’m working here 😼','cool'],['Purr… okay, one pat. ONE.','happy'],['Meow? Need help? Tap Hint on the right.','thinking'],['Don’t poke the cat during a code!! 🙀','shocked']];const [m,mo]=pokes[Math.floor(Math.random()*pokes.length)];api.say(m,{mood:mo,ms:2600});};
 return api;
}
