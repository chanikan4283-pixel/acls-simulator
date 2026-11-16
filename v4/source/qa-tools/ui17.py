import asyncio,sys
sys.path.insert(0,'/home/claude/qa')
from pw import *
from playwright.async_api import async_playwright
from PIL import Image
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':1180,'height':860}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
    await start(pg,2)
    for a in ['pulse','cpr','monitor','insert-io','history','exam','temp']: await act(pg,a)
    await ff(pg,10)
    # flat-line protocol game
    await pg.evaluate("flatlineGame()"); await pg.wait_for_timeout(700)
    await pg.screenshot(path='y-fl1.png')
    loose=await pg.evaluate("flLoose")
    print('loose lead',loose)
    await pg.click('[data-dot="%s"]'%('RA' if loose!='RA' else 'LA')); await pg.wait_for_timeout(300)
    await pg.click('[data-dot="%s"]'%loose); await pg.wait_for_timeout(400)
    await pg.click('[data-gain="1"]'); await pg.wait_for_timeout(250)
    await pg.click('[data-gain="2"]'); await pg.wait_for_timeout(350)
    await pg.screenshot(path='y-fl2.png')
    await pg.click('[data-lead="II"]'); await pg.wait_for_timeout(250)
    await pg.click('[data-lead="III"]'); await pg.wait_for_timeout(600)
    await pg.screenshot(path='y-fl3.png')
    print('flatline state',await pg.evaluate("[sim.s.flatline,JSON.stringify(sim.s.flatlineSteps),sim.s.score]"))
    await pg.evaluate("closeFlatline()")
    # labs + pocus so the Hs&Ts board has something to sync
    await pg.evaluate("openPanel('investigate')"); await pg.wait_for_timeout(200)
    await pg.evaluate("document.querySelector('input[value=dtx]').click();document.querySelector('input[value=abg]').click();$('send-labs').click()")
    await ff(pg,65); await pg.wait_for_timeout(300)
    await pg.evaluate("closePanel();openHT()"); await pg.wait_for_timeout(500); await pg.screenshot(path='y-ht.png')
    whys=await pg.evaluate("[...document.querySelectorAll('#ht-window .ht-why')].filter(x=>!x.hidden).map(x=>x.textContent)")
    print('ht why lines:',len(whys)); [print('  ',w) for w in whys]
    await pg.evaluate("document.getElementById('ht-window').remove()")
    # CPR game ETCO2
    await act(pg,'bvm'); await pg.wait_for_timeout(200); await act(pg,'intubate')
    for _ in range(12):
        await pg.wait_for_timeout(400)
        if await pg.evaluate("sim.s.intubated"): break
    await act(pg,'etco2'); await pg.wait_for_timeout(300)
    print('airway',await pg.evaluate("[sim.s.intubated,sim.s.capno]"))
    print('cue',await pg.evaluate("$('compression-cue').textContent"))
    await pg.evaluate("openPractice('cpr')"); await pg.wait_for_timeout(300)
    await pg.evaluate("sim.action('cpr-coached')"); await ff(pg,2); await pg.wait_for_timeout(400)
    print('etco2 boosted',await pg.evaluate("[Math.round(sim.s.etco2),$('cpr-co2').textContent,sim.s.cprBoostUntil>sim.s.t]"))
    await pg.screenshot(path='y-cpr.png')
    # post-ROSC quiz
    await pg.evaluate("sim.action('epi');sim.s.roscReady=true;sim.revealRosc?.();sim.rosc()"); await pg.wait_for_timeout(200)
    await pg.evaluate("openPanel('post')"); await pg.wait_for_timeout(300); await pg.screenshot(path='y-post1.png')
    await pg.evaluate("orderAction('commands')"); await pg.wait_for_timeout(300)
    await pg.evaluate("openPanel('post')"); await pg.wait_for_timeout(300)
    for k,v in [('spo2','94'),('map','65'),('co2','40'),('temp','36'),('hours','36')]:
        await pg.click(f'[data-pq="{k}"][data-pqv="{v}"]'); await pg.wait_for_timeout(120)
    await pg.screenshot(path='y-post2.png')
    print('hidden values',await pg.evaluate("['spo2','map','co2','temp','hours'].map(k=>$('post-'+k)?.value)"))
    await pg.click('#handover'); await pg.wait_for_timeout(700)
    print('post done',await pg.evaluate("[sim.s.post,sim.s.ended,sim.s.score,(sim.s.postReview||[]).filter(i=>!i.ok).length]"))
    await pg.screenshot(path='y-report.png')
    print('ERRORS',errs[:6])
    o=Image.new('RGB',(2360,3440))
    for k,f in enumerate(['y-fl1','y-fl2','y-fl3','y-ht','y-cpr','y-post1','y-post2','y-report']):o.paste(Image.open(f+'.png'),((k%2)*1180,(k//2)*860))
    o.save('y17.png'); await b.close(); await p.stop()
asyncio.run(main())
