// ROSCo — the black-cat guide. A 2D SVG mascot with dramatic moods, a speech bubble and optional buttons.
// Single-scope bundle: every top-level name here starts with MASCOT_ / mascot.
const MASCOT_SVG=`<svg class="m-svg" viewBox="0 0 200 210" aria-hidden="true">
 <g class="m-confetti"><rect x="18" y="30" width="9" height="5" fill="#ffd23f"/><rect x="168" y="22" width="8" height="5" fill="#7cedd2"/><rect x="30" y="140" width="7" height="5" fill="#ff7bb0"/><rect x="172" y="120" width="9" height="5" fill="#6fd0ff"/><circle cx="160" cy="60" r="4" fill="#ff7bb0"/><circle cx="40" cy="70" r="3.5" fill="#7cedd2"/></g>
 <path class="m-tail" d="M150 178 C190 172 196 130 176 112 C168 105 160 112 168 120 C182 136 176 160 148 164 Z" fill="#17161d"/>
 <ellipse cx="100" cy="176" rx="56" ry="30" fill="#17161d"/>
 <ellipse cx="76" cy="200" rx="15" ry="8" fill="#17161d"/><ellipse cx="124" cy="200" rx="15" ry="8" fill="#17161d"/>
 <path d="M66 150 Q100 172 134 150" fill="none" stroke="#9aa5ad" stroke-width="4" stroke-linecap="round"/><circle cx="118" cy="163" r="7" fill="#cfd8dc" stroke="#7b8790" stroke-width="2"/>
 <g class="m-head">
  <path d="M44 66 L50 14 L88 44 Z" fill="#17161d"/><path d="M54 54 L57 28 L77 44 Z" fill="#ff8fb3"/>
  <path d="M156 66 L150 14 L112 44 Z" fill="#17161d"/><path d="M146 54 L143 28 L123 44 Z" fill="#ff8fb3"/>
  <ellipse cx="100" cy="92" rx="66" ry="60" fill="#1d1c24"/>
  <path class="m-spikes" d="M40 70 L30 60 L44 62 M160 70 L170 60 L156 62 M70 36 L66 22 L78 32 M130 36 L134 22 L122 32" stroke="#1d1c24" stroke-width="6" stroke-linecap="round" fill="none"/>
  <g class="m-eyes m-eyes-open"><ellipse cx="74" cy="88" rx="18" ry="21" fill="#ffd23f"/><ellipse cx="126" cy="88" rx="18" ry="21" fill="#ffd23f"/>
   <g class="m-pupils"><ellipse cx="74" cy="90" rx="6" ry="14" fill="#111"/><ellipse cx="126" cy="90" rx="6" ry="14" fill="#111"/><circle cx="70" cy="81" r="4" fill="#fff"/><circle cx="122" cy="81" r="4" fill="#fff"/>
    <path class="m-sparkle" d="M78 94 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z M130 94 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z" fill="#fff"/></g>
   <path class="m-lids" d="M54 76 Q74 62 94 80 L94 66 L54 66 Z M146 76 Q126 62 106 80 L106 66 L146 66 Z" fill="#1d1c24"/></g>
  <g class="m-eyes m-eyes-huge"><circle cx="72" cy="88" r="25" fill="#ffd23f"/><circle cx="128" cy="88" r="25" fill="#ffd23f"/><circle cx="72" cy="90" r="4" fill="#111"/><circle cx="128" cy="90" r="4" fill="#111"/></g>
  <g class="m-eyes m-eyes-happy" fill="none" stroke="#ffd23f" stroke-width="7" stroke-linecap="round"><path d="M58 94 Q74 72 90 94"/><path d="M110 94 Q126 72 142 94"/></g>
  <g class="m-eyes m-eyes-closed" fill="none" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"><path d="M58 88 Q74 100 90 88"/><path d="M110 88 Q126 100 142 88"/></g>
  <ellipse class="m-blush" cx="56" cy="112" rx="11" ry="6" fill="#ff7bb0" opacity=".55"/><ellipse class="m-blush" cx="144" cy="112" rx="11" ry="6" fill="#ff7bb0" opacity=".55"/>
  <path d="M94 108 L106 108 L100 115 Z" fill="#ff8fb3"/>
  <g stroke="#c9ced6" stroke-width="2" stroke-linecap="round" opacity=".8"><path d="M40 108 L78 112"/><path d="M40 120 L78 117"/><path d="M160 108 L122 112"/><path d="M160 120 L122 117"/></g>
  <path class="m-mouth m-mouth-smile" d="M86 118 Q93 127 100 118 Q107 127 114 118" fill="none" stroke="#ffb3c9" stroke-width="3.5" stroke-linecap="round"/>
  <g class="m-mouth m-mouth-open"><path d="M84 118 Q100 146 116 118 Z" fill="#7a1530"/><ellipse cx="100" cy="132" rx="8" ry="5" fill="#ff7b9c"/></g>
  <ellipse class="m-mouth m-mouth-o" cx="100" cy="128" rx="9" ry="12" fill="#7a1530"/>
  <path class="m-mouth m-mouth-sad" d="M86 130 Q93 120 100 127 Q107 120 114 130" fill="none" stroke="#ffb3c9" stroke-width="3.5" stroke-linecap="round"/>
  <path class="m-mouth m-mouth-flat" d="M90 124 Q100 121 110 124" fill="none" stroke="#ffb3c9" stroke-width="3.5" stroke-linecap="round"/>
  <g class="m-tears" fill="#7fd3ff"><path d="M62 104 q-6 18 0 46 q6-28 0-46z"/><path d="M138 104 q-6 18 0 46 q6-28 0-46z"/></g>
  <path class="m-sweat" d="M160 58 q-9 14 0 20 q9-6 0-20z" fill="#7fd3ff"/>
  <text class="m-q" x="162" y="40" font-size="34" font-weight="800" fill="#ffd23f">?</text>
 </g></svg>`;
const MASCOT_MOODS=['happy','excited','shocked','cry','worried','proud','thinking','party','cool'];
export function mascotSVG(mood='happy'){return `<div class="mascot-static" data-mood="${mood}">${MASCOT_SVG}</div>`;}
export function createMascot({onSound=()=>{}}={}){
 const el=document.createElement('div');el.className='mascot';el.dataset.mood='happy';el.hidden=true;
 el.innerHTML=`<div class="mascot-bubble" hidden><b class="mascot-name">ROSCo</b><p></p><div class="mascot-actions"></div></div><button type="button" class="mascot-cat" aria-label="ROSCo the cat">${MASCOT_SVG}</button>`;
 const bubble=el.querySelector('.mascot-bubble'),text=bubble.querySelector('p'),acts=bubble.querySelector('.mascot-actions');let timer=0,anim=0;
 const api={el,
  mount(parent,where){if(el.parentNode!==parent)parent.appendChild(el);el.dataset.where=where;el.hidden=false;return api;},
  mood(m){el.dataset.mood=MASCOT_MOODS.includes(m)?m:'happy';el.classList.remove('jump');void el.offsetWidth;el.classList.add('jump');clearTimeout(anim);anim=setTimeout(()=>el.classList.remove('jump'),700);return api;},
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
