import asyncio
from pw import *
from PIL import Image
def P(*a):print(*a,flush=True)
async def main():
    p,b,pg,errs=await browser(); await pg.set_viewport_size({'width':1180,'height':820})
    await pg.goto(URL); await pg.wait_for_timeout(1000); await pg.evaluate('setGameActive(true)'); await pg.wait_for_timeout(1200); await pg.screenshot(path='t-home.png')
    await pg.evaluate("document.querySelector('.mascot-actions button.primary').click()"); await pg.wait_for_timeout(600); await pg.screenshot(path='t-intro.png')
    await pg.fill('#player-name','QA'); await pg.click('#start-case'); await pg.wait_for_timeout(800); await pg.evaluate('skipCutscene()'); await pg.wait_for_timeout(1200)
    shots={13:'t-lab',24:'t-trop',23:'t-rosc'}
    for guard in range(200):
        st=await pg.evaluate("tut?[tut.i,(document.querySelector('.tut-target')||{}).id||(document.querySelector('.tut-target')||{}).dataset&&JSON.stringify(document.querySelector('.tut-target').dataset)||null,document.querySelector('.mascot-bubble p')?.textContent.slice(0,60)]:null")
        if st is None: P('tutorial over'); break
        i,tg,txt=st
        if i in shots: await pg.screenshot(path=shots.pop(i)+'.png')
        btn=await pg.evaluate("(()=>{const b=document.querySelector('.mascot-actions button.primary');if(b&&b.offsetParent){b.click();return b.textContent;}return null})()")
        if btn: P(i,'btn',btn); await pg.wait_for_timeout(500); continue
        if i==21:
            await pg.evaluate("(()=>{const t=document.querySelector('.tut-target');if(!t)return;if(t.id==='dose-other'){t.value='1';t.dispatchEvent(new Event('input',{bubbles:true}));}else t.click();})()")
        else:
            await pg.evaluate("document.querySelector('.tut-target')?.click()")
        P(i,tg,'|',txt); await pg.wait_for_timeout(1500 if i in (7,8,9,16,17,18) else 700)
        if i in (11,): await ff(pg,21)
    await pg.wait_for_timeout(1200); await pg.screenshot(path='t-report.png')
    P('final',await pg.evaluate("[sim?sim.s.score:null,sim?sim.s.ended:null,sim?sim.s.errors.map(e=>e.key):null]"))
    P('ERR',errs[:4]); await b.close(); await p.stop()
asyncio.run(main())
