def P(*a):print(*a,flush=True)
import asyncio
from pw import *
async def main():
    p,b,pg,errs=await browser(); await pg.set_viewport_size({'width':1180,'height':860})
    # case 3
    await start(pg,3); await act(pg,'pulse'); await act(pg,'monitor')
    await pg.evaluate("openPanel('assess')"); await pg.wait_for_timeout(200); await pg.click('[data-action=stability]'); await pg.wait_for_timeout(300)
    P('c3 stable:',await pg.evaluate("sim.events.at(-1).text")); await pg.screenshot(path='b3-assess.png')
    await ff(pg,152); await act(pg,'stability'); P('c3 unstable:',await pg.evaluate("sim.events.filter(e=>e.action==='stability-result').at(-1).text"))
    await act(pg,'pads')
    for e in (100,200):
        await pg.evaluate(f"sim.action('charge',{{energy:{e},sync:true}})"); await ff(pg,4); await pg.evaluate("sim.action('clear');sim.action('shock')")
        P(' after shock',e,await pg.evaluate("[sim.s.rhythm,sim.s.hr,sim.s.bp.join('/'),sim.s.conscious,sim.events.at(-1).text.slice(0,70)]")); await act(pg,'pulse')
    P('c3',await pg.evaluate("[sim.s.rosc,sim.s.score]"))
    # case 4: 12-lead + paced 12-lead + labs + handover gate
    await start(pg,4); await act(pg,'pulse'); await act(pg,'monitor'); await act(pg,'stability'); P('c4:',await pg.evaluate("sim.events.filter(e=>e.action==='stability-result').at(-1).text"))
    await act(pg,'ecg12'); await pg.wait_for_timeout(900); await pg.screenshot(path='b4-12.png'); await pg.evaluate("closeModal()")
    await pg.evaluate("openPanel('investigate')"); await pg.wait_for_timeout(200); await pg.click('[data-lab=tropt]'); await pg.click('[data-lab=elyte]'); await pg.wait_for_timeout(400); await pg.screenshot(path='b4-inv.png')
    P('labs due',await pg.evaluate("Object.keys(sim.s.labDue)"))
    await act(pg,'pads'); await pg.evaluate("openPanel('electrical')"); await pg.evaluate("(()=>{$('pacer-rate').value=70;$('pacer-ma').value=90;$('pacer-btn').click();})()"); await act(pg,'pulse')
    await act(pg,'ecg12'); await pg.wait_for_timeout(900); await pg.screenshot(path='b4-12p.png'); await pg.evaluate("closeModal()")
    await pg.evaluate("openPanel('post')"); await pg.wait_for_timeout(200); await pg.evaluate("$('handover').click()"); await pg.wait_for_timeout(300)
    P('gate: ended?',await pg.evaluate("sim.s.ended")); await pg.screenshot(path='b4-post.png')
    await pg.evaluate("document.querySelector('[data-cause-pick=hypoxia]').click()"); P(' wrong:',await pg.evaluate("$('cause-note').textContent.slice(0,60)"))
    await pg.evaluate("document.querySelector('[data-cause-pick=coronary]').click()"); P(' right:',await pg.evaluate("$('cause-note').textContent")); await pg.evaluate("$('handover').click()"); await pg.wait_for_timeout(300); P(' ended',await pg.evaluate("sim.s.ended"))
    # case 5 patch hunt
    await start(pg,5); await act(pg,'pulse'); await act(pg,'monitor'); await pg.evaluate("window.autoProcedures=false;orderAction('patch')"); await pg.wait_for_timeout(1800)
    box=await pg.evaluate("(()=>{const r=document.querySelector('#proc-screen canvas').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
    for (x,y) in [(250,170),(470,215),(150,268),(575,118)]:
        await pg.mouse.click(box[0]+x*box[2]/720,box[1]+y*box[3]/420); await pg.wait_for_timeout(350)
    await pg.screenshot(path='b5-patch.png'); await pg.wait_for_timeout(2200)
    P('c5 patch',await pg.evaluate("[sim.s.patch,!!document.getElementById('proc-screen'),$('toast').textContent]"))
    # CPR coached after 4 good taps
    await pg.evaluate("window.autoProcedures=true"); await start(pg,1); await act(pg,'pulse'); await act(pg,'cpr'); await ff(pg,125)
    P('fatigued before',await pg.evaluate("[sim.s.fatigued,sim.s.cprRate]"))
    await pg.evaluate("openPractice('cpr')"); await pg.wait_for_timeout(300)
    for i in range(7): await pg.evaluate("document.getElementById('compression-tap')?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))"); await pg.wait_for_timeout(535)
    P('coached',await pg.evaluate("[sim.s.cprRate,sim.s.cprBoostUntil>sim.s.t,$('cpr-coached')?.textContent,$('cpr-coached')?.hidden]")); await pg.screenshot(path='b1-cpr.png')
    P('ERR',errs[:5]); await b.close(); await p.stop()
asyncio.run(main())
