/* =========================================================
   Lucero · lógica de la landing
   1. Modo: completo, ligero (móvil o equipo modesto) o fotogramas (sin WebGL)
   2. Scroll → progreso de la cámara, capítulos y contador
   3. Selector de planta: raycast, resaltado, vuelo y ficha anclada
   4. Residencia 3D bajo demanda con etiquetas ancladas
   5. Menú, enlaces y formulario
   ========================================================= */
import { FLOORS, NF, ROOMS, money, pad } from './datos.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* =========================================================
   1. Modo
   ========================================================= */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const tallMQ = matchMedia('(max-aspect-ratio: 4/5), (max-width: 760px)');
const params = new URLSearchParams(location.search);

function webglOK() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();   // la sonda no debe ocupar un contexto
    return true;
  } catch { return false; }
}
const saveData = navigator.connection?.saveData === true;
let mode = params.get('modo');
if (!['completo', 'ligero', 'fotogramas'].includes(mode)) {
  if (!webglOK() || saveData) mode = 'fotogramas';
  else if (coarse || innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4) mode = 'ligero';
  else mode = 'completo';
}
document.documentElement.dataset.mode = mode;

/* ---------- Carga ---------- */
const loaderBar = $('[data-loader-bar]');
const loaderState = $('[data-loader-state]');
const setLoad = (p) => loaderBar.style.setProperty('--p', p.toFixed(3));
const ready = () => document.documentElement.classList.add('is-ready');

/* =========================================================
   2. Escena: torre en tiempo real o secuencia de respaldo
   ========================================================= */
const stage = $('[data-stage]');
const towerCanvas = $('[data-tower]');
let vuelo = null, seq = null;

async function start3D() {
  setLoad(0.25);
  const { createVuelo } = await import('./vuelo.js');   // Three.js solo se descarga si se va a usar
  setLoad(0.7);
  vuelo = createVuelo(towerCanvas, { lite: mode === 'ligero', reduce, onFrame });
  vuelo.setDimmed((f) => !FLOORS[f].residential || !FLOORS[f].avail);
  window.__lucero = { vuelo, mode };
  towerCanvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); startFallback(); });
  onScroll();
  // dos fotogramas: el primero compila los shaders, el segundo ya está en pantalla
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  setLoad(1); setTimeout(ready, 250);
}

async function startFallback() {
  if (seq) return;
  if (vuelo) { vuelo.pause(); vuelo = null; }
  mode = 'fotogramas'; document.documentElement.dataset.mode = mode;
  loaderState.textContent = 'Cargando la secuencia';
  const { createFotogramas, buildPolygons } = await import('./fotogramas.js');
  seq = createFotogramas($('[data-seq]'), { portrait: tallMQ.matches, onProgress: (p) => setLoad(0.1 + p * 0.9) });
  await buildPolygons($('[data-fb-svg]'), tallMQ.matches, FLOORS);
  $('[data-fb]').hidden = false;
  wirePolygons();
  await seq.ready;
  onScroll(); ready();
}

(mode === 'fotogramas' ? startFallback() : start3D()).catch((err) => { console.warn('Lucero: sin 3D, se usa la secuencia', err); startFallback(); });

/* =========================================================
   3. Scroll: progreso, capítulos y modo selector
   ========================================================= */
const track = $('.track');
const anchor = $('#plantas');
const chaps = $$('.chap').map((el) => ({ el, a: +el.dataset.in, b: +el.dataset.out }));
const bar = $('[data-progress]');
const nav = $('[data-nav]');
let progress = 0, picking = false, ticking = false;

