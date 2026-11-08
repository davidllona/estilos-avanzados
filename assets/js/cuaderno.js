/* =========================================================
   Hora azul · motor común del cuaderno
   - Barra superior, índice lateral, paginación y pie
   - Laboratorios (.lab): demo en vivo en un iframe + código editable
   - Bloques de código (script[type="text/x-code"])
   - Tests (.quiz) y progreso en localStorage
   ========================================================= */
(() => {
  const SCRIPT = document.currentScript;
  const ROOT = new URL('../../', SCRIPT.src);          // raíz del cuaderno
  const STORE = 'hora-azul:hechas';

  /* ---------- Temario: única fuente de verdad ---------- */
  const LESSONS = [
    { id: 'criterio',         file: '00-criterio.html',         title: 'Qué hace que una web parezca cara', block: 'Criterio',  min: 12 },
    { id: 'oklch',            file: '01-oklch.html',            title: 'Color que se comporta',             block: 'Color',     min: 15 },
    { id: 'paletas',          file: '02-paletas.html',          title: 'Paletas con criterio',              block: 'Color',     min: 20 },
    { id: 'tipografia',       file: '03-tipografia.html',       title: 'Tipografía que manda',              block: 'Forma',     min: 18 },
    { id: 'composicion',      file: '04-composicion.html',      title: 'Más allá de las cards',             block: 'Forma',     min: 20 },
    { id: 'movimiento',       file: '05-movimiento.html',       title: 'Movimiento con intención',          block: 'Movimiento', min: 18 },
    { id: 'scroll-css',       file: '06-scroll-css.html',       title: 'Scroll animado solo con CSS',       block: 'Movimiento', min: 22 },
    { id: 'view-transitions', file: '07-view-transitions.html', title: 'View Transitions',                  block: 'Movimiento', min: 15 },
    { id: 'gsap',             file: '08-gsap.html',             title: 'GSAP, ScrollTrigger y Lenis',       block: 'Scroll cinematográfico', min: 25 },
    { id: 'secuencias',       file: '09-secuencias.html',       title: 'Secuencias de imágenes y vídeo',    block: 'Scroll cinematográfico', min: 22 },
    { id: 'interaccion',      file: '10-interaccion.html',      title: 'Capas interactivas sobre imagen',   block: 'Scroll cinematográfico', min: 18 },
    { id: 'recursos',         file: '11-recursos.html',         title: 'Recursos visuales con IA',          block: 'Producción', min: 15 },
    { id: 'rendimiento',      file: '12-rendimiento.html',      title: 'Rendimiento y accesibilidad',       block: 'Producción', min: 15 },
    { id: 'proyecto',         file: '13-proyecto.html',         title: 'Proyecto final: la torre',          block: 'Proyecto',  min: 30 },
  ];
  window.HORA_AZUL = { LESSONS, ROOT: ROOT.href, done: getDone };

  const LIBS = {
    gsap:          'vendor/gsap/gsap.min.js',
    scrolltrigger: 'vendor/gsap/ScrollTrigger.min.js',
    splittext:     'vendor/gsap/SplitText.min.js',
    flip:          'vendor/gsap/Flip.min.js',
    lenis:         'vendor/lenis/lenis.min.js',
  };

  function getDone() { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; } }
  function markDone(id) { try { const d = new Set(getDone()); d.add(id); localStorage.setItem(STORE, JSON.stringify([...d])); } catch {} }
  const pad = (i) => String(i).padStart(2, '0');
  const el = (tag, attrs = {}, html = '') => { const n = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (html) n.innerHTML = html; return n; };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Quita la sangría común para que el código del HTML se vea limpio */
  function dedent(text) {
    const lines = text.replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
    const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)[0].length);
    const min = indents.length ? Math.min(...indents) : 0;
    return lines.map((l) => l.slice(min)).join('\n');
  }
  function highlight(code, lang) {
    const P = window.Prism;
    const map = { html: 'markup', css: 'css', js: 'javascript' };
    const g = P && P.languages[map[lang] || lang];
    return g ? P.highlight(code, g, map[lang] || lang) : esc(code);
  }
  function copyButton(getText) {
    const b = el('button', { class: 'copy', type: 'button' }, 'Copiar');
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(getText()); b.textContent = 'Copiado'; }
      catch { b.textContent = 'No se pudo copiar'; }
      setTimeout(() => (b.textContent = 'Copiar'), 1600);
    });
    return b;
  }

  /* ---------- Estructura de la página ---------- */
  const lessonId = document.body.dataset.lesson;
  const idx = LESSONS.findIndex((l) => l.id === lessonId);
  const lesson = LESSONS[idx];

  function buildChrome() {
    const top = el('header', { class: 'topbar' });
    top.innerHTML = `
      <a class="skip" href="#main">Saltar al contenido</a>
      <a class="brand" href="${ROOT.href}index.html"><span class="brand-mark" aria-hidden="true"></span>Hora azul</a>
      <span class="crumb">${lesson ? `${pad(idx)} ${esc(lesson.title)}` : ''}</span>
      <span class="spacer"></span>
      ${lesson ? '<button class="btn toc-btn" type="button" aria-expanded="false">Índice</button>' : ''}
      <a class="btn" href="${ROOT.href}index.html#temario">Temario</a>
      <span class="read-progress" aria-hidden="true"></span>`;
    document.body.prepend(top);

    // Progreso de lectura: fallback si el navegador no tiene scroll-timeline
    if (!CSS.supports('animation-timeline: scroll()')) {
      const bar = top.querySelector('.read-progress');
      const upd = () => { const h = document.documentElement; bar.style.setProperty('--p', h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)); };
      addEventListener('scroll', upd, { passive: true }); upd();
    }
    if (!lesson) return;

    // Cabecera: número, bloque y minutos
    const hero = document.querySelector('.lesson-hero');
    if (hero) {
      hero.prepend(el('p', { class: 'num' }, `Lección ${pad(idx)}, bloque ${esc(lesson.block)}`));
      const meta = el('div', { class: 'meta' });
      meta.innerHTML = `<span class="chip">${lesson.min} min</span>` + (getDone().includes(lesson.id) ? '<span class="chip">Completada</span>' : '');
      hero.append(meta);
      document.title = `${lesson.title} | Hora azul`;
    }

    // Índice lateral a partir de los h2
    const prose = document.querySelector('.prose');
    const wrap = document.querySelector('.lesson');
    if (prose && wrap) {
      const hs = [...prose.querySelectorAll(':scope > h2:not(.no-toc)')];
      const toc = el('nav', { class: 'toc', 'aria-label': 'En esta lección' });
      const ol = el('ol');
      hs.forEach((h, i) => {
        if (!h.id) h.id = 's' + (i + 1);
        if (!h.querySelector('.n')) h.insertAdjacentHTML('afterbegin', `<span class="n">${pad(i + 1)}</span>`);
        const text = h.textContent.replace(/^\d+/, '').trim();
        ol.append(el('li', {}, `<a href="#${h.id}">${esc(text)}</a>`));
      });
      toc.append(el('p', {}, 'En esta lección'), ol);
      wrap.append(toc);
      const links = [...toc.querySelectorAll('a')];
      // Sección activa: el último h2 que ha pasado del 35 % de la pantalla
      let ticking = false;
      const spy = () => {
        ticking = false;
        let cur = hs[0];
        for (const h of hs) if (h.getBoundingClientRect().top < innerHeight * 0.35) cur = h;
        links.forEach((a) => a.classList.toggle('active', a.hash === '#' + cur.id));
      };
      if (hs.length) { addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true }); spy(); }
      const btn = top.querySelector('.toc-btn');
      btn.addEventListener('click', () => { const o = toc.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
      toc.addEventListener('click', (e) => { if (e.target.closest('a')) { toc.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
    }

    // Paginación
    const pager = el('nav', { class: 'pager', 'aria-label': 'Lecciones' });
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    if (prev) pager.append(el('a', { href: prev.file, class: 'prev' }, `<small>Anterior</small><b>${esc(prev.title)}</b>`));
    if (next) pager.append(el('a', { href: next.file, class: 'next' }, `<small>Siguiente, ${pad(idx + 1)}</small><b>${esc(next.title)}</b>`));
    else pager.append(el('a', { href: '../landing/index.html', class: 'next' }, '<small>Ver el resultado</small><b>Abrir la landing</b>'));
    document.querySelector('main').append(pager);

    // Marcar como completada al llegar al resumen
    const recap = document.querySelector('.recap') || pager;
    new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { markDone(lesson.id); o.disconnect(); } }).observe(recap);
  }

  function buildFooter() {
    const f = el('footer', { class: 'site-foot' });
    f.innerHTML = `<span>Hora azul, cuaderno de color y movimiento de David Llona</span><a href="https://github.com/davidllona/estilos-avanzados">Código en GitHub</a>`;
    document.body.append(f);
  }

  /* ---------- Bloques de código sueltos ---------- */
  function buildCodeBlocks() {
    document.querySelectorAll('script[type="text/x-code"]').forEach((s) => {
      const lang = s.dataset.lang || 'css';
      const code = dedent(s.textContent);
      const box = el('div', { class: 'code' });
      if (s.dataset.label) box.append(el('span', { class: 'label' }, esc(s.dataset.label)));
      const pre = el('pre'); pre.innerHTML = highlight(code, lang);
      box.append(pre, copyButton(() => code));
      s.replaceWith(box);
    });
  }

  /* ---------- Laboratorios ---------- */
  function buildLabs() {
    const labs = [...document.querySelectorAll('figure.lab')];
    labs.forEach((fig, n) => {
      const parts = {};
      fig.querySelectorAll('script[type="text/x-demo"]').forEach((s) => { parts[s.dataset.lang] = dedent(s.textContent); s.remove(); });
      const original = { ...parts };
      const cap = fig.querySelector('figcaption');
      const libs = (fig.dataset.libs || '').split(/[\s,]+/).filter(Boolean);
      const langs = ['html', 'css', 'js'].filter((l) => parts[l] != null);
      const names = { html: 'HTML', css: 'CSS', js: 'JS' };
      const uid = 'lab' + n;

      const head = el('div', { class: 'lab-head' }, `<span class="title">${esc(fig.dataset.title || 'Demo')}</span>${fig.dataset.hint ? `<span class="hint">${esc(fig.dataset.hint)}</span>` : ''}`);
      // «Ver en móvil»: la misma demo a 390 px de ancho, como en un teléfono
      const phoneBtn = el('button', { class: 'btn phone-btn', type: 'button', 'aria-pressed': 'false' }, 'Ver en móvil');
      const restart = el('button', { class: 'btn', type: 'button' }, 'Reiniciar');
      head.append(phoneBtn, restart);

      const stage = el('div', { class: 'lab-stage' + (fig.dataset.stage === 'dark' ? ' dark' : '') });
      // En pantallas estrechas se usa data-height-mobile si existe
      const baseH = () => (innerWidth <= 640 && fig.dataset.heightMobile ? fig.dataset.heightMobile : fig.dataset.height || 380);
      stage.style.setProperty('--h', baseH() + 'px');
      const frame = el('iframe', { title: 'Demo: ' + (fig.dataset.title || ''), loading: 'lazy' });
      stage.append(frame);

      const codeBox = el('div', { class: 'lab-code' });
      const tabs = el('div', { class: 'lab-tabs', role: 'tablist' });
      const panes = {};
      const startTab = fig.dataset.open && parts[fig.dataset.open] != null ? fig.dataset.open : (langs.includes('css') ? 'css' : langs[0]);
      langs.forEach((l) => {
        const b = el('button', { type: 'button', role: 'tab', id: `${uid}-t-${l}`, 'aria-controls': `${uid}-p-${l}`, 'aria-selected': String(l === startTab) }, names[l]);
        b.addEventListener('click', () => {
          tabs.querySelectorAll('[role=tab]').forEach((t) => t.setAttribute('aria-selected', String(t === b)));
          Object.entries(panes).forEach(([k, p]) => (p.hidden = k !== l));
        });
        tabs.append(b);
        const pane = el('div', { class: 'lab-pane', role: 'tabpanel', id: `${uid}-p-${l}`, 'aria-labelledby': `${uid}-t-${l}` });
        pane.hidden = l !== startTab;
        panes[l] = pane;
      });
      tabs.append(el('span', { class: 'grow' }));
      const editBtn = el('button', { type: 'button', class: 'act', 'aria-pressed': 'false' }, 'Editar');
      const resetBtn = el('button', { type: 'button', class: 'act', hidden: '' }, 'Deshacer cambios');
      tabs.append(resetBtn, editBtn);
      codeBox.append(tabs, ...Object.values(panes));

      let editing = false;
      function paint() {
        langs.forEach((l) => {
          const pane = panes[l]; pane.innerHTML = '';
          if (editing) {
            const ta = el('textarea', { spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': `Código ${names[l]}` });
            ta.value = parts[l];
            ta.rows = Math.min(24, Math.max(8, parts[l].split('\n').length + 1));
            let t; ta.addEventListener('input', () => { parts[l] = ta.value; clearTimeout(t); t = setTimeout(render, 450); });
            ta.addEventListener('keydown', (e) => { if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); } });
            pane.append(ta);
          } else {
            const pre = el('pre'); pre.innerHTML = highlight(parts[l], l);
            pane.append(pre, copyButton(() => parts[l]));
          }
        });
      }
      editBtn.addEventListener('click', () => {
        editing = !editing;
        editBtn.classList.toggle('on', editing);
        editBtn.setAttribute('aria-pressed', String(editing));
        editBtn.textContent = editing ? 'Ver resaltado' : 'Editar';
        resetBtn.hidden = !editing;
        paint();
      });
      resetBtn.addEventListener('click', () => { Object.assign(parts, original); paint(); render(); });

      function render() {
        const libTags = libs.map((k) => LIBS[k] ? `<script src="${ROOT.href + LIBS[k]}"><\/script>` : '').join('');
        frame.srcdoc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${new URL('.', location.href).href}"><link rel="stylesheet" href="${ROOT.href}assets/css/demo.css"><style>${parts.css || ''}</style></head><body>${parts.html || ''}${libTags}<script>${(parts.js || '').replace(/<\/script/gi, '<\\/script')}<\/script></body></html>`;
      }
      restart.addEventListener('click', render);
      phoneBtn.addEventListener('click', () => {
        const on = stage.classList.toggle('phone');
        phoneBtn.setAttribute('aria-pressed', String(on));
        if (on && fig.dataset.heightMobile) stage.style.setProperty('--h', fig.dataset.heightMobile + 'px');
        else stage.style.setProperty('--h', baseH() + 'px');
        render();   // la demo se vuelve a montar para que sus media queries y matchMedia vean el nuevo tamaño
      });

      const foot = cap ? el('div', { class: 'lab-foot' }, cap.innerHTML) : null;
      fig.innerHTML = '';
      fig.append(head, stage, codeBox);
      if (foot) fig.append(foot);
      paint();

      // Solo se monta la demo cuando está cerca de la pantalla
      const io = new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { render(); o.disconnect(); } }, { rootMargin: '400px 0px' });
      io.observe(fig);
    });
  }

  /* ---------- Tests ---------- */
  function buildQuizzes() {
    document.querySelectorAll('.quiz').forEach((q) => {
      const answer = parseInt(q.dataset.answer, 10) - 1;   // data-answer empieza en 1
      const list = q.querySelector('ol, ul');
      const why = q.querySelector('.why');
      if (!list) return;
      q.insertAdjacentHTML('afterbegin', `<p class="kind">${esc(q.dataset.kind || 'Comprueba')}</p>`);
      if (why) why.hidden = true;
      const opts = el('div', { class: 'opts' });
      [...list.children].forEach((li, i) => {
        const b = el('button', { type: 'button', class: 'opt' }, li.innerHTML);
        b.addEventListener('click', () => {
          opts.querySelectorAll('button').forEach((x, j) => { x.disabled = true; if (j === answer) x.classList.add('right'); });
          if (i !== answer) b.classList.add('wrong');
          if (why) { why.hidden = false; why.insertAdjacentHTML('afterbegin', `<strong>${i === answer ? 'Bien.' : 'No exactamente.'}</strong> `); }
        }, { once: true });
        opts.append(b);
      });
      list.replaceWith(opts);
    });
  }

  function favicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    document.head.append(el('link', { rel: 'icon', href: ROOT.href + 'assets/favicon.svg', type: 'image/svg+xml' }));
  }
  function init() {
    favicon();
    buildChrome();
    buildCodeBlocks();
    buildLabs();
    buildQuizzes();
    buildFooter();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
