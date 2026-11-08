# Renderiza la torre con Playwright. Sirve la raíz del repo en el puerto 8000 y ejecuta, por ejemplo:
#   python3 tools/torre/renderizar.py seq desk 2560 1440 35 false 120
#   python3 tools/torre/renderizar.py seq mob 1440 2560 52 true 120
# Después: ffmpeg -i frames-render/desk/%04d.png -vf scale=1280:720 -c:v libwebp -quality 72 landing/frames/desk/%04d.webp
import sys, asyncio, base64, json, os, time
from playwright.async_api import async_playwright
ARGS=['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist']
async def open_page(p):
    b = await p.chromium.launch(args=ARGS)
    pg = await b.new_page(viewport={'width':800,'height':600})
    logs=[]; pg.on('console', lambda m: logs.append(m.text)); pg.on('pageerror', lambda e: logs.append('ERR '+str(e)))
    await pg.goto('http://localhost:8000/tools/torre/escena.html')
    for _ in range(100):
        if await pg.evaluate('window.ready===true'): break
        await asyncio.sleep(0.2)
    else: print('\n'.join(logs)); raise SystemExit('not ready')
    return b, pg, logs
def save(data, path):
    open(path,'wb').write(base64.b64decode(data.split(',')[1]))
async def main():
    mode = sys.argv[1]
    async with async_playwright() as p:
        b, pg, logs = await open_page(p)
        if mode == 'test':
            await pg.evaluate('setupSeq(960,540,35,false)')
            for t in [0,0.35,0.7,1.0]:
                save(await pg.evaluate(f'frameSeq({t})'), f'frames-render/tower_{t}.png')
        elif mode == 'seq':
            name, w, h, fov, mobile, n = sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), sys.argv[6], int(sys.argv[7])
            out=f'frames-render/{name}'; os.makedirs(out, exist_ok=True)
            await pg.evaluate(f'setupSeq({w},{h},{fov},{mobile})')
            t0=time.time()
            for i in range(n):
                save(await pg.evaluate(f'frameSeq({i/(n-1)})'), f'{out}/{i+1:04d}.png')
                if i%10==0: print(i, round(time.time()-t0,1), flush=True)
        elif mode == 'shot':
            name, w, h, fov, pos, look, polys = sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), sys.argv[6], sys.argv[7], sys.argv[8] if len(sys.argv)>8 else ''
            save(await pg.evaluate(f'shot({w},{h},{fov},[{pos}],[{look}])'), f'frames-render/{name}.png')
            if polys: json.dump(await pg.evaluate('floorPolys()'), open(polys,'w'))
        if logs: print('LOGS:', '\n'.join(logs[:10]))
        await b.close()
asyncio.run(main())
