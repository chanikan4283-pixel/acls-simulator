import asyncio
from pw import *
from PIL import Image
async def main():
    p,b,pg,errs=await browser(); await pg.set_viewport_size({'width':1180,'height':820})
    await start(pg,3); await act(pg,'pulse'); await act(pg,'monitor'); await pg.wait_for_timeout(300)
    await pg.click('#hint-btn'); await pg.wait_for_timeout(600); await pg.screenshot(path='k-hint.png')
    print('hint bubble:',await pg.evaluate("document.querySelector('.mascot-bubble p').textContent"))
    await pg.evaluate("rosco.quiet();lastPlayerAt=-99;idleHintAt=-99"); await ff(pg,25); await pg.evaluate("idleHintTick()"); await pg.wait_for_timeout(500); await pg.screenshot(path='k-idle.png')
    print('idle bubble:',await pg.evaluate("document.querySelector('.mascot-bubble p').textContent"), await pg.evaluate("[...document.querySelectorAll('.mascot-actions button')].map(b=>b.textContent)"))
    # ROSC immediately at a check once requirements met (case 2)
    await start(pg,2); await pg.evaluate("window.autoProcedures=true")
    for a in ['pulse','cpr','monitor','insert-iv','history','exam']: await act(pg,a)
    await ff(pg,22); await pg.evaluate("sim.med('epinephrine',1,'mg','IV');sim.action('labs',{tests:['dtx']})"); await ff(pg,20); await pg.evaluate("sim.med('dextrose',50,'mL','IV');sim.action('fluid-bolus',{ml:500});sim.action('cause',{value:'metabolic'})")
    await ff(pg,10); print('met?',await pg.evaluate("[sim.roscMet(),sim.s.roscReady,Math.round(sim.s.cycle)]"))
    await pg.evaluate("sim.action('cpr');sim.action('rhythm-check')"); print('rosc at early check:',await pg.evaluate("[sim.s.rosc,Math.round(sim.s.t)]"))
    print(errs[:3]); await b.close(); await p.stop()
    for f in ['k-hint','k-idle']:
        im=Image.open(f+'.png'); im.thumbnail((880,880)); im.save(f+'_s.png')
asyncio.run(main())