function onScroll() {
  ticking = false;
  const scrolled = -track.getBoundingClientRect().top;
  const F = anchor.offsetTop || 1;
  progress = clamp(scrolled / F, 0, 1);
  if (vuelo) vuelo.setProgress(progress);
  if (seq) seq.setProgress(progress);
  bar.style.setProperty('--p', progress.toFixed(4));
  stage.classList.toggle('is-flying', progress > 0.02);

  for (const c of chaps) {
    const o = smooth(c.a - 0.05, c.a + 0.01, progress) * (1 - smooth(c.b - 0.04, c.b + 0.02, progress));
    c.el.style.opacity = o.toFixed(3);
    c.el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
    c.el.style.transform = `translateY(${((1 - o) * (progress > c.b - 0.04 ? -28 : 28)).toFixed(1)}px)`;
  }
  setPicking(scrolled >= F - 4);
  nav.classList.toggle('is-solid', scrollY > 80 && !picking && progress >= 1);
  if (!vuelo) updateHud();
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', () => { onScroll(); placeFicha(); });

/* =========================================================
   Contador de planta (altímetro durante el vuelo, selector después)
   ========================================================= */
const hud = { floor: $('[data-alt-floor]'), m: $('[data-alt-m]'), label: $('[data-alt-label]'), gauge: $('[data-gauge]'), mark: $('[data-gauge-mark]') };
let hudText = '', selected = 18, hovered = -1, focused = null;

function setHud(label, floor, metres, g) {
  const t = `${label}|${floor}|${metres}`;
  if (t !== hudText) {
    hudText = t;
    hud.label.textContent = label;
    hud.floor.textContent = pad(floor);
    if (metres != null) hud.m.textContent = `a ${metres} m sobre el mar`;
  }
  hud.mark.style.setProperty('--g', clamp(g, 0, 1).toFixed(4));
}
function updateHud() {
  if (picking) {
    const f = hovered >= 0 ? hovered : (focused ?? selected);
    setHud('Planta', f, Math.round(f * 3.2 + 1.2 + 1.6), f / (NF - 1));
    hud.gauge.setAttribute('aria-valuenow', String(selected));
    hud.gauge.setAttribute('aria-valuetext', `Planta ${selected}`);
  } else if (vuelo) {
    const y = vuelo.cameraHeight();
    setHud(y > 96 ? 'Azotea' : 'Altura', vuelo.cameraFloor(), Math.max(0, Math.round(y + 1.2)), y / 96);
  } else {
    const f = Math.round(progress * 18);                  // la secuencia del proyecto 3 sube hasta la 18
    setHud('Planta', f, null, f / (NF - 1));
  }
}

// Se llama en cada fotograma que pinta la torre: el HTML sigue a la cámara
function onFrame() { updateHud(); if (focused != null) placeFicha(); }

/* =========================================================
   Selector de planta
   ========================================================= */
const pick = { floor: $('[data-pick-floor]'), state: $('[data-pick-state]'), panel: $('[data-pick]') };
const tag = $('[data-tag]');
const ficha = $('[data-ficha]');
const F_ = (s) => $(`[data-f-${s}]`, ficha);
const stateText = (d) => !d.residential ? 'Zonas comunes' : d.avail ? `${d.avail} de ${d.total} libres` : 'Vendida';

function setPicking(on) {
  if (on === picking) return;
  picking = on;
  stage.classList.toggle('is-pick', on);
  pick.panel.setAttribute('aria-hidden', String(!on));
  hud.gauge.tabIndex = on ? 0 : -1;
  if (on) { vuelo?.parallax(0, 0); preview(selected); }
  else { closeFicha(true); hover(-1); vuelo?.select(-1); $$('polygon.is-active').forEach((p) => p.classList.remove('is-active')); }
  updateHud();
}
function preview(f) {
  selected = f;
  const d = FLOORS[f];
  pick.floor.textContent = pad(f);
  pick.state.textContent = stateText(d);
  vuelo?.select(f);
  $$('[data-fb-svg] polygon').forEach((p) => p.classList.toggle('is-active', +p.dataset.f === f));
  updateHud();
}
function hover(f, x, y) {
  hovered = f;
  vuelo?.hover(f);
  towerCanvas.classList.toggle('is-hot', f >= 0);
  if (f >= 0 && x != null && !tallMQ.matches && f !== focused) {
    const d = FLOORS[f];
    tag.innerHTML = `Planta <b>${f}</b>, ${stateText(d).toLowerCase()}`;
    tag.style.setProperty('--tx', `${x}px`); tag.style.setProperty('--ty', `${y}px`);
    tag.hidden = false;
  } else tag.hidden = true;
  updateHud();
}

/* Ficha */
let fichaTimer = 0;
function choose(f) {
  f = clamp(f, 0, NF - 1);
  const d = FLOORS[f];
  preview(f);
  focused = f;
  stage.classList.add('is-focus');
  F_('num').textContent = pad(f);
  F_('type').textContent = d.nombre;
  F_('state').textContent = stateText(d);
  $('.ficha-data', ficha).hidden = !d.residential;
  F_('text').hidden = d.residential;
  F_('text').textContent = d.texto || '';
  if (d.residential) {
    F_('m2').textContent = `${d.m2} m²`; F_('ter').textContent = `${d.terraza} m²`;
    F_('view').textContent = d.view; F_('price').textContent = d.avail ? money(d.price) : 'Sin unidades';
  }
  const res = F_('res');
  res.disabled = !d.residential || !d.avail;
  res.textContent = !d.residential ? 'Solo residentes' : d.avail ? 'Ver la residencia' : 'Planta vendida';
  $('[data-f-step="-1"]').disabled = f <= 0;
  $('[data-f-step="1"]').disabled = f >= NF - 1;
  ficha.hidden = false;
  if (vuelo) vuelo.focus(f);
  // la ficha entra cuando la cámara casi ha llegado
  clearTimeout(fichaTimer); ficha.classList.remove('is-on');
  fichaTimer = setTimeout(() => { placeFicha(); ficha.classList.add('is-on'); }, reduce || !vuelo ? 0 : 950);
  placeFicha();
  const opt = $(`[data-floor-select] option[value="${f}"]`); if (opt) opt.selected = true;
}
function closeFicha(silent) {
  if (focused == null) return;
  focused = null;
  clearTimeout(fichaTimer);
  ficha.classList.remove('is-on');
  stage.classList.remove('is-focus');
  fichaTimer = setTimeout(() => (ficha.hidden = true), 500);
  vuelo?.unfocus();
  if (!silent) $('[data-open-floor]').focus({ preventScroll: true });
}
// Proyecta el borde de la planta a pantalla y coloca la ficha a su lado, con una línea guía
function placeFicha() {
  if (focused == null || tallMQ.matches) return;
  const W = stage.clientWidth, H = stage.clientHeight, cw = ficha.offsetWidth, ch = ficha.offsetHeight;
  let px, py;
  if (vuelo) { const p = vuelo.project(focused, 1); px = p.x * W; py = p.y * H; }
  else { px = parseFloat(getComputedStyle(stage).getPropertyValue('--pad')) || 40; py = H / 2; }
  const gap = vuelo ? 64 : 0;
  const x = clamp(px + gap, 16, W - cw - 16);
  const y = clamp(py - ch * 0.32, 80, H - ch - 24);
  ficha.style.setProperty('--fx', `${x.toFixed(1)}px`);
  ficha.style.setProperty('--fy', `${y.toFixed(1)}px`);
  ficha.style.setProperty('--lw', `${Math.max(0, x - px).toFixed(1)}px`);
  ficha.style.setProperty('--ly', `${(py - y).toFixed(1)}px`);
  $('.ficha-line', ficha).style.display = vuelo && x - px > 8 ? '' : 'none';
}

/* Ratón: hover con raycast, como mucho una vez por fotograma */
let pending = null;
towerCanvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || !vuelo) return;
  if (!picking) { const b = stage.getBoundingClientRect(); vuelo.parallax((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height * 2 - 1)); return; }
  if (!pending) requestAnimationFrame(() => {
    const b = stage.getBoundingClientRect();
    hover(vuelo.pickAt(pending.x, pending.y), pending.x - b.left, pending.y - b.top);
    pending = null;
  });
  pending = { x: e.clientX, y: e.clientY };
});
towerCanvas.addEventListener('pointerleave', () => { if (picking) hover(-1); });
// Clic o toque: elegir planta (un toque que arrastra es scroll y no llega como click)
towerCanvas.addEventListener('click', (e) => {
  if (!picking || !vuelo) return;
  const f = vuelo.pickAt(e.clientX, e.clientY);
  if (f >= 0) { hover(-1); choose(f); } else if (focused != null) closeFicha();
});

