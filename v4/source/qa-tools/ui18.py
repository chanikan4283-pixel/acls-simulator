import asyncio,sys
sys.path.insert(0,'/home/claude/qa')
from pw import *
from playwright.async_api import async_playwright
from PIL import Image
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':1180,'height':860}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await start(pg,2)
    print('start rhythm',await pg.evaluate("[sim.s.rhythm,sim.s.hr,sim.c.title]"))
    for a in ['pulse','cpr','monitor']: await act(pg,a)
    await pg.evaluate("orderAction('analyze')"); await pg.wait_for_timeout(300)
    await pg.evaluate("document.querySelector('[data-identify=pea]').click()"); await pg.wait_for_timeout(500)
    print('after PEA call · score',await pg.evaluate("sim.s.score"))
    await pg.screenshot(path='w-pea.png')
    # no epinephrine -> degenerates to asystole
    await ff(pg,155); await pg.wait_for_timeout(400)
    print('after 155 s',await pg.evaluate("[sim.s.rhythm,sim.s.hr,$('flatline-qa').hidden]"))
    await pg.evaluate("flatlineGame()"); await pg.wait_for_timeout(400)
    loose=await pg.evaluate("flLoose")
    await pg.click(f'[data-dot="{loose}"]'); await pg.wait_for_timeout(200)
    await pg.click('[data-gain="2"]'); await pg.wait_for_timeout(200)
    await pg.click('[data-lead="III"]'); await pg.wait_for_timeout(600)
    print('flatline done · score',await pg.evaluate("[sim.s.flatline,sim.s.score]"))
    await pg.screenshot(path='w-flat.png')
    print('ERRORS',errs[:4])
    o=Image.new('RGB',(2360,860)); o.paste(Image.open('w-pea.png'),(0,0)); o.paste(Image.open('w-flat.png'),(1180,0))
    o.thumbnail((1700,1700)); o.save('p18-case2.png')
    await b.close(); await p.stop()
asyncio.run(main())
