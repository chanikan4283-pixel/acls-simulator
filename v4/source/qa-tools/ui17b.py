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
    for a in ['pulse','cpr','monitor']: await act(pg,a)
    await ff(pg,6); await pg.wait_for_timeout(500)
    await pg.screenshot(path='z-qa.png')
    print('flat qa hidden?',await pg.evaluate("$('flatline-qa').hidden"))
    await pg.evaluate("orderAction('analyze')"); await pg.wait_for_timeout(300)
    await pg.evaluate("document.querySelector('[data-identify=asystole]').click()"); await pg.wait_for_timeout(500)
    await pg.screenshot(path='z-proto.png')
    # tap the protocol card's flat-line button -> should open the game
    await pg.evaluate("document.querySelector('[data-protocol=flatline]').click()"); await pg.wait_for_timeout(600)
    print('game open?',await pg.evaluate("!!document.getElementById('fl-game')"))
    await pg.screenshot(path='z-game.png')
    print('ERRORS',errs[:4])
    o=Image.new('RGB',(2360,860))
    for k,f in enumerate(['z-proto','z-game']):o.paste(Image.open(f+'.png'),(k*1180,0))
    o.save('z17.png'); await b.close(); await p.stop()
asyncio.run(main())
