/* =========================================================
   Vésper · lógica de la landing
   1. Secuencia de fotogramas en canvas controlada por el scroll
   2. Textos por fases (timeline de GSAP con scrub)
   3. Plantas interactivas (SVG sobre imagen)
   4. Residencia 3D (Three.js, se carga solo cuando hace falta)
   5. Historia con imagen fija, menú y formulario
   ========================================================= */
const { gsap, ScrollTrigger, SplitText, Lenis } = window;
gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const portrait = matchMedia('(max-aspect-ratio: 1/1)');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Scroll suave solo con ratón (en táctil el scroll nativo es mejor) ---------- */
let lenis = null;
if (finePointer && !reduce) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
ScrollTrigger.config({ ignoreMobileResize: true });
const scrollToEl = (el) => (lenis ? lenis.scrollTo(el, { offset: 0, immediate: true }) : el.scrollIntoView({ behavior: 'instant', block: 'start' }));

/* =========================================================
   1. Secuencia de fotogramas
   ========================================================= */
const FRAMES = 120;
const canvas = $('.arrival-canvas');
const ctx = canvas.getContext('2d');
const frames = new Array(FRAMES);
let set = portrait.matches ? 'mob' : 'desk';
let current = 0;

const src = (i) => `frames/${set}/${String(i + 1).padStart(4, '0')}.webp`;

// Orden de carga: primero 1 de cada 8 (la secuencia ya «funciona» a saltos), luego el resto
function loadOrder() {
  const first = [], rest = [];
  for (let i = 0; i < FRAMES; i++) (i % 8 === 0 || i === FRAMES - 1 ? first : rest).push(i);
  return { first, rest };
}
function loadFrame(i) {
  return new Promise((res) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { frames[i] = img; res(); };
    img.onerror = res;
    img.src = src(i);
  });
}
async function loadSequence(onProgress) {
  frames.fill(undefined);
  const { first, rest } = loadOrder();
  let done = 0;
  await Promise.all(first.map((i) => loadFrame(i).then(() => onProgress(++done / first.length))));
  // el resto en lotes pequeños para no saturar la red del móvil
  for (let k = 0; k < rest.length; k += 12) await Promise.all(rest.slice(k, k + 12).map(loadFrame));
}
// Si el fotograma exacto aún no está, dibuja el cargado más cercano
function nearest(i) {
  for (let d = 0; d < FRAMES; d++) {
    if (frames[i - d]) return frames[i - d];
    if (frames[i + d]) return frames[i + d];
  }
  return null;
}
function sizeCanvas() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  draw(current);
}
function draw(i) {
  const img = nearest(Math.round(i));
  if (!img) return;
  // object-fit: cover dentro del canvas
  const cw = canvas.width, ch = canvas.height;
  const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}

const counter = $('[data-count]');
const seq = { f: 0 };
loadSequence((p) => {
  counter.textContent = Math.round(p * 100);
  if (p >= 1) start();
});
let started = false;
function start() {
  if (started) return; started = true;
  sizeCanvas();
  document.documentElement.classList.add('is-ready');
  introText();
  ScrollTrigger.refresh();
}
addEventListener('resize', () => { sizeCanvas(); });
// Si se gira el móvil, cambia a la secuencia con el encuadre adecuado
portrait.addEventListener('change', (e) => { set = e.matches ? 'mob' : 'desk'; loadSequence(() => draw(current)).then(() => draw(current)); });

/* =========================================================
   2. Scroll: fotogramas y textos en una sola timeline
   ========================================================= */
const bar = $('.arrival-progress');
if (!reduce) {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.arrival', start: 'top top', end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (st) => bar.style.setProperty('--p', st.progress.toFixed(4)),
    },
  });
  tl.to(seq, { f: FRAMES - 1, duration: 1, onUpdate: () => { current = seq.f; draw(seq.f); } }, 0)
    .to('.phase-1', { autoAlpha: 0, y: -40, duration: 0.1 }, 0.16)
    .to('.scroll-cue', { autoAlpha: 0, duration: 0.05 }, 0.05)
    .fromTo('.phase-2', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.34)
    .to('.phase-2', { autoAlpha: 0, y: -40, duration: 0.08 }, 0.58)
    .fromTo('.phase-3', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.78);
} else {
  start();
}

function introText() {
  if (reduce) return;
  const split = SplitText.create('[data-split]', { type: 'lines', mask: 'lines', linesClass: 'split-line' });
  gsap.from(split.lines, { yPercent: 105, duration: 1.3, ease: 'expo.out', stagger: 0.09, delay: 0.25 });
  gsap.from(['.phase-1 .kicker', '.phase-1 .lead', '.nav'], { autoAlpha: 0, y: 16, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.6 });
}

