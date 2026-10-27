import asyncio,sys
sys.path.insert(0,'/home/claude/qa')
from pw import *
CAM="(()=>{const r=ward.renderer,o=r.render.bind(r);r.render=(sc,cam)=>{if(window.__cp){cam.position.copy(window.__cp);cam.lookAt(window.__lk);}o(sc,cam);};return 1})()"
async def cam(pg,pos,look,name,clip=True):
    await pg.evaluate(f"(()=>{{const V=ward.camera.position.constructor;window.__cp=new V({pos});window.__lk=new V({look});return 1}})()")
    await pg.wait_for_timeout(700)
    await pg.screenshot(path=f'/home/claude/qa/{name}.png')
async def main():
    p,b,pg,errs=await browser()
    await start(pg,1)
    await pg.evaluate(CAM)
    for a in ['monitor','pads','bvm']: await act(pg,a)
    await ff(pg,8)
    await cam(pg,'.05,2.3,.35','0,1.4,-.12','k-pads')
    await cam(pg,'.9,1.75,.1','0,1.38,-.1','k-pads-side')
    await pg.evaluate("(()=>{sim.s.intubated=true;sim.s.bvm=true;return 1})()")
    await cam(pg,'.45,1.62,-.25','0,1.48,-.48','k-tube')
    await cam(pg,'0,1.95,-.15','0,1.45,-.5','k-tube-top')
    await pg.evaluate("window.__cp=null")
    await act(pg,'auscultate'); await pg.wait_for_timeout(2200)
    await pg.screenshot(path='k-ausc1.png')
    await pg.wait_for_timeout(3000)
    await pg.screenshot(path='k-ausc2.png')
    await pg.wait_for_timeout(7000)
    print(await pg.evaluate("sim.events.slice(-3).map(e=>e.text)"))
    # epi alert
    await pg.evaluate("(()=>{sim.s.epi=1;sim.s.epiLast=sim.s.t;return 1})()")
    await ff(pg,181); await pg.wait_for_timeout(400); await pg.screenshot(path='k-epi1.png')
    await ff(pg,121); await pg.wait_for_timeout(400); await pg.screenshot(path='k-epi2.png')
    print(errs[:5])
    await b.close();await p.stop()
asyncio.run(main())
