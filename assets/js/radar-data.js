/* =========================================================
   Datos del Radar. Este es el único archivo que hay que tocar
   para añadir novedades (lo actualiza la revisión mensual).
   - fecha: AAAA-MM-DD (se ordena solo, lo más nuevo arriba; en pantalla se muestra mes y año)
   - estado: 'amplio' | 'nuevo' | 'limitado' | 'info'
     (Baseline ampliamente disponible, recién disponible, limitado, o noticia sin soporte)
   - leccion: id de la lección relacionada (opcional)
   ========================================================= */
window.RADAR_ACTUALIZADO = '2026-11-08';

window.RADAR = [
  { fecha: '2026-10-27', titulo: 'Animaciones vinculadas al scroll en todos los navegadores', estado: 'nuevo', leccion: 'scroll-css',
    texto: 'Firefox 159 activa animation-timeline: scroll() y view(). Con Chrome 115 y Safari 26, los reveals y parallax ligados al scroll ya no necesitan JavaScript.',
    fuente: 'https://developer.mozilla.org/en-US/Firefox/Releases/159' },
  { fecha: '2026-09-15', titulo: 'Safari 27', estado: 'info',
    texto: 'Anclaje CSS que respeta transforms, <select> personalizable, revert-rule, :heading y stretch.',
    fuente: 'https://webkit.org/?p=17967' },
  { fecha: '2026-09-08', titulo: 'Chrome publica cada dos semanas', estado: 'info',
    texto: 'Desde Chrome 153 hay versión estable cada 2 semanas en vez de cada 4: las novedades llegan antes y los números de versión suben más rápido.',
    fuente: 'https://developer.chrome.com/blog/chrome-two-week-release' },
  { fecha: '2026-08-18', titulo: 'sibling-index() y sibling-count()', estado: 'nuevo', leccion: 'movimiento',
    texto: 'Escalonar animaciones sin escribir --i a mano: transition-delay: calc(sibling-index() * 60ms). Firefox 154 completa el soporte.',
    fuente: 'https://webstatus.dev/features/sibling-count' },
  { fecha: '2026-04-10', titulo: 'contrast-color()', estado: 'nuevo', leccion: 'paletas',
    texto: 'Devuelve blanco o negro según el contraste con un color de fondo. Útil para texto sobre colores de marca variables.',
    fuente: 'https://webstatus.dev/features/contrast-color' },
  { fecha: '2026-04-07', titulo: 'View Transitions con ámbito de elemento', estado: 'limitado', leccion: 'view-transitions',
    texto: 'Element.startViewTransition() anima solo un trozo de la página y permite varias transiciones a la vez. Solo Chrome 147+.',
    fuente: 'https://developer.chrome.com/blog/element-scoped-view-transitions' },
  { fecha: '2026-03-24', titulo: 'CSS Grid Lanes (masonry)', estado: 'limitado', leccion: 'composicion',
    texto: 'El diseño tipo masonry se estandariza como display: grid-lanes. Estable en Safari 26.4; Chrome todavía no.',
    fuente: 'https://webkit.org/blog/17660/introducing-css-grid-lanes/' },
  { fecha: '2026-03-10', titulo: 'Animaciones disparadas por scroll', estado: 'limitado', leccion: 'scroll-css',
    texto: 'animation-trigger arranca una animación normal (por tiempo) al cruzar un punto de scroll, sin IntersectionObserver. Solo Chrome 146+.',
    fuente: 'https://developer.chrome.com/blog/scroll-triggered-animations' },
  { fecha: '2026-02-12', titulo: 'Interop 2026', estado: 'info',
    texto: 'Los navegadores se comprometen a igualar, entre otros, anclaje CSS, container style queries, diálogos y popovers, scroll-driven animations, View Transitions, contrast-color() y shape().',
    fuente: 'https://web.dev/blog/interop-2026' },
  { fecha: '2026-01-13', titulo: 'Anclaje CSS en Firefox 147', estado: 'limitado', leccion: 'interaccion',
    texto: 'El núcleo del anclaje (anchor-name, position-area, @position-try) ya funciona en los tres motores. Baseline lo marca aún como limitado por detalles nuevos.',
    fuente: 'https://developer.mozilla.org/en-US/Firefox/Releases/147' },
  { fecha: '2025-10-14', titulo: 'View Transitions del mismo documento, Baseline', estado: 'nuevo', leccion: 'view-transitions',
    texto: 'Firefox 144 añade document.startViewTransition() y view-transition-class. Las transiciones entre páginas siguen sin Firefox.',
    fuente: 'https://webstatus.dev/features/view-transitions' },
  { fecha: '2025-09-15', titulo: 'Safari 26: scroll, anclaje y color', estado: 'info',
    texto: 'Safari implementa a la vez animaciones vinculadas al scroll, anclaje CSS, contrast-color() y text-wrap: pretty.',
    fuente: 'https://webstatus.dev/features/scroll-driven-animations' },
  { fecha: '2025-05-01', titulo: 'if() y corner-shape', estado: 'limitado',
    texto: 'Lógica condicional dentro de un valor CSS y esquinas squircle, bisel o muesca. Solo Chromium por ahora.',
    fuente: 'https://webstatus.dev/features/corner-shape' },
  { fecha: '2025-04-30', titulo: 'GSAP pasa a ser 100 % gratis', estado: 'info', leccion: 'gsap',
    texto: 'Webflow libera todos los plugins (SplitText reescrito, MorphSVG…) también para uso comercial. Licencia propia sin coste, no MIT.',
    fuente: 'https://webflow.com/blog/gsap-becomes-free' },
  { fecha: '2025-04-01', titulo: 'Carruseles y <select> personalizable', estado: 'limitado',
    texto: 'Chrome 135 trae ::scroll-marker y ::scroll-button() para carruseles sin JS, y appearance: base-select para rediseñar el <select>.',
    fuente: 'https://developer.chrome.com/blog/carousels-with-css' },
];

