import asyncio,sys,os,base64,time
from playwright.async_api import async_playwright
async def run(name,dur,subs=None,out=None):
    out=out or name
    p=await async_playwright().start();b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':1920,'height':1080});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    cdp=await pg.context.new_cdp_session(pg)
    html=open(f'/home/claude/video/mg/{name}.html').read()
    for k,v in (subs or {}).items(): html=html.replace(k,v)
    open(f'/home/claude/video/mg/_{out}.html','w').write(html)
    await pg.goto(f'file:///home/claude/video/mg/_{out}.html');await pg.wait_for_timeout(1200)
    d=f'/home/claude/video/frames/mg_{out}';os.makedirs(d,exist_ok=True)
    for f in os.listdir(d):os.remove(os.path.join(d,f))
    step=int(os.environ.get('STEP','1'))
    for i in range(0,int(dur*30),step):
        await pg.evaluate(f'render({i/30})')
        r=await cdp.send('Page.captureScreenshot',{'format':'jpeg','quality':92})
        open(f'{d}/{i:05d}.jpg','wb').write(base64.b64decode(r['data']))
    print(name,'done',errs[:3],flush=True);await b.close();await p.stop()
if __name__=='__main__':
    import json;name=sys.argv[1];dur=float(sys.argv[2]);subs=json.loads(sys.argv[3]) if len(sys.argv)>3 else None
    out=sys.argv[4] if len(sys.argv)>4 else None
    asyncio.run(run(name,dur,subs,out))
