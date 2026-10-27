import asyncio,sys
sys.path.insert(0,'/home/claude/qa')
from pw import *
async def main():
    p,b,pg,errs=await browser()
    await start(pg,1)
    await act(pg,'monitor'); await ff(pg,3)
    await pg.evaluate("(()=>{sim.rosc();update();return 1})()")
    await pg.click('#interpret-ecg') if await pg.is_visible('#interpret-ecg') else None
    await pg.wait_for_timeout(500)
    for i in range(3):
        el=await pg.query_selector('#review-ecg')
        if el: await el.screenshot(path=f'ecg{i}.png')
        await pg.wait_for_timeout(700)
    print(await pg.evaluate("({cpr:sim.s.cpr,r:sim.s.rhythm,hr:sim.s.hr,comp:teamMotion(sim.s).compressing})"),errs[:3])
    await b.close();await p.stop()
asyncio.run(main())