/* Soporte de las técnicas del cuaderno (versión estable de escritorio) */
window.SOPORTE = [
  { f: 'oklch() / oklab()', c: '111', s: '15.4', x: '113', b: 'amplio' },
  { f: 'color-mix()', c: '111', s: '16.2', x: '113', b: 'amplio' },
  { f: 'Color relativo (from)', c: '125', s: '18', x: '128', b: 'nuevo' },
  { f: 'light-dark()', c: '123', s: '17.5', x: '120', b: 'nuevo' },
  { f: 'contrast-color()', c: '147', s: '26', x: '146', b: 'nuevo' },
  { f: 'text-wrap: balance', c: '114', s: '17.5', x: '121', b: 'nuevo' },
  { f: 'text-wrap: pretty', c: '117', s: '26', x: 'no', b: 'limitado' },
  { f: 'linear() easing', c: '113', s: '17.2', x: '112', b: 'amplio' },
  { f: '@starting-style', c: '117', s: '17.5', x: '129', b: 'nuevo' },
  { f: 'interpolate-size', c: '129', s: 'no', x: 'no', b: 'limitado' },
  { f: 'animation-timeline (scroll, view)', c: '115', s: '26', x: '159', b: 'nuevo' },
  { f: 'View Transitions (mismo documento)', c: '111', s: '18', x: '144', b: 'nuevo' },
  { f: 'View Transitions (entre páginas)', c: '126', s: '18.2', x: 'no', b: 'limitado' },
  { f: 'Anclaje CSS (núcleo)', c: '125', s: '26', x: '147', b: 'limitado' },
  { f: 'Popover', c: '114', s: '17', x: '125', b: 'nuevo' },
  { f: 'Container queries', c: '105', s: '16', x: '110', b: 'amplio' },
  { f: 'subgrid', c: '117', s: '16', x: '71', b: 'amplio' },
  { f: '@property', c: '85', s: '16.4', x: '128', b: 'nuevo' },
  { f: 'sibling-index()', c: '138', s: '26.2', x: '154', b: 'nuevo' },
  { f: 'prefers-reduced-motion', c: '74', s: '10.1', x: '63', b: 'amplio' },
];
