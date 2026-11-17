import asyncio
from pw import *
from PIL import Image
async def main():
    p,b,pg,errs=await browser(); await pg.set_viewport_size({'width':1180,'height':820})
    await pg.goto(URL); await pg.wait_for_timeout(900); await pg.evaluate('setGameActive(true)')
    for t,n in [(900,'i1'),(1300,'i2'),(1200,'i3'),(1400,'i4')]:
        await pg.wait_for_timeout(t); await pg.screenshot(path=f'{n}.png')
    await pg.evaluate('skipIntro()'); await pg.wait_for_timeout(1200); await pg.screenshot(path='i5.png')
    await pg.evaluate("document.querySelector('.mascot-mute').click()"); await pg.wait_for_timeout(500); await pg.screenshot(path='i6.png')
    print("quiet",await pg.evaluate("rosco.isQuiet"),errs[:3]); await b.close(); await p.stop()
    o=Image.new('RGB',(2360,2460))
    for k,f in enumerate(['i1','i2','i3','i4','i5','i6']):o.paste(Image.open(f+'.png'),((k%2)*1180,(k//2)*820))
    o.thumbnail((1500,1600));o.save('intro_sheet.png')
asyncio.run(main())
