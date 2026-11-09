/* =========================================================
   Ressò 2027 · movimiento
   1. Lenis solo con ratón
   2. El momento orquestado de la carga (una timeline de GSAP + SplitText)
   3. El manifiesto fijado con ScrollTrigger, scrub y SplitText
   4. El cartel por días con View Transition
   Lo que se anima solo con CSS (banda, filas, pie, progreso) está en estilos.css.
   ========================================================= */
(() => {
  const { gsap, ScrollTrigger, SplitText } = window;
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Sin GSAP (no ha cargado) la página se queda estática y completa
  if (!gsap) { root.classList.add('is-in'); setupTabs(); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- 1. Lenis: suaviza la rueda; en táctil, el scroll nativo es mejor ---------- */
  let lenis = null;
  if (finePointer && !reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = a.hash.length > 1 && document.querySelector(a.hash);
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { duration: 1.3 });
    else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  // Cabecera sólida en cuanto se deja atrás el principio de la portada
  ScrollTrigger.create({ start: 80, end: 'max', toggleClass: { targets: '.nav', className: 'solid' } });

  /* ---------- 2. El momento orquestado ----------
     Una sola timeline: el eco se expande, la palabra sube letra a letra,
     fecha y lugar entran por líneas y, al final, la acción. Unos 1,9 s. */
  function intro() {
    root.classList.add('is-in');
    if (reduce) return;
    const mobile = matchMedia('(max-width: 760px)').matches;
    const k = mobile ? 0.8 : 1;                       // en el móvil, todo un 20 % más corto
    const word = SplitText.create('.hero-t .word', { type: 'chars' });
    const info = SplitText.create('.when span, .where span', { type: 'lines', mask: 'lines' });
    // La máscara recorta justo a la altura de la línea: se le da aire arriba para la tilde de CASTELLÓ
    gsap.set(info.masks || [], { paddingTop: '0.18em', marginTop: '-0.18em' });
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.rings circle', { scale: 0, transformOrigin: '50% 50%', duration: 1.7 * k, stagger: 0.07 * k }, 0)
      .from(word.chars, { yPercent: 105, duration: 1.15 * k, stagger: 0.055 * k }, 0.12)
      .from(info.lines, { yPercent: 100, duration: 0.9 * k, stagger: 0.07 * k }, 0.5 * k)
      .from('.nav > *', { y: -24, autoAlpha: 0, duration: 0.8 * k, stagger: 0.05 }, 0.6 * k)
      .from('.acts', { y: 18, autoAlpha: 0, duration: 0.9 * k, ease: 'power3.out' }, 0.85 * k)
      .from('.hero-foot .btn', { scale: 0.7, autoAlpha: 0, duration: 0.8 * k, ease: 'back.out(2.2)' }, 1.0 * k);
  }
  // Se espera a las fuentes (SplitText mide letras), pero nunca más de 1,2 s
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(intro);

  /* ---------- 3. El manifiesto: fijado, con scrub y palabra a palabra ---------- */
  const mm = gsap.matchMedia();
  mm.add({
    desk: '(min-width: 761px) and (prefers-reduced-motion: no-preference)',
    mob: '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
  }, (ctx) => {
    const { desk } = ctx.conditions;
    const split = SplitText.create('.manifest-t', { type: 'words' });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.manifest', start: 'top top',
        end: desk ? '+=190%' : '+=110%',             // en el móvil, un pin más corto: el pulgar se cansa
        pin: true, scrub: desk ? 1 : true, anticipatePin: 1,
      },
    });
    tl.from(split.words, { opacity: 0.12, duration: 1, stagger: 0.12 }, 0)
      // El sol sale por la esquina (en el móvil, por el borde de abajo) sin tapar nunca el texto
      .fromTo('.sun', desk ? { yPercent: 38, scale: 0.7 } : { yPercent: 30, scale: 0.85 },
        { yPercent: desk ? -6 : 0, scale: 1, duration: split.words.length * 0.12 + 1 }, 0)
      .fromTo('.sun i', { scale: 0.9 }, { scale: 1.08, stagger: 0.2, duration: 2 }, 0)
      .from('.stats div', { y: 40, autoAlpha: 0, stagger: 0.25, duration: 1, ease: 'power2.out' }, '>-0.6');
    return () => split.revert();
  });

  /* ---------- 4. El cartel con View Transition ---------- */
  setupTabs();
  function setupTabs() {
    const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
    const days = [...document.querySelectorAll('.day')];
    const pill = document.querySelector('.tab-pill');
    const show = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      tab.append(pill);                               // la píldora cambia de botón: la VT la hace viajar
      days.forEach((d) => (d.hidden = d.dataset.day !== tab.dataset.day));
    };
    const go = (tab) => {
      if (tab.getAttribute('aria-selected') === 'true') return;
      if (document.startViewTransition && !reduce) document.startViewTransition(() => show(tab));
      else show(tab);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => go(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        const n = tabs[(i + d + tabs.length) % tabs.length];
        n.focus(); go(n);
      });
    });
  }
})();
