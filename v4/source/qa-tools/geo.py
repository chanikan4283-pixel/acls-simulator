import asyncio,sys,json
sys.path.insert(0,'/home/claude/qa')
from pw import *
async def shot(pg,name,pos,look):
    await pg.evaluate(f"(()=>{{ward.desired.set({pos});ward.target.set({look});ward.camera.position.set({pos});ward.look.set({look});ward.camera.lookAt(ward.look);ward.renderer.render(ward.scene,ward.camera);}})()")
    await pg.screenshot(path=f'/home/claude/qa/{name}.png')
async def main():
    p,b,pg,errs=await browser()
    await start(pg,1)
    info=await pg.evaluate("""(()=>{const T=ward.patient.root;T.updateMatrixWorld(true);const w=o=>{const v=o.getWorldPosition(new o.position.constructor());return [v.x,v.y,v.z].map(n=>+n.toFixed(3))};return {mouth:w(ward.patient.mouth),head:w(ward.patient.head),headRot:[ward.patient.head.rotation.x,ward.patient.head.rotation.y,ward.patient.head.rotation.z]}})()""")
    print(info)
    for a in ['pads','bvm']: await act(pg,a)
    await ff(pg,15)
    await act(pg,'intubate'); await ff(pg,12)
    print(await pg.evaluate("({pads:sim.s.pads,int:sim.s.intubated})"))
    # freeze render loop overrides camera: stop by pausing camera update
    await pg.evaluate("(()=>{sim.s.intubated=true;sim.s.bvm=true;const r=ward.renderer,o=r.render.bind(r);r.render=(sc,cam)=>{if(window.__cp){cam.position.copy(window.__cp);cam.lookAt(window.__lk);}o(sc,cam);};return 1})()")
    for name,pos,look in [('geo-chest','0,2.6,-.1','0,1.4,-.1'),('geo-side','1.4,1.7,-.2','0,1.4,-.2'),('geo-head','.55,1.75,-.75','0,1.46,-.48')]:
        await pg.evaluate(f"window.__cp=new ward.camera.position.constructor({pos});window.__lk=new ward.camera.position.constructor({look});")
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=f'/home/claude/qa/{name}.png',clip={'x':0,'y':0,'width':1240,'height':900})
    print(errs[:5])
    await b.close();await p.stop()
asyncio.run(main())
