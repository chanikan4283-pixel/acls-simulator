import asyncio,os,json,time
from playwright.async_api import async_playwright
URL='file:///home/claude/v4/play.html'
FPS=30
OVERLAY_CSS="""
#vo-sub{position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:99999;font:600 34px 'Inter Display','Inter',sans-serif;letter-spacing:-.01em;color:#fff;text-align:center;max-width:1500px;text-shadow:0 2px 18px #000c,0 0 2px #000;opacity:0;transition:opacity .35s ease;pointer-events:none;white-space:pre-line;line-height:1.25}
#vo-sub small{display:block;font:500 22px 'Inter',sans-serif;color:#9fe8d4;letter-spacing:.18em;text-transform:uppercase;margin-bottom:10px}
#vo-sub.on{opacity:1}
.vo-tap{position:fixed;z-index:99998;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;border:3px solid #fff;background:radial-gradient(circle,#ffffff66,#ffffff00 70%);pointer-events:none;animation:votap .7s ease-out forwards}
@keyframes votap{0%{transform:scale(.35);opacity:1}100%{transform:scale(1.25);opacity:0}}
#vo-skip{position:fixed;inset:0;z-index:99997;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 50%,#0c2a30ee,#020809f5);color:#fff;font:700 64px 'Inter Display',sans-serif;opacity:0;transition:opacity .25s;pointer-events:none}
#vo-skip.on{opacity:1}#vo-skip small{font:500 24px Inter;color:#8fd8c8;letter-spacing:.2em;margin-top:14px}
"""
SYNC_ANIM="""(vt)=>{document.body.classList.remove('lg-refract-on');for(const a of document.getAnimations()){if(a.__s===undefined){a.__s=vt-(a.currentTime||0);}try{a.pause();a.currentTime=vt-a.__s;}catch(e){}}}"""
class Rec:
    def __init__(s,name,w=1600,h=900,dpr=1.2,dry=False):
        s.dpr=dpr;s.dry=dry
        s.name=name;s.dir=f'/home/claude/video/frames/{name}';os.makedirs(s.dir,exist_ok=True)
        for f in os.listdir(s.dir):os.remove(os.path.join(s.dir,f))
        s.n=0;s.vt=0;s.w=w;s.h=h;s.events=[]  # sound cue log (time sec, name)
    async def open(s,url=URL):
        s.p=await async_playwright().start()
        s.b=await s.p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        s.ctx=await s.b.new_context(viewport={'width':s.w,'height':s.h},device_scale_factor=s.dpr)
        s.pg=await s.ctx.new_page();s.errs=[];s.cdp=await s.ctx.new_cdp_session(s.pg)
        s.pg.on('pageerror',lambda e:s.errs.append(str(e)))
        await s.ctx.add_init_script(path='/home/claude/video/vclock.js')
        await s.pg.goto(url)
        for _ in range(20): await s.pg.evaluate('__vstep(50)')
        await s.pg.add_style_tag(content=OVERLAY_CSS)
        await s.pg.evaluate("(()=>{for(const id of ['vo-sub','vo-skip']){const d=document.createElement('div');d.id=id;document.body.appendChild(d);}return 1})()")
    def t(s):return s.n/FPS
    def cue(s,name,dt=0):s.events.append((round(s.t()+dt,3),name))
    async def frame(s):
        if s.dry:
            s.dn=getattr(s,'dn',0)+1
            if s.dn%3: s.n+=1; return
            await s.pg.evaluate('__vstep(100)'); s.vt+=100
            if s.dn%15: s.n+=1; return
        else:
            await s.pg.evaluate('__vstep(%f)'%(1000/FPS)); s.vt+=1000/FPS
        await s.pg.evaluate(SYNC_ANIM,s.vt)
        r=await s.cdp.send('Page.captureScreenshot',{'format':'jpeg','quality':90})
        import base64;open(f'{s.dir}/{s.n:05d}.jpg','wb').write(base64.b64decode(r['data']))
        s.n+=1
    async def hold(s,sec):
        for _ in range(int(round(sec*FPS))):await s.frame()
    async def js(s,code):return await s.pg.evaluate(f"(()=>{{{code}}})()")
    async def sub(s,text,kicker=''):
        html=(f'<small>{kicker}</small>' if kicker else '')+text
        await s.pg.evaluate("([h])=>{const e=document.getElementById('vo-sub');e.innerHTML=h;e.classList.toggle('on',!!h);}",[html])
    async def tap(s,sel,sound='tap',click=True):
        box=await s.pg.evaluate("(sel)=>{const e=document.querySelector(sel);if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}",sel)
        if not box: print('MISSING',sel); return False
        await s.pg.evaluate("([x,y])=>{const d=document.createElement('div');d.className='vo-tap';d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),900)}",box)
        s.cue(sound)
        await s.hold(.12)
        if click: await s.pg.evaluate("(sel)=>document.querySelector(sel).click()",sel)
        return True
    async def close(s):
        await s.b.close();await s.p.stop()
        json.dump({'frames':s.n,'fps':FPS,'cues':s.events},open(f'/home/claude/video/frames/{s.name}.json','w'))

async def jump(r,secs,title,kicker='TIME SKIP'):
    await r.pg.evaluate("([t,k])=>{const e=document.getElementById('vo-skip');e.innerHTML=t+'<small>'+k+'</small>';e.classList.add('on')}",[title,kicker])
    r.cue('whoosh'); await r.hold(.45)
    await r.pg.evaluate(f"(()=>{{for(let i=0;i<{int(secs*10)};i++)sim.tick(.1);update();return 1}})()")
    await r.hold(.75)
    await r.pg.evaluate("(()=>{document.getElementById('vo-skip').classList.remove('on');return 1})()")
    await r.hold(.35)
async def give(r,drug,dose=None,sub=None):
    await r.tap('[data-panel="meds"]'); await r.hold(.5)
    await r.tap(f'.mc-card[data-drug="{drug}"]'); await r.hold(.45)
    if dose is not None:
        sel=await r.pg.evaluate("(d)=>{const c=[...document.querySelectorAll('#order-sheet .chip[data-dose]')];const m=c.find(x=>x.dataset.dose==String(d))||c.at(-1);m.id='vo-dose';return m.textContent}",dose)
        await r.tap('#vo-dose'); await r.hold(.35)
    if sub: await r.sub(*sub)
    await r.tap('#give-order','push'); await r.hold(.3)

async def adv(r,sec):
    for _ in range(int(sec*10)): await r.pg.evaluate('__vstep(100)')
    r.vt+=sec*1000
async def startcase(r,n):
    await r.js("try{localStorage.clear()}catch(e){};return 1")
    await r.js(f"document.querySelector('[data-case=\"{n}\"]').click();return 1"); await adv(r,.5)
    await r.js("$('player-name').value='Dr. Praew';$('start-case').click();return 1"); await adv(r,1.0)

async def tapcanvas(r,sel,px,py,W=720,H=420,sound='tap'):
    xy=await r.pg.evaluate("([sel,px,py,W,H])=>{const c=document.querySelector(sel);const b=c.getBoundingClientRect();return [b.left+px*b.width/W,b.top+py*b.height/H]}",[sel,px,py,W,H])
    await r.pg.evaluate("([x,y])=>{const d=document.createElement('div');d.className='vo-tap';d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),900)}",xy)
    r.cue(sound); await r.hold(.12)
    await r.pg.evaluate("([sel,x,y])=>{document.querySelector(sel).dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,bubbles:true}))}",[sel]+xy)
