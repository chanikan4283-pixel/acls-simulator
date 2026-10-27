import asyncio,sys,json;sys.path.insert(0,'/home/claude/qa')
from pw import *
async def med(pg,drug,dose,unit,route='IV'):
    await pg.evaluate("openPanel('meds')")
    await pg.evaluate(f"(()=>{{$('drug').value='{drug}';$('dose').value='{dose}';$('unit').value='{unit}';$('route').value='{route}';$('give-med').click();}})()")
async def shock(pg,energy=200,sync='off',check=True):
    await pg.evaluate("openPanel('electrical')")
    if check:
        await act(pg,'analyze'); await ff(pg,1); await pg.evaluate("document.querySelector('[data-identify]')?.click()"); await pg.evaluate("openPanel('electrical')")
    await pg.evaluate(f"(()=>{{$('energy').value='{energy}';$('sync').value='{sync}';$('charge-btn').click();}})()"); await ff(pg,3.2)
    await act(pg,'clear'); await act(pg,'shock'); await act(pg,'resume-cpr')
async def reveal(pg):
    await act(pg,'analyze'); await ff(pg,.5)
async def handover(pg,spo2=95,mp=70,co2=40,temp=36,hrs=36):
    await pg.evaluate("openPanel('post')"); await act(pg,'pulse'); await act(pg,'commands')
    await pg.evaluate(f"(()=>{{for(const [k,v] of [['post-spo2',{spo2}],['post-map',{mp}],['post-co2',{co2}],['post-temp',{temp}],['post-hours',{hrs}]])if($(k))$(k).value=v;$('handover').click();}})()")
async def state(pg): return json.loads(await pg.evaluate("JSON.stringify({t:Math.round(sim.s.t),score:sim.s.score,ended:sim.s.ended,post:sim.s.post,rosc:sim.s.rosc,errors:sim.s.errors.map(e=>e.key+':'+e.points),last:sim.events.slice(-2).map(e=>e.text)})"))
async def case1(pg):
    await start(pg,1); await act(pg,'pulse'); await act(pg,'cpr'); await act(pg,'monitor'); await act(pg,'pads'); await act(pg,'bvm')
    await shock(pg,check=False)
    await pg.evaluate("openPanel('meds')"); await act(pg,'insert-iv'); await act(pg,'history'); await act(pg,'labs')
    await ff(pg,120); await shock(pg); await med(pg,'epinephrine',1,'mg')
    await ff(pg,120); await shock(pg); await med(pg,'amiodarone',300,'mg')
    await pg.evaluate("openHT()"); await pg.evaluate("(()=>{$('cause-choice').value='hyperk';$('set-cause').disabled=false;$('set-cause').click();$('ht-window').remove();})()")
    await ff(pg,12); await reveal(pg); await pg.screenshot(path='/home/claude/qa/c1-rosc.png')
    await pg.evaluate("openPanel('post')"); await act(pg,'repeat-k'); await act(pg,'dialysis'); await handover(pg)
async def case2(pg):
    await start(pg,2); await act(pg,'pulse'); await act(pg,'cpr'); await act(pg,'monitor'); await act(pg,'insert-io'); await act(pg,'labs'); await act(pg,'history'); await act(pg,'exam')
    await ff(pg,16); await med(pg,'epinephrine',1,'mg','IO'); await act(pg,'bvm')
    await pg.evaluate("openPanel('meds')"); await pg.evaluate("$('give-bolus').click()")
    await ff(pg,80); await med(pg,'dextrose',50,'mL','IO')

    await ff(pg,10); await reveal(pg); await handover(pg)
async def case3(pg):
    await start(pg,3); await act(pg,'pulse'); await act(pg,'monitor'); await pg.evaluate("openPanel('electrical')"); await act(pg,'vagal')
    await pg.evaluate("openPanel('meds')"); await act(pg,'insert-iv'); await ff(pg,31); await med(pg,'adenosine',6,'mg'); await ff(pg,5); await med(pg,'adenosine',12,'mg'); await ff(pg,16)
    await act(pg,'pulse'); await act(pg,'pads'); await act(pg,'sedate'); await pg.evaluate("openPanel('electrical')"); await pg.evaluate("(()=>{$('energy').value='100';$('sync').value='on';$('charge-btn').click();})()"); await ff(pg,3.2); await act(pg,'clear'); await act(pg,'shock'); await act(pg,'pulse'); await pg.evaluate("openPanel('electrical')"); await pg.evaluate("(()=>{$('energy').value='200';$('sync').value='on';$('charge-btn').click();})()"); await ff(pg,3.2); await act(pg,'clear'); await act(pg,'shock'); await act(pg,'pulse')
    await pg.evaluate("openPanel('post')"); await pg.evaluate("$('handover').click()")
async def case4(pg):
    await start(pg,4); await act(pg,'pulse'); await act(pg,'monitor'); await act(pg,'history'); await act(pg,'ecg12'); await pg.wait_for_timeout(500); await pg.evaluate("closeModal()"); await pg.evaluate("openPanel('meds')"); await act(pg,'insert-iv'); await ff(pg,31); await med(pg,'atropine',1,'mg')
    await act(pg,'pads'); await pg.evaluate("openPanel('electrical')"); await pg.evaluate("(()=>{$('pacer-rate').value=70;$('pacer-ma').value=90;$('pacer-btn').click();})()"); await act(pg,'pulse'); await act(pg,'cath')
    await pg.evaluate("openPanel('post')"); await pg.evaluate("$('handover').click()")
async def case5(pg):
    await start(pg,5); await act(pg,'pulse'); await act(pg,'monitor'); await act(pg,'bvm'); await act(pg,'history'); await pg.evaluate("sim.action('patch')"); await act(pg,'naloxone')
    await pg.evaluate("openPanel('meds')"); await act(pg,'insert-iv'); await ff(pg,182); await act(pg,'pulse'); await act(pg,'cpr'); await med(pg,'epinephrine',1,'mg')
    await ff(pg,40); await reveal(pg); await ff(pg,40); await act(pg,'naloxone'); await act(pg,'infusion'); await handover(pg,temp=36)
async def main():
    p,b,pg,errs=await browser()
    which=[int(a) for a in sys.argv[1:]] or [1,2,3,4,5]
    fs={1:case1,2:case2,3:case3,4:case4,5:case5}
    for i in which:
        await fs[i](pg); st=await state(pg); print('CASE',i,json.dumps(st)[:900],flush=True)
    await pg.screenshot(path='/home/claude/qa/end.png')
    print('ERRS',errs[:8]); await b.close(); await p.stop()
if __name__=='__main__': asyncio.run(main())