/* Respaldo: los polígonos del proyecto 3 hacen de raycast */
function wirePolygons() {
  const svg = $('[data-fb-svg]');
  svg.addEventListener('pointerover', (e) => {
    const p = e.target.closest('polygon'); if (!p) return;
    $$('polygon', svg).forEach((x) => x.classList.toggle('is-hover', x === p));
    if (e.pointerType === 'mouse') { const b = stage.getBoundingClientRect(); hover(+p.dataset.f, e.clientX - b.left, e.clientY - b.top); }
  });
  svg.addEventListener('pointerleave', () => { $$('polygon', svg).forEach((x) => x.classList.remove('is-hover')); hover(-1); });
  svg.addEventListener('click', (e) => { const p = e.target.closest('polygon'); if (p) { hover(-1); choose(+p.dataset.f); } });
}

/* Botones, escala y teclado */
const step = (n) => preview(clamp(selected + n, 2, NF - 1));
$$('[data-step]').forEach((b) => b.addEventListener('click', () => step(+b.dataset.step)));
$('[data-open-floor]').addEventListener('click', () => choose(selected));
$$('[data-f-step]').forEach((b) => b.addEventListener('click', () => choose(focused + +b.dataset.fStep)));
F_('back').addEventListener('click', () => closeFicha());
F_('res').addEventListener('click', () => openResidence(focused ?? selected));
hud.gauge.addEventListener('click', (e) => {
  if (!picking) return;
  const b = hud.gauge.getBoundingClientRect();
  preview(clamp(Math.round((1 - (e.clientY - b.top) / b.height) * (NF - 1)), 2, NF - 1));
});
hud.gauge.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(selected); }
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && focused != null) closeFicha(); });