/* Menú: fondo sólido al bajar y menú a pantalla completa en móvil */
const nav = $('[data-nav]');
ScrollTrigger.create({ start: 80, onUpdate: (st) => nav.classList.toggle('is-solid', st.scroll() > 80) });
const menuBtn = $('.menu-btn');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('.nav-links a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }));
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const t = $(a.getAttribute('href')); if (!t) return;
  e.preventDefault(); lenis ? lenis.scrollTo(t, { duration: 1.4 }) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}));

/* =========================================================
   3. Plantas interactivas
   ========================================================= */
const NF = 30;
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const FLOORS = Array.from({ length: NF }, (_, f) => {
  const residential = f >= 2;
  const total = f >= 26 ? 2 : 3;
  const avail = residential ? (f === 18 ? 2 : Math.floor(hash(f) * (total + 1))) : 0;
  return {
    f, residential, total, avail,
    price: residential ? 1.2 + f * 0.036 + (f >= 26 ? 0.9 : 0) : null,
    view: f < 10 ? 'Puerto y paseo' : f < 22 ? 'Mar y ciudad' : 'Bahía completa',
  };
});
const money = (m) => m.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' M€';
const svg = $('.floors-svg');
const tip = $('.floor-tip');
const fig = $('.floors-figure');
let activeFloor = 18;
const NS = 'http://www.w3.org/2000/svg';

async function buildFloors() {
  const polys = await fetch(portrait.matches ? 'media/plantas-mob.json' : 'media/plantas-desk.json').then((r) => r.json());
  svg.innerHTML = '';
  polys.forEach((pts, f) => {
    const d = FLOORS[f];
    if (!d.residential) return;
    const p = document.createElementNS(NS, 'polygon');
    p.setAttribute('points', pts.map((q) => q.join(',')).join(' '));
    p.dataset.f = f;
    p.setAttribute('tabindex', '0');
    p.setAttribute('role', 'button');
    p.setAttribute('aria-label', `Planta ${f}, ${d.avail ? `${d.avail} de ${d.total} disponibles` : 'vendida'}`);
    if (!d.avail) p.classList.add('sold');
    if (f === activeFloor) p.classList.add('is-active');
    // centro superior del polígono para colocar la etiqueta
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    p.dataset.cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    p.dataset.cy = Math.min(...ys);
    svg.append(p);
  });
}
function showTip(p) {
  const d = FLOORS[+p.dataset.f];
  tip.innerHTML = `Planta <b>${d.f}</b>, ${d.avail ? `${d.avail} disponibles` : 'vendida'}`;
  tip.style.left = p.dataset.cx * 100 + '%';
  tip.style.top = p.dataset.cy * 100 + '%';
  tip.hidden = false;
}
function setFloor(f) {
  const d = FLOORS[f];
  activeFloor = f;
  $$('polygon', svg).forEach((p) => p.classList.toggle('is-active', +p.dataset.f === f));
  // contador con números tabulares: animamos el valor, no el ancho
  const el = $('[data-floor-num]');
  const from = { v: +el.textContent };
  gsap.to(from, { v: f, duration: reduce ? 0 : 0.5, ease: 'power2.out', snap: { v: 1 }, onUpdate: () => (el.textContent = String(from.v).padStart(2, '0')) });
  $('[data-floor-avail]').textContent = d.avail ? `${d.avail} de ${d.total}` : 'Vendida';
  $('[data-floor-price]').textContent = d.avail ? money(d.price) : 'Sin unidades';
  $('[data-floor-view]').textContent = d.view;
  $('[data-open-res]').disabled = !d.avail;
  $('[data-open-res]').textContent = d.avail ? 'Ver la residencia de esta planta' : 'Planta vendida';
}
svg.addEventListener('pointerover', (e) => {
  const p = e.target.closest('polygon'); if (!p) return;
  $$('polygon', svg).forEach((x) => x.classList.toggle('is-hover', x === p));
  if (e.pointerType === 'mouse') showTip(p);
});
svg.addEventListener('pointerleave', () => { $$('polygon', svg).forEach((x) => x.classList.remove('is-hover')); tip.hidden = true; });
svg.addEventListener('click', (e) => { const p = e.target.closest('polygon'); if (p) setFloor(+p.dataset.f); });
svg.addEventListener('keydown', (e) => {
  const p = e.target.closest('polygon'); if (!p) return;
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFloor(+p.dataset.f); }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const list = $$('polygon', svg); const i = list.indexOf(p);
    const n = list[Math.max(0, Math.min(list.length - 1, i + (e.key === 'ArrowUp' ? 1 : -1)))];
    n.focus(); showTip(n);
  }
});
svg.addEventListener('focusin', (e) => { const p = e.target.closest('polygon'); if (p) showTip(p); });
svg.addEventListener('focusout', () => (tip.hidden = true));
buildFloors().then(() => setFloor(18));
portrait.addEventListener('change', buildFloors);

