import asyncio,sys,json
from playwright.async_api import async_playwright
URL='file:///home/claude/v4/play.html'
async def start(page,case=1,mode='guided'):
    await page.goto(URL); await page.wait_for_timeout(800)
    await page.click(f'[data-case="{case}"]'); await page.wait_for_timeout(300)
    await page.evaluate(f"document.getElementById('mode').value='{mode}'")
    await page.fill('#player-name','QA'); await page.click('#start-case'); await page.wait_for_timeout(500)
async def ff(page,sec):
    await page.evaluate(f"(()=>{{for(let i=0;i<{int(sec*10)};i++)sim.tick(.1);update();}})()")
async def act(page,a): await page.evaluate(f"orderAction('{a}')")
async def browser():
    p=await async_playwright().start(); b=await p.chromium.launch(args=['--use-gl=swiftshader','--autoplay-policy=no-user-gesture-required'])
    pg=await b.new_page(viewport={'width':1600,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
    return p,b,pg,errs
