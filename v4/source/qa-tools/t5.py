import asyncio
from pw import *
async def main():
    p,b,pg,errs=await browser(); await pg.set_viewport_size({'width':1180,'height':860})
    await start(pg,5); await act(pg,'pulse'); await act(pg,'monitor'); await pg.evaluate("window.autoProcedures=false;orderAction('patch')"); await pg.wait_for_timeout(6000)
    for (x,y) in [(250,170),(470,215),(150,268),(575,118)]:
        box=await pg.evaluate("(()=>{const r=document.querySelector('#proc-screen canvas').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
        await pg.mouse.click(box[0]+x*box[2]/720,box[1]+y*box[3]/420); await pg.wait_for_timeout(500)
        print(box,await pg.evaluate("document.querySelector('#proc-screen .proc-step')?.textContent.slice(0,50)"),flush=True)
    await pg.screenshot(path='b5-patch.png'); await pg.wait_for_timeout(2500)
    print('c5 patch',await pg.evaluate("[sim.s.patch,!!document.getElementById('proc-screen'),$('toast').textContent,sim.s.score]"))
    # coached with a fake clock
    await pg.evaluate("window.autoProcedures=true"); await start(pg,1); await act(pg,'pulse'); await act(pg,'cpr'); await ff(pg,125)
    print('before',await pg.evaluate("[sim.s.fatigued,sim.s.cprRate]"))
    await pg.evaluate("openPractice('cpr')"); await pg.wait_for_timeout(300)
    print(await pg.evaluate("""(()=>{const real=performance.now.bind(performance);let T=real();performance.now=()=>T;
      for(let i=0;i<7;i++){T+=545;document.getElementById('compression-tap').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));}
      performance.now=real;return [sim.s.cprRate,sim.s.fatigued,sim.s.cprBoostUntil>sim.s.t,$('cpr-coached').textContent,$('toast').textContent];})()"""))
    await pg.wait_for_timeout(300); await pg.screenshot(path='b1-cpr.png')
    print('ERR',errs[:5]); await b.close(); await p.stop()
asyncio.run(main())