/* Pausa: la torre no pinta fuera de pantalla ni con la pestaña oculta */
new IntersectionObserver(([en]) => { if (!vuelo) return; en.isIntersecting ? vuelo.resume() : vuelo.pause(); }).observe(stage);
document.addEventListener('visibilitychange', () => { if (vuelo) document.hidden ? vuelo.pause() : vuelo.resume(); });

/* =========================================================
   4. La residencia
   ========================================================= */
const resStage = $('[data-res-stage]');
const roomsList = $('[data-rooms]');
const detail = $('[data-room-detail]');
const pins = $('[data-pins]');
let residence = null, loadingRes = null, resVisible = false;

roomsList.innerHTML = ROOMS.map((r, i) => `<li><button type="button" data-room="${r.id}" aria-pressed="false"><i>${pad(i + 1)}</i>${r.name}<span>${r.m2} m²</span></button></li>`).join('');
pins.innerHTML = ROOMS.map((r, i) => `<button class="pin" type="button" data-room="${r.id}" aria-pressed="false" aria-label="${r.name}" style="--x:-99px;--y:-99px"><span>${i + 1}</span></button>`).join('');

function showRoom(id) {
  const r = ROOMS.find((x) => x.id === id);
  $$('[data-room]').forEach((b) => b.setAttribute('aria-pressed', String(!!r && b.dataset.room === id)));
  pins.classList.toggle('is-focused', !!r);
  detail.innerHTML = r ? `<h3>${r.name}</h3><p>${r.text}</p>` : '<p>Elige una estancia para entrar en ella.</p>';
}
function pickRoom(id) {
  if (residence) residence.focus(id); else showRoom(id);
  if (tallMQ.matches) resStage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
$('.res').addEventListener('click', (e) => { const b = e.target.closest('[data-room]'); if (b) pickRoom(b.dataset.room); });
$('[data-res-reset]').addEventListener('click', () => (residence ? residence.reset() : showRoom(null)));

// Etiquetas ancladas: se recolocan en cada fotograma mientras la sección se ve
function placePins() {
  if (!resVisible) return;
  requestAnimationFrame(placePins);
  const W = resStage.clientWidth, H = resStage.clientHeight;
  for (const b of pins.children) {
    const p = residence ? residence.project(b.dataset.room) : stillPos(b.dataset.room);
    if (!p) continue;
    b.style.setProperty('--x', `${(p.x * W).toFixed(1)}px`);
    b.style.setProperty('--y', `${(p.y * H).toFixed(1)}px`);
  }
}
let stillData = null;
function stillPos(id) {
  // posición de cada estancia sobre la imagen fija (object-fit: contain)
  const img = $('[data-res-still]'); if (!stillData || !img.naturalWidth) return null;
  const W = resStage.clientWidth, H = resStage.clientHeight, b = img.getBoundingClientRect(), s = resStage.getBoundingClientRect();
  const k = Math.min(b.width / img.naturalWidth, b.height / img.naturalHeight);
  const w = img.naturalWidth * k, h = img.naturalHeight * k;
  const ox = b.left - s.left + (b.width - w) / 2, oy = b.top - s.top + (b.height - h) / 2;
  const q = stillData[id];
  return { x: (ox + q.x * w) / W, y: (oy + q.y * h) / H };
}
function ensureResidence() {
  if (loadingRes) return loadingRes;
  if (mode === 'fotogramas') {
    const img = $('[data-res-still]'); img.hidden = false; $('[data-res-canvas]').hidden = true;
    loadingRes = fetch('../../landing/media/residencia-estancias.json').then((r) => r.json()).then((d) => { stillData = d; });
    return loadingRes;
  }
  loadingRes = import('../../../landing/src/residencia.js').then(({ createResidencia }) => {
    residence = createResidencia($('[data-res-canvas]'), {
      onHover: (r) => { $$('[data-room]').forEach((b) => b.classList.toggle('is-hover', !!r && b.dataset.room === r.id)); },
      onFocus: (r) => showRoom(r ? r.id : null),
    });
  }).catch(() => { mode = 'fotogramas'; loadingRes = null; return ensureResidence(); });
  return loadingRes;
}
new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { ensureResidence(); o.disconnect(); } }, { rootMargin: '700px 0px' }).observe(resStage);
new IntersectionObserver(([en]) => { const was = resVisible; resVisible = en.isIntersecting; if (resVisible && !was) placePins(); }).observe(resStage);

