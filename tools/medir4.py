# Mide el proyecto 4 (y la landing del proyecto 3) en el Chrome de pruebas (WebGL por software).
# Bytes descargados por tipo hasta "lista" y tras recorrer la página, tiempo hasta lista,
# draw calls y triángulos por fotograma, y fotogramas pintados durante un scroll de 4 s.
import asyncio, json, time
from playwright.async_api import async_playwright
ARGS = ['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']
def kind(u):
    if 'three.module' in u: return 'three'
    if '/addons/' in u: return 'addons'
    if 'torre3d' in u: return 'torre3d'
    if 'residencia' in u and u.endswith('.js'): return 'residencia'
    if '/frames/' in u: return 'fotogramas'
    if u.endswith('.woff2'): return 'fuentes'
    if any(u.endswith(e) for e in ('.webp','.png','.jpg','.svg')): return 'imagenes'
    if '/gsap/' in u or '/lenis/' in u: return 'gsap+lenis'
    return 'html/css/js propio'
async def run(b, url, W, H, ready_js, mobile=False):
    ctx = await b.new_context(viewport={'width':W,'height':H}, is_mobile=mobile, has_touch=mobile)
    pg = await ctx.new_page()
    sizes = {}
    async def on_resp(r):
        try: body = await r.body(); sizes[r.url] = len(body)
        except Exception: pass
    pg.on('response', lambda r: asyncio.ensure_future(on_resp(r)))
    t0 = time.time()
    await pg.goto(url)
    await pg.wait_for_function(ready_js, timeout=90000)
    t_ready = time.time() - t0
    await pg.wait_for_timeout(1500)
    at_ready = dict(sizes)
    res = {'ready_s': round(t_ready, 2)}
    has3d = await pg.evaluate("!!window.__lucero && !!window.__lucero.vuelo")
    if has3d:
        res['gl'] = await pg.evaluate("""async()=>{
          const v=window.__lucero.vuelo, r=v.tower.renderer; r.info.autoReset=false; r.info.reset();
          const f0=r.info.render.frame; v.tower.invalidate();
          await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
          const i=r.info; const out={calls:i.render.calls, tris:i.render.triangles, passes:i.render.frame-f0, geos:i.memory.geometries, tex:i.memory.textures, dpr:r.getPixelRatio(), size:[r.domElement.width,r.domElement.height]};
          r.info.autoReset=true; return out}""")
        # fotogramas pintados durante 4 s de scroll continuo por el vuelo
        res['scroll'] = await pg.evaluate("""async()=>{
          const r=window.__lucero.vuelo.tower.renderer; const F=document.querySelector('#plantas').offsetTop;
          let painted=0, last=r.info.render.frame, frames=0; const t0=performance.now();
          await new Promise(ok=>{function step(){ const k=(performance.now()-t0)/4000; scrollTo(0,F*Math.min(1,k)*0.8); frames++;
             if(r.info.render.frame!==last){painted++; last=r.info.render.frame}
             if(k<1) requestAnimationFrame(step); else ok(); } requestAnimationFrame(step)});
          const s=(performance.now()-t0)/1000; return {rafFps:+(frames/s).toFixed(1), paintedFps:+(painted/s).toFixed(1)}}""")
    # recorrer la página entera para que se cargue todo lo diferido
    await pg.evaluate("async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}}")
    await pg.wait_for_timeout(4000)
    def agg(d):
        out = {}
        for u, n in d.items(): out[kind(u)] = out.get(kind(u), 0) + n
        out['TOTAL'] = sum(d.values()); return {k: round(v/1024) for k, v in sorted(out.items())}
    res['kb_hasta_lista'] = agg(at_ready); res['kb_total'] = agg(sizes)
    await ctx.close(); return res
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        R = 'document.documentElement.classList.contains("is-ready")'
        base = 'http://localhost:8765/'
        out = {}
        for name, q, W, H, m in [('completo_1440', '?modo=completo', 1440, 900, False), ('ligero_1440', '?modo=ligero', 1440, 900, False),
                                 ('ligero_390', '', 390, 844, True), ('fotogramas_390', '?modo=fotogramas', 390, 844, True)]:
            out[name] = await run(b, base + 'proyectos/torre-3d/index.html' + q, W, H, R, m)
            print(name, json.dumps(out[name], ensure_ascii=False), flush=True)
        for name, W, H, m in [('p3_1440', 1440, 900, False), ('p3_390', 390, 844, True)]:
            out[name] = await run(b, base + 'landing/index.html', W, H, R, m)
            print(name, json.dumps(out[name], ensure_ascii=False), flush=True)
        json.dump(out, open('/tmp/medidas4.json', 'w'), ensure_ascii=False, indent=1)
        await b.close()
asyncio.run(main())
