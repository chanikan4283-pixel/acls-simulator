import asyncio,sys;sys.path.insert(0,'/home/claude/video')
from rec import *
async def seg2():
    r=Rec('c2');await r.open();await startcase(r,2)
    await r.js("orderAction('pulse');orderAction('cpr');orderAction('monitor');orderAction('insert-io');orderAction('bvm');return 1");await adv(r,14)
    await r.js("openPanel('investigate');return 1");await adv(r,.6)
    await r.js("document.querySelector('input[value=dtx]').click();$('send-labs').click();return 1");await adv(r,17)
    await r.sub('PEA — look beyond the rhythm.','Case 2 · Non-shockable');await r.hold(1.3)
    await r.tap('#open-ht');await r.hold(1.2)
    await r.sub('Glucose 36 mg/dL. Treat the cause.','Hs & Ts');await r.hold(1.6);await r.close()
async def seg3():
    r=Rec('c3');await r.open();await startcase(r,3)
    await r.js("orderAction('pulse');orderAction('monitor');openPanel('meds');orderAction('insert-iv');return 1");await adv(r,24)
    await r.sub('Stable SVT at 190/min.','Case 3 · Tachycardia');await r.hold(1.0)
    await give(r,'adenosine',6,('Adenosine 6 mg — rapid push, then flush.','Case 3 · Tachycardia'))
    await r.hold(4.2);await r.close()
async def seg4():
    r=Rec('c4');await r.open();await startcase(r,4)
    await r.js("orderAction('pulse');orderAction('monitor');orderAction('history');return 1");await adv(r,2)
    await r.sub('Inferior STEMI with complete heart block.','Case 4 · Bradycardia')
    await r.tap('[data-panel="assess"]');await r.hold(.4);await r.tap('[data-action="ecg12"]');await r.hold(2.4)
    await r.js("closeModal();openPanel('meds');orderAction('insert-iv');return 1");await adv(r,22)
    await r.js("sim.med('atropine','1','mg','IV');orderAction('pads');openPanel('electrical');$('pacer-rate').value=70;$('pacer-ma').value=90;return 1");await adv(r,1)
    await r.sub('Transcutaneous pacing — confirm capture with a pulse.','Case 4 · Bradycardia')
    await r.tap('#pacer-btn','charge');await r.hold(2.6);await r.close()
async def seg5():
    r=Rec('c5');await r.open();await startcase(r,5)
    await r.js("orderAction('pulse');orderAction('monitor');orderAction('bvm');return 1");await adv(r,3)
    await r.sub('Megacode: pacing, arrest — and a hidden cause.','Case 5 · Megacode');await r.hold(.4)
    await r.js("orderAction('patch');return 1");await r.hold(1.6)
    for (x,y) in [(250,170),(470,215),(150,268)]:
        await tapcanvas(r,'#proc-screen canvas',x,y); await r.hold(.7)
    await r.sub('Hidden fentanyl patches. Remove — then naloxone.','Case 5 · Toxicology');await r.hold(1.4);await r.close()
async def seg6():
    r=Rec('c6');await r.open()
    await r.js("try{localStorage.clear()}catch(e){};return 1")
    await r.tap('#trainer-launch');await r.hold(1.0)
    await r.sub('Train your eye on every ACLS rhythm.','ECG coach');await r.hold(1.0)
    for i in range(2):
        await r.js("const r=trainerDeck[trainerIndex];document.querySelector(`[data-rhythm=\"${r.id}\"]`).id='vo-ans';return 1")
        await r.tap('#vo-ans','good');await r.hold(1.6)
        await r.js("$('trainer-next').click();return 1");await r.hold(.6)
    await r.close()
async def main():
    which=sys.argv[1:] or ['2','3','4','5','6']
    for w in which: await globals()['seg'+w]()
asyncio.run(main())
