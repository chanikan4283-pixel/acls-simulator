import asyncio
from playwright.async_api import async_playwright
from PIL import Image
URL='file:///home/claude/v4/play.html'
async def run(p,name,w,h):
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=1,is_mobile=True,has_touch=True,user_agent='Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')
    await ctx.add_init_script('window.NO_INTRO=true')
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_timeout(900);await pg.evaluate('setGameActive(true)');await pg.wait_for_timeout(700)
    await pg.screenshot(path=f'{name}-home.png')
    over=await pg.evaluate("document.documentElement.scrollWidth>innerWidth+1")
    await pg.tap('[data-case="1"]');await pg.wait_for_timeout(400);await pg.fill('#player-name','iPad');await pg.tap('#start-case');await pg.wait_for_timeout(500);await pg.evaluate('skipCutscene()');await pg.wait_for_timeout(800)
    await pg.evaluate("window.autoProcedures=true")
    await pg.tap('#dock [data-panel="assess"]');await pg.wait_for_timeout(300);await pg.tap('[data-action="pulse"]');await pg.wait_for_timeout(400)
    await pg.tap('#resume-cpr');await pg.wait_for_timeout(600)
    await pg.tap('#dock [data-panel="meds"]');await pg.wait_for_timeout(400);await pg.screenshot(path=f'{name}-meds.png')
    # small tap targets in view
    small=await pg.evaluate("""[...document.querySelectorAll('button,select,input,[data-action]')].filter(e=>e.offsetParent&&getComputedStyle(e).visibility!=='hidden').map(e=>{const r=e.getBoundingClientRect();return {t:(e.id||e.dataset.action||e.textContent.trim()).slice(0,28),w:Math.round(r.width),h:Math.round(r.height)}}).filter(o=>o.w>0&&(o.w<36||o.h<36))""")
    await pg.tap('#dock [data-panel="meds"]');await pg.wait_for_timeout(300)
    ff=await pg.evaluate("!$('ff-cycle').hidden");
    if ff: await pg.tap('#ff-cycle');await pg.wait_for_timeout(500)
    await pg.screenshot(path=f'{name}-ff.png')
    st=await pg.evaluate("[Math.round(sim.s.cycle),sim.s.cpr,$('toast').textContent.slice(0,80)]")
    fs=await pg.evaluate("!$('fs-btn').hidden")
    dock=await pg.evaluate("[...document.querySelectorAll('#dock button')].map(b=>{const r=b.getBoundingClientRect();return Math.round(r.right)<=innerWidth&&r.bottom<=innerHeight}).every(Boolean)")
    print(name,'overflowX',over,'ff shown',ff,'after ff',st,'fs btn',fs,'dock fully visible',dock,'small targets',small[:8],'ERR',errs[:2])
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p,'ipadL',1180,820); await run(p,'ipadP',820,1180); await run(p,'mini',1133,744)
asyncio.run(main())
for n in ['ipadL-meds','ipadP-meds','mini-ff','ipadP-home']:
    im=Image.open(n+'.png');im.thumbnail((900,900));im.save(n+'_s.png')