// De la planta a la residencia con una View Transition (si el navegador la tiene)
$('[data-open-res]').addEventListener('click', () => {
  const go = () => {
    $('[data-res-floor]').textContent = `Planta ${activeFloor}`;
    $('.residence .price b').textContent = money(FLOORS[activeFloor].price);
    scrollToEl($('#residencia'));
  };
  if (document.startViewTransition && !reduce) document.startViewTransition(go); else go();
  ensureResidence();
});

/* =========================================================
   4. Residencia 3D: el módulo de Three.js solo se descarga al acercarse
   ========================================================= */
const ROOM_TEXT = {
  salon: 'Doble orientación y chimenea de bioetanol. El sofá mira a la puesta de sol, no a la televisión.',
  cocina: 'Isla de piedra de cuatro metros y comedor para ocho junto al ventanal.',
  principal: 'Suite con vestidor y la cama en el eje de las vistas al puerto.',
  bano: 'Bañera exenta de piedra y ducha a ras de suelo, con luz natural.',
  estudio: 'Un despacho silencioso que también puede ser un tercer dormitorio.',
  terraza: 'Treinta y un metros cuadrados que rodean el salón, con jacuzzi y sombra al mediodía.',
};
let residence = null, loadingRes = null;
const roomsList = $('[data-rooms]');
const detail = $('[data-room-detail]');
function ensureResidence() {
  if (loadingRes) return loadingRes;
  loadingRes = import('./residencia.min.js').then(({ createResidencia, ROOMS }) => {
    roomsList.innerHTML = ROOMS.map((r) => `<li><button type="button" data-room="${r.id}" aria-pressed="false">${r.name}<span>${r.m2} m²</span></button></li>`).join('');
    residence = createResidencia($('.residence-canvas'), {
      onHover: (r) => $$('[data-room]', roomsList).forEach((b) => b.classList.toggle('is-hover', !!r && b.dataset.room === r.id)),
      onFocus: (r) => {
        $$('[data-room]', roomsList).forEach((b) => b.setAttribute('aria-pressed', String(!!r && b.dataset.room === r.id)));
        detail.innerHTML = r ? `<h3>${r.name}</h3><p>${ROOM_TEXT[r.id]}</p>` : '<p>Elige una estancia para entrar en ella.</p>';
      },
    });
    roomsList.addEventListener('click', (e) => {
      const b = e.target.closest('[data-room]'); if (!b) return;
      residence.focus(b.dataset.room);
      // en móvil la maqueta queda arriba (sticky): la subimos a la vista
      if (!finePointer) $('.residence-stage').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    $('[data-res-reset]').addEventListener('click', () => residence.reset());
  });
  return loadingRes;
}
new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { ensureResidence(); o.disconnect(); } }, { rootMargin: '800px 0px' }).observe($('#residencia'));

/* =========================================================
   5. Vida en Vésper: la imagen cambia según el texto activo
   ========================================================= */
const lifeImgs = $$('[data-life]');
const steps = $$('[data-step]');
lifeImgs[0].classList.add('is-on'); steps[0].classList.add('is-on');
const stepIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const i = +en.target.dataset.step;
    steps.forEach((s) => s.classList.toggle('is-on', s === en.target));
    lifeImgs.forEach((img) => img.classList.toggle('is-on', +img.dataset.life === i));
  });
}, { rootMargin: '-45% 0px -45% 0px' });
steps.forEach((s) => stepIO.observe(s));

/* Formulario de demo */
const sel = $('[data-floor-select]');
sel.innerHTML = FLOORS.filter((d) => d.residential && d.avail).map((d) => `<option value="${d.f}" ${d.f === 18 ? 'selected' : ''}>Planta ${d.f}, desde ${money(d.price)}</option>`).join('');
$('.visit-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const note = $('.form-note', f);
  if (!f.checkValidity()) { note.textContent = 'Falta tu nombre o el correo no es válido.'; f.querySelector(':invalid').focus(); return; }
  note.textContent = `Solicitud lista para la planta ${sel.value}. Es una demo: no se ha enviado nada.`;
});
