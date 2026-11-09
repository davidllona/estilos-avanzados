/* =========================================================
   Lucero · respaldo sin WebGL
   La llegada vuelve a ser la secuencia de fotogramas del proyecto 3
   y las plantas, polígonos SVG sobre el render fijo de la torre.
   ========================================================= */
const BASE = '../../landing/';
const FRAMES = 120;

export function createFotogramas(canvas, { portrait, onProgress = () => {} }) {
  const ctx = canvas.getContext('2d');
  const set = portrait ? 'mob' : 'desk';
  const frames = new Array(FRAMES);
  let current = 0;
  const src = (i) => `${BASE}frames/${set}/${String(i + 1).padStart(4, '0')}.webp`;
  const load = (i) => new Promise((res) => { const img = new Image(); img.decoding = 'async'; img.onload = () => { frames[i] = img; res(); }; img.onerror = res; img.src = src(i); });

  // primera pasada: 1 de cada 8 (la secuencia ya funciona a saltos); después, el resto en lotes
  const first = [], rest = [];
  for (let i = 0; i < FRAMES; i++) (i % 8 === 0 || i === FRAMES - 1 ? first : rest).push(i);
  let done = 0;
  const ready = Promise.all(first.map((i) => load(i).then(() => onProgress(++done / first.length)))).then(() => { size(); });
  ready.then(async () => { for (let k = 0; k < rest.length; k += 12) await Promise.all(rest.slice(k, k + 12).map(load)); draw(current); });

  function nearest(i) {
    for (let d = 0; d < FRAMES; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; }
    return null;
  }
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    draw(current);
  }
  function draw(i) {
    const img = nearest(Math.round(i)); if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  addEventListener('resize', size);
  return {
    ready,
    setProgress(p) { current = p * (FRAMES - 1); draw(current); },
  };
}

/* Polígonos de las plantas, proyectados desde la misma escena (ver proyecto 3) */
export async function buildPolygons(svg, portrait, floors) {
  const polys = await fetch(`${BASE}media/plantas-${portrait ? 'mob' : 'desk'}.json`).then((r) => r.json());
  const NS = 'http://www.w3.org/2000/svg';
  svg.innerHTML = '';
  polys.forEach((pts, f) => {
    const d = floors[f]; if (!d.residential) return;
    const p = document.createElementNS(NS, 'polygon');
    p.setAttribute('points', pts.map((q) => q.join(',')).join(' '));
    p.dataset.f = f;
    if (!d.avail) p.classList.add('sold');
    svg.append(p);
  });
}
