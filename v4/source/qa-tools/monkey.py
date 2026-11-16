import asyncio,sys,random
from pw import *
async def main():
    p,b,pg,errs=await browser(); await pg.set_viewport_size({'width':1180,'height':860})
    for case in [2,3,4,5]:
        for rnd in range(2):
            await start(pg,case); await pg.evaluate("window.autoProcedures=%s"%('true' if rnd else 'false'))
            random.seed(case*10+rnd); log=[]
            for step in range(110):
                r=await pg.evaluate("""(seed)=>{if(!sim)return 'nosim';const els=[...document.querySelectorAll('#dock button,#drawer button,#drawer select,#quick-actions button,#ht-window button,#fl-game button,#modal button,#proc-screen button,#stage-top button,#idle-hint')].filter(e=>e.offsetParent&&!e.disabled&&!/exit-confirm|brand|sound-toggle|voice-toggle|lock/.test(e.id));if(!els.length)return 'none';const e=els[Math.floor(seed*els.length)];const lab=(e.id||e.dataset.action||e.textContent.trim().slice(0,24));try{e.click();}catch(x){return 'THROW '+lab+' '+x.message;}return lab;}""",random.random())
                log.append(r)
                if 'THROW' in str(r): print('!!',case,r,flush=True)
                if random.random()<.35: await ff(pg,random.choice([2,5,15]))
                if step%10==9: await pg.wait_for_timeout(120)
                if errs: print('ERR case',case,'after',log[-4:],errs[:2],flush=True); errs.clear()
            st=await pg.evaluate("sim?[Math.round(sim.s.t),sim.s.score,sim.s.ended,sim.s.rosc]:null"); print('case',case,rnd,st,flush=True)
    await b.close(); await p.stop()
asyncio.run(main())
