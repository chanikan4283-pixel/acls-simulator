import asyncio,sys
sys.path.insert(0,'/home/claude/qa')
from pw import *
from playwright.async_api import async_playwright
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':1180,'height':860}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await start(pg,2)
    # speech text conversion
    print(await pg.evaluate("""[
      shortSpeech('Airway: Tube is in. One breath every six seconds'),
      shortSpeech('Epinephrine 1 mg IV/IO given • Repeat every 3–5 min'),
      shortSpeech('Tube placed • Ventilate 1 breath every 6 seconds (10/min)'),
      shortSpeech('Attach waveform ETCO₂ • SpO₂ 88% • do not stop compressions')
    ]"""))
    print('voices available in headless:',await pg.evaluate("speechSynthesis.getVoices().length"))
    for a in ['pulse','cpr','monitor']: await act(pg,a)
    await pg.wait_for_timeout(600)
    # cycle 1 check -> still PEA ; cycle 2 check -> asystole
    await ff(pg,122); await act(pg,'cpr'); await act(pg,'rhythm-check'); r1=await pg.evaluate("[sim.s.rhythm,sim.s.cycleNo]")
    await act(pg,'cpr'); await ff(pg,122); await act(pg,'cpr'); await act(pg,'rhythm-check'); r2=await pg.evaluate("[sim.s.rhythm,sim.s.cycleNo]")
    print('check1',r1,'check2',r2)
    print('room sound fn',await pg.evaluate("typeof roomSound"))
    await pg.evaluate("sim.tick(.1);update()")
    print('ERRORS',errs[:5])
    await b.close(); await p.stop()
asyncio.run(main())