function openResidence(f) {
  const d = FLOORS[f];
  if (!d.residential) return;
  $('[data-res-floor]').textContent = `Planta ${f}, ${d.view.toLowerCase()}`;
  $('#res-t').innerHTML = d.nombre.replace(/(\S+)$/, '<em>$1</em>');
  $('[data-res-price]').textContent = money(d.price);
  $('[data-res-m2]').textContent = `${d.m2} m²`;
  $('[data-res-ter]').textContent = `${d.terraza} m²`;
  $('[data-res-dorm]').textContent = d.dorm;
  ensureResidence();
  const go = () => $('#residencia').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  go();
}

/* =========================================================
   5. Menú, enlaces y formulario
   ========================================================= */
const menuBtn = $('.menu-btn');
const closeMenu = () => { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('.nav-links a').forEach((a) => a.addEventListener('click', closeMenu));
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const t = $(a.getAttribute('href')); if (!t) return;
  e.preventDefault();
  // ir a «Plantas» desde arriba es volar todo el recorrido de golpe: en el móvil, sin animación
  const far = Math.abs(t.getBoundingClientRect().top) > innerHeight * 3;
  t.scrollIntoView({ behavior: reduce || (far && coarse) ? 'auto' : 'smooth', block: 'start' });
}));

const sel = $('[data-floor-select]');
sel.innerHTML = FLOORS.filter((d) => d.residential && d.avail).map((d) => `<option value="${d.f}" ${d.f === 18 ? 'selected' : ''}>Planta ${d.f}, ${d.nombre.toLowerCase()}, desde ${money(d.price)}</option>`).join('');
$('.visit-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget, note = $('.form-note', f);
  if (!f.checkValidity()) { note.textContent = 'Falta tu nombre o el correo no es válido.'; f.querySelector(':invalid').focus(); return; }
  note.textContent = `Solicitud lista para la planta ${sel.value}. Es una demo: no se ha enviado nada.`;
});

onScroll();
