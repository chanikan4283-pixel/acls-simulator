import asyncio
from pw import *
from PIL import Image
async def main():
    p,b,pg,errs=await browser(); await pg.set_viewport_size({'width':1180,'height':820})
    await pg.goto(URL); await pg.wait_for_timeout(1000); await pg.evaluate('setGameActive(true)')
    await pg.evaluate("$('trainer-launch').click()"); await pg.wait_for_timeout(1500); await pg.screenshot(path='g-print.png')
    for rid in ['AF','AFLUTTER','CHB']:
        await pg.evaluate(f"(()=>{{trainerIndex=trainerDeck.findIndex(r=>r.id==='{rid}');trainerRound();}})()"); await pg.wait_for_timeout(3800)
        print(rid,'beats',await pg.evaluate("lab.beats.map(t=>t.toFixed(2)).join(' ')"))
        await pg.screenshot(path=f'g-{rid}.png')
    await pg.evaluate("document.querySelector('[data-rhythm=CHB]').click()"); await pg.wait_for_timeout(300); await pg.screenshot(path='g-correct.png')
    print('score',await pg.evaluate("[lab.score,lab.streak,trainerScore]"))
    await pg.evaluate("trainerIndex=TRAINER_SET.length-1;$('trainer-next').click()"); await pg.wait_for_timeout(600); await pg.screenshot(path='g-result.png')
    print(errs[:3]); await b.close(); await p.stop()
    for f in ['print','AF','AFLUTTER','CHB','correct','result']:
        im=Image.open(f'g-{f}.png'); im.thumbnail((900,900)); im.save(f'g-{f}_s.png')
asyncio.run(main())
