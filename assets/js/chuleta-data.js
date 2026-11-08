/* Generado por tools/generar_chuleta.py: no editar a mano */
window.CHULETA = [
 {
  "leccion": "criterio",
  "archivo": "00-criterio.html",
  "titulo": "Qué hace que una web parezca cara",
  "seccion": "Ritmo, espacio y una sola nota de color",
  "etiqueta": "Una escala de espacio corta y con saltos",
  "lang": "css",
  "codigo": ":root {\n  --s-1: 4px;   --s-2: 8px;   --s-3: 16px;\n  --s-4: 24px;  --s-5: 40px;  --s-6: 64px;  --s-7: 112px;\n}\n.eyebrow + h1 { margin-top: var(--s-3); }  /* van juntos */\nh1 + .sub     { margin-top: var(--s-4); }\n.hero + .seccion { margin-top: var(--s-7); } /* cambio de tema: aire de verdad */"
 },
 {
  "leccion": "criterio",
  "archivo": "00-criterio.html",
  "titulo": "Qué hace que una web parezca cara",
  "seccion": "Detalle y coherencia",
  "etiqueta": "Hover solo donde hay ratón; feedback táctil en todas partes",
  "lang": "css",
  "codigo": ".boton:active { scale: .98; }                 /* funciona con dedo y ratón */\n@media (hover: hover) {\n  .boton:hover { background: var(--acento-oscuro); }\n  .tarjeta:hover img { scale: 1.03; }\n}"
 },
 {
  "leccion": "criterio",
  "archivo": "00-criterio.html",
  "titulo": "Qué hace que una web parezca cara",
  "seccion": "Cara también en el móvil",
  "etiqueta": "Preguntar por la capacidad, no solo por el ancho",
  "lang": "css",
  "codigo": ".hero { min-height: 100svh; }              /* svh: no salta con la barra del navegador */\n\n@media (max-width: 640px) {\n  .nav-links { display: none; }\n  .hero h1 { font-size: clamp(2.6rem, 11vw, 3.4rem); }\n  .cta-secundario { all: unset; text-decoration: underline; }\n}\n@media (pointer: coarse) {\n  .boton, .chip { min-height: 44px; }      /* objetivos táctiles */\n}\n@media (hover: none) {\n  .hotspot .etiqueta { opacity: 1; }       /* lo que salía al pasar el ratón, visible */\n}"
 },
 {
  "leccion": "oklch",
  "archivo": "01-oklch.html",
  "titulo": "Color que se comporta",
  "seccion": "Una escala entera desde un solo color",
  "etiqueta": "Escala de 50 a 900 a partir de --marca",
  "lang": "css",
  "codigo": ":root {\n  --marca: oklch(66% 0.17 45);\n\n  /* misma tinta, distinta luz: cuanto más claro, menos croma */\n  --marca-50:  oklch(from var(--marca) 97% calc(c * 0.12) h);\n  --marca-100: oklch(from var(--marca) 93% calc(c * 0.25) h);\n  --marca-300: oklch(from var(--marca) 82% calc(c * 0.6) h);\n  --marca-500: var(--marca);\n  --marca-700: oklch(from var(--marca) 45% calc(c * 0.85) h);\n  --marca-900: oklch(from var(--marca) 25% calc(c * 0.5) h);\n}"
 },
 {
  "leccion": "oklch",
  "archivo": "01-oklch.html",
  "titulo": "Color que se comporta",
  "seccion": "Mezclar sin ensuciar: color-mix()",
  "etiqueta": "Estados con color-mix",
  "lang": "css",
  "codigo": ".boton {\n  --c: var(--marca);\n  background: var(--c);\n}\n.boton:hover  { background: color-mix(in oklab, var(--c), black 12%); }\n.boton:active { background: color-mix(in oklab, var(--c), black 22%); }\n\n/* fondo tintado al 8% sobre cualquier superficie */\n.aviso { background: color-mix(in oklab, var(--marca) 8%, transparent); }"
 },
 {
  "leccion": "oklch",
  "archivo": "01-oklch.html",
  "titulo": "Color que se comporta",
  "seccion": "Del HEX que te dan a OKLCH",
  "etiqueta": "",
  "lang": "css",
  "codigo": ":root {\n  --cliente: #D9541E;                              /* el «Burnt Orange» del vídeo */\n  --marca: oklch(from var(--cliente) l c h);       /* ya es OKLCH */\n  --marca-suave: oklch(from #D9541E 92% calc(c * .25) h);\n}"
 },
 {
  "leccion": "paletas",
  "archivo": "02-paletas.html",
  "titulo": "Paletas con criterio",
  "seccion": "Un tema entero con tres variables",
  "etiqueta": "Tres variables de entrada, el resto derivado",
  "lang": "css",
  "codigo": ".tema {\n  --base: #F3EEE3;  --tinta: #111111;  --acento: #D9541E;\n\n  --superficie:   color-mix(in oklab, var(--tinta) 5%, var(--base));\n  --suave:        color-mix(in oklab, var(--tinta) 62%, var(--base));  /* texto secundario */\n  --linea:        color-mix(in oklab, var(--tinta) 14%, transparent);\n  --acento-hover: oklch(from var(--acento) calc(l - 0.07) c h);\n  --acento-suave: color-mix(in oklab, var(--acento) 14%, var(--base));\n  --sobre-acento: contrast-color(var(--acento));                   /* blanco o negro */\n}"
 },
 {
  "leccion": "paletas",
  "archivo": "02-paletas.html",
  "titulo": "Paletas con criterio",
  "seccion": "Mientras dormías",
  "etiqueta": "En producción: que decida el sistema y que el usuario pueda forzarlo",
  "lang": "css",
  "codigo": ":root { color-scheme: light dark; }          /* sigue a prefers-color-scheme */\n:root[data-tema=\"claro\"]  { color-scheme: light; }\n:root[data-tema=\"oscuro\"] { color-scheme: dark; }\n/* light-dark(claro, oscuro) elige según el color-scheme del elemento */"
 },
 {
  "leccion": "paletas",
  "archivo": "02-paletas.html",
  "titulo": "Paletas con criterio",
  "seccion": "Mientras dormías",
  "etiqueta": "La barra del navegador con el color de la base",
  "lang": "html",
  "codigo": "<meta name=\"color-scheme\" content=\"light dark\">\n<meta name=\"theme-color\" content=\"#F3EEE3\" media=\"(prefers-color-scheme: light)\">\n<meta name=\"theme-color\" content=\"#1A1612\" media=\"(prefers-color-scheme: dark)\">"
 },
 {
  "leccion": "tipografia",
  "archivo": "03-tipografia.html",
  "titulo": "Tipografía que manda",
  "seccion": "Una escala fluida con clamp()",
  "etiqueta": "El paso 5 de la escala por defecto",
  "lang": "css",
  "codigo": "h1 {\n  /* 33 px a 360 de ancho, 75 px a 1440, en línea recta entre medias */\n  font-size: clamp(2.064rem, 1.188rem + 3.89vw, 4.684rem);\n}"
 },
 {
  "leccion": "tipografia",
  "archivo": "03-tipografia.html",
  "titulo": "Tipografía que manda",
  "seccion": "Titulares que mandan",
  "etiqueta": "Tracking que se relaja al encoger",
  "lang": "css",
  "codigo": "h1 {\n  font-size: clamp(2.6rem, 1.4rem + 5.4vw, 5.75rem);\n  /* -0.36vw son unos -1,4 px a 390 de ancho (≈ -0.03em) y -5 px a 1440 (≈ -0.055em) */\n  letter-spacing: clamp(-0.055em, -0.36vw, -0.025em);\n  line-height: 0.94;\n}\n@media (max-width: 600px) {\n  h1 { line-height: 1.02; }   /* más aire: acentos y descendentes no chocan */\n}"
 },
 {
  "leccion": "tipografia",
  "archivo": "03-tipografia.html",
  "titulo": "Tipografía que manda",
  "seccion": "Números que no bailan",
  "etiqueta": "Dónde activar cifras tabulares",
  "lang": "css",
  "codigo": ".precio, .contador, table td, .reloj, .stat b {\n  font-variant-numeric: tabular-nums;\n}\n/* En texto corrido, deja las proporcionales: \"en 2027\" queda mejor así */"
 },
 {
  "leccion": "tipografia",
  "archivo": "03-tipografia.html",
  "titulo": "Tipografía que manda",
  "seccion": "Tipografía en el móvil",
  "etiqueta": "Un bloque de partida para el móvil",
  "lang": "css",
  "codigo": "html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }   /* que el móvil no reescale el texto */\nbody { font-size: clamp(1rem, 0.96rem + 0.2vw, 1.125rem); line-height: 1.55; }\ninput, select, textarea { font-size: max(16px, 1rem); }          /* sin zoom al enfocar en iOS */\nh1 { overflow-wrap: break-word; hyphens: manual; }                /* una palabra larga no desborda */\np  { text-wrap: pretty; hyphens: auto; }\nh1, h2, h3 { text-wrap: balance; }"
 },
 {
  "leccion": "composicion",
  "archivo": "04-composicion.html",
  "titulo": "Más allá de las cards",
  "seccion": "Piezas que se adaptan solas",
  "etiqueta": "Las tres piezas, en limpio",
  "lang": "css",
  "codigo": "/* 1. El padre define las filas; cada hijo las hereda */\n.lista { display: grid; grid-template-columns: repeat(3, 1fr); }\n.lista > li { grid-row: span 4; display: grid; grid-template-rows: subgrid; }\n\n/* 2. El componente responde al sitio que ocupa */\n.zona { container-type: inline-size; }\n@container (width < 540px) { .ficha { grid-template-columns: 84px 1fr; } }\n\n/* 3. Proporción fija y recorte sin deformar */\n.ficha img { aspect-ratio: 4 / 5; object-fit: cover; object-position: 50% 30%; }"
 },
 {
  "leccion": "composicion",
  "archivo": "04-composicion.html",
  "titulo": "Más allá de las cards",
  "seccion": "Cómo se pliega cada estructura en el móvil",
  "etiqueta": "Mobile first: apilar y recolocar en escritorio",
  "lang": "css",
  "codigo": ".hero { display: grid; gap: 24px; grid-template-areas: \"texto\" \"visual\" \"logos\"; }\n\n@media (min-width: 900px) {\n  .hero {\n    grid-template-columns: 7fr 5fr;\n    grid-template-areas: \"texto visual\" \"logos logos\";\n  }\n}\n\n/* Sticky en móvil: corto, en svh y con fondo para que el texto pase por debajo */\n@media (max-width: 640px) {\n  .media { position: sticky; top: 0; height: 44svh; background: var(--fondo); z-index: 1; }\n}"
 },
 {
  "leccion": "composicion",
  "archivo": "04-composicion.html",
  "titulo": "Más allá de las cards",
  "seccion": "Cómo se pliega cada estructura en el móvil",
  "etiqueta": "En el head",
  "lang": "html",
  "codigo": "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">"
 },
 {
  "leccion": "composicion",
  "archivo": "04-composicion.html",
  "titulo": "Más allá de las cards",
  "seccion": "Cómo se pliega cada estructura en el móvil",
  "etiqueta": "Respetar la muesca y la barra de inicio",
  "lang": "css",
  "codigo": ".barra-reserva {\n  position: fixed; inset: auto 0 0 0;\n  padding: 12px 16px max(12px, env(safe-area-inset-bottom));\n}\n.tira {\n  padding-inline: max(16px, env(safe-area-inset-left)) max(16px, env(safe-area-inset-right));\n  scroll-padding-inline: max(16px, env(safe-area-inset-left));\n}"
 },
 {
  "leccion": "movimiento",
  "archivo": "05-movimiento.html",
  "titulo": "Movimiento con intención",
  "seccion": "Qué animar y cuánto debe durar",
  "etiqueta": "Lo mismo, de dos maneras",
  "lang": "css",
  "codigo": "/* Mal: recalcula el layout en cada fotograma */\n.panel { left: -360px; transition: left .4s; }\n.panel.open { left: 0; }\n\n/* Bien: solo se compone la capa */\n.panel { translate: -100% 0; transition: translate .4s cubic-bezier(.16, 1, .3, 1); }\n.panel.open { translate: 0 0; }"
 },
 {
  "leccion": "movimiento",
  "archivo": "05-movimiento.html",
  "titulo": "Movimiento con intención",
  "seccion": "Easing: la personalidad del movimiento",
  "etiqueta": "Tus curvas, en variables",
  "lang": "css",
  "codigo": ":root {\n  --ease-out-expo: cubic-bezier(.16, 1, .3, 1);   /* entradas, paneles, casi todo */\n  --ease-in-out:   cubic-bezier(.65, 0, .35, 1);  /* cosas que ya están en pantalla y cambian de sitio */\n  --ease-in:       cubic-bezier(.7, 0, .84, 0);   /* solo salidas: acelera y se va */\n  --spring: linear(0, 0.042, 0.147, 0.289, 0.446, 0.603, 0.745, 0.868, 0.965, 1.038, /* … */ 1);\n}"
 },
 {
  "leccion": "movimiento",
  "archivo": "05-movimiento.html",
  "titulo": "Movimiento con intención",
  "seccion": "Transiciones, keyframes y escalonado",
  "etiqueta": "Escalonado con --i o con sibling-index()",
  "lang": "css",
  "codigo": ".menu li {\n  transition: opacity .4s, translate .5s var(--ease-out-expo);\n  transition-delay: calc(var(--i) * 50ms);            /* <li style=\"--i: 2\"> */\n}\n@supports (transition-delay: calc(sibling-index() * 1ms)) {\n  .menu li { transition-delay: calc((sibling-index() - 1) * 50ms); }\n}"
 },
 {
  "leccion": "movimiento",
  "archivo": "05-movimiento.html",
  "titulo": "Movimiento con intención",
  "seccion": "Grid 0fr → 1fr",
  "etiqueta": "Mejora progresiva para height: auto",
  "lang": "css",
  "codigo": "/* Activa la interpolación de palabras clave en todo el documento */\n:root { interpolate-size: allow-keywords; }\n\n/* O solo en una propiedad concreta con calc-size() */\n.panel.open { height: calc-size(auto, size); }\n\n/* Donde no hay soporte, el panel se abre sin animación: no se rompe nada */"
 },
 {
  "leccion": "movimiento",
  "archivo": "05-movimiento.html",
  "titulo": "Movimiento con intención",
  "seccion": "Hovers que se sienten caros, y su versión táctil",
  "etiqueta": "El patrón táctil en limpio",
  "lang": "css",
  "codigo": "/* El hover solo existe donde hay un puntero que puede flotar */\n@media (hover: hover) and (pointer: fine) {\n  .tarjeta:hover img { scale: 1.04; }\n}\n/* En cualquier dispositivo: respuesta inmediata al pulsar */\n.boton:active { scale: .97; transition-duration: 80ms; }\n\n/* Dedo: objetivos grandes */\n@media (pointer: coarse) {\n  .boton { min-height: 48px; }\n}"
 },
 {
  "leccion": "movimiento",
  "archivo": "05-movimiento.html",
  "titulo": "Movimiento con intención",
  "seccion": "Un momento orquestado y movimiento reducido",
  "etiqueta": "Lo básico de prefers-reduced-motion",
  "lang": "css",
  "codigo": ".revela { opacity: 0; translate: 0 24px; transition: opacity .6s, translate .8s var(--ease-out-expo); }\n.revela.in { opacity: 1; translate: 0; }\n\n@media (prefers-reduced-motion: reduce) {\n  /* sin desplazamiento: solo un fundido corto */\n  .revela { translate: none; transition: opacity .3s; }\n  .cta-borde { animation: none; }\n}"
 },
 {
  "leccion": "movimiento",
  "archivo": "05-movimiento.html",
  "titulo": "Movimiento con intención",
  "seccion": "Un momento orquestado y movimiento reducido",
  "etiqueta": "Y en JavaScript",
  "lang": "js",
  "codigo": "const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;\nif (!reduce) iniciarBotonMagnetico();"
 },
 {
  "leccion": "scroll-css",
  "archivo": "06-scroll-css.html",
  "titulo": "Scroll animado solo con CSS",
  "seccion": "Líneas de tiempo con nombre",
  "etiqueta": "Nombrar y usar una línea de tiempo",
  "lang": "css",
  "codigo": "/* La sección crea la línea de tiempo... */\n.galeria { view-timeline-name: --galeria; }     /* o view-timeline: --galeria block; */\n.carrusel { scroll-timeline-name: --carrusel; scroll-timeline-axis: inline; }\n\n/* ...y cualquier descendiente la usa por su nombre */\n.galeria .pista { animation: desliza linear both; animation-timeline: --galeria; }\n\n/* Para un elemento que NO es descendiente (un HUD fijo, un menú hermano),\n   sube el alcance del nombre a un ancestro común */\nbody { timeline-scope: --galeria; }"
 },
 {
  "leccion": "scroll-css",
  "archivo": "06-scroll-css.html",
  "titulo": "Scroll animado solo con CSS",
  "seccion": "Soporte, fallbacks y movimiento reducido",
  "etiqueta": "Plantilla segura para cualquier efecto de scroll",
  "lang": "css",
  "codigo": "/* 1. Estado normal: visible, quieto y completo. Funciona en todas partes. */\n.foto { clip-path: inset(0 round 6px); }\n\n/* 2. Solo si el usuario no ha pedido menos movimiento... */\n@media (prefers-reduced-motion: no-preference) {\n  /* 3. ...y solo si el navegador entiende las líneas de tiempo */\n  @supports (animation-timeline: view()) {\n    .foto {\n      animation: abre linear both;\n      animation-timeline: view();\n      animation-range: entry 0% cover 45%;\n    }\n  }\n}\n@keyframes abre { from { clip-path: inset(22% 18% round 6px); } }"
 },
 {
  "leccion": "scroll-css",
  "archivo": "06-scroll-css.html",
  "titulo": "Scroll animado solo con CSS",
  "seccion": "Soporte, fallbacks y movimiento reducido",
  "etiqueta": "Fallback de la escena fijada",
  "lang": "css",
  "codigo": "@supports not (animation-timeline: view()) {\n  .vuelo { height: auto; }\n  .escena { position: relative; height: auto; display: grid; gap: 2rem; padding-block: 4rem; }\n  .escena > * { position: static; opacity: 1; }\n  .noche, .velo, .contador, .aviso { display: none; }\n}"
 },
 {
  "leccion": "view-transitions",
  "archivo": "07-view-transitions.html",
  "titulo": "View Transitions",
  "seccion": "Una foto antes, otra después",
  "etiqueta": "La envoltura segura",
  "lang": "js",
  "codigo": "function conTransicion(actualizar) {\n  if (!document.startViewTransition) return actualizar();\n  const t = document.startViewTransition(actualizar);\n  t.finished.catch(() => {});   // si se interrumpe, que no ensucie la consola\n  return t;\n}"
 },
 {
  "leccion": "view-transitions",
  "archivo": "07-view-transitions.html",
  "titulo": "View Transitions",
  "seccion": "Personalizar la animación",
  "etiqueta": "El árbol de pseudo-elementos",
  "lang": "css",
  "codigo": "::view-transition                      /* capa raíz, encima de todo */\n└─ ::view-transition-group(foto)       /* posición y tamaño: viaja de A a B */\n   └─ ::view-transition-image-pair(foto)\n      ├─ ::view-transition-old(foto)   /* captura de antes (una imagen) */\n      └─ ::view-transition-new(foto)   /* captura de después (en vivo) */\n/* lo que no tiene nombre va todo junto en el grupo «root» */"
 },
 {
  "leccion": "view-transitions",
  "archivo": "07-view-transitions.html",
  "titulo": "View Transitions",
  "seccion": "Entre páginas: @view-transition",
  "etiqueta": "En las dos páginas (listado.html y planta-32.html)",
  "lang": "css",
  "codigo": "@view-transition { navigation: auto; }\n\n/* listado.html: la miniatura de la planta 32 */\n.planta-32 .mini { view-transition-name: foto-32; }\n\n/* planta-32.html: la foto grande de la cabecera */\n.cabecera-foto { view-transition-name: foto-32; }\n\n/* Personalización: exactamente igual que en la misma página */\n::view-transition-group(foto-32) { animation-duration: .5s; }\n\n@media (prefers-reduced-motion: reduce) {\n  @view-transition { navigation: none; }\n}"
 },
 {
  "leccion": "view-transitions",
  "archivo": "07-view-transitions.html",
  "titulo": "View Transitions",
  "seccion": "Rendimiento, movimiento reducido y GSAP Flip",
  "etiqueta": "Movimiento reducido: cambiar el viaje por un fundido",
  "lang": "css",
  "codigo": "@media (prefers-reduced-motion: reduce) {\n  ::view-transition-group(*) { animation-duration: 0s; }     /* nada viaja ni escala */\n  ::view-transition-old(*), ::view-transition-new(*) { animation-duration: .2s; }  /* solo funde */\n}"
 },
 {
  "leccion": "gsap",
  "archivo": "08-gsap.html",
  "titulo": "GSAP, ScrollTrigger y Lenis",
  "seccion": "Tweens, timelines y eases",
  "etiqueta": "",
  "lang": "js",
  "codigo": "// to: desde como está hasta estos valores\ngsap.to('.card', { y: 0, opacity: 1, duration: 0.8 });\n// from: desde estos valores hasta como está en el CSS\ngsap.from('.titulo', { yPercent: 100 });\n// fromTo: tú fijas los dos extremos\ngsap.fromTo('.panel', { x: 0 }, { x: 16, ease: 'expo.out' });"
 },
 {
  "leccion": "gsap",
  "archivo": "08-gsap.html",
  "titulo": "GSAP, ScrollTrigger y Lenis",
  "seccion": "ScrollTrigger: start, end y scrub",
  "etiqueta": "onEnter · onLeave · onEnterBack · onLeaveBack",
  "lang": "js",
  "codigo": "// por defecto: se reproduce una vez y ya\ntoggleActions: 'play none none none'\n// se rebobina si vuelves a subir por encima del start\ntoggleActions: 'play none none reverse'\n// reinicia, pausa al salir, sigue al volver, resetea arriba\ntoggleActions: 'restart pause resume reset'"
 },
 {
  "leccion": "gsap",
  "archivo": "08-gsap.html",
  "titulo": "GSAP, ScrollTrigger y Lenis",
  "seccion": "Lenis: scroll suave sin romper ScrollTrigger",
  "etiqueta": "Lenis + ScrollTrigger, un solo reloj",
  "lang": "js",
  "codigo": "const lenis = new Lenis({ autoRaf: false });\n// 1) ScrollTrigger se entera de cada frame de Lenis\nlenis.on('scroll', ScrollTrigger.update);\n// 2) un solo bucle, el de GSAP (que da segundos; Lenis quiere ms)\ngsap.ticker.add((time) => lenis.raf(time * 1000));\n// 3) sin compensación de lag: nada de saltos tras un frame lento\ngsap.ticker.lagSmoothing(0);"
 },
 {
  "leccion": "gsap",
  "archivo": "08-gsap.html",
  "titulo": "GSAP, ScrollTrigger y Lenis",
  "seccion": "Lenis: scroll suave sin romper ScrollTrigger",
  "etiqueta": "Lenis solo con ratón o trackpad",
  "lang": "js",
  "codigo": "let lenis;\ngsap.matchMedia().add('(hover: hover) and (pointer: fine)', () => {\n  lenis = new Lenis({ autoRaf: false });\n  lenis.on('scroll', ScrollTrigger.update);\n  const raf = (t) => lenis.raf(t * 1000);\n  gsap.ticker.add(raf);\n  // limpieza si deja de cumplirse (p. ej. conectas un ratón al iPad y lo quitas)\n  return () => { gsap.ticker.remove(raf); lenis.destroy(); };\n});"
 },
 {
  "leccion": "gsap",
  "archivo": "08-gsap.html",
  "titulo": "GSAP, ScrollTrigger y Lenis",
  "seccion": "Limpieza y bugs típicos",
  "etiqueta": "Montar y desmontar una sección",
  "lang": "js",
  "codigo": "const ctx = gsap.context(() => {\n  gsap.from('.titulo', { yPercent: 100, scrollTrigger: '.titulo' });\n  ScrollTrigger.create({ trigger: '.galeria', pin: true, end: '+=150%' });\n}, seccion);   // acota los selectores a esa sección\n\n// Al salir: mata los ScrollTriggers, quita pins y estilos en línea\nctx.revert();\n\n// Otras herramientas\ntrigger.kill();            // uno concreto\nScrollTrigger.refresh();   // recalcula posiciones (algo cambió de alto)"
 },
 {
  "leccion": "secuencias",
  "archivo": "09-secuencias.html",
  "titulo": "Secuencias de imágenes y vídeo",
  "seccion": "Vídeo controlado por el scroll",
  "etiqueta": "Cómo se codificó el vídeo de la demo (ffmpeg)",
  "lang": "txt",
  "codigo": "ffmpeg -framerate 30 -i frames/%04d.png \\\n  -vf \"scale=960:540,format=yuv420p\" \\\n  -c:v libx264 -crf 24 -g 1 -preset slow \\\n  -movflags +faststart -an torre-scrub.mp4"
 },
 {
  "leccion": "secuencias",
  "archivo": "09-secuencias.html",
  "titulo": "Secuencias de imágenes y vídeo",
  "seccion": "La versión de producción con GSAP",
  "etiqueta": "Escenario fijo que no salta en el móvil",
  "lang": "css",
  "codigo": ".arrival { height: 420vh; }\n.arrival-stage {\n  position: sticky; top: 0;\n  height: 100vh;    /* respaldo */\n  height: 100svh;   /* alto «pequeño»: con la barra del navegador visible */\n  overflow: hidden;\n}\n@media (max-width: 900px) {\n  .arrival { height: 300vh; }\n}"
 },
 {
  "leccion": "secuencias",
  "archivo": "09-secuencias.html",
  "titulo": "Secuencias de imágenes y vídeo",
  "seccion": "Accesibilidad y movimiento reducido",
  "etiqueta": "",
  "lang": "css",
  "codigo": "@media (prefers-reduced-motion: reduce) {\n  .arrival { height: auto; }\n  .arrival-stage { position: relative; }\n  .phase-2, .phase-3 { display: none; }   /* solo el titular principal */\n}"
 },
 {
  "leccion": "interaccion",
  "archivo": "10-interaccion.html",
  "titulo": "Capas interactivas sobre imagen",
  "seccion": "Polígonos encima de una foto",
  "etiqueta": "Pasar un SVG exportado de Figma (en píxeles) a fracciones",
  "lang": "js",
  "codigo": "// points=\"412,880 640,872 652,910 420,918\" en una imagen de 1600 × 1000\nconst toUnit = (points, w, h) =>\n  points.trim().split(/\\s+/).map((pair) => {\n    const [x, y] = pair.split(',').map(Number);\n    return [+(x / w).toFixed(4), +(y / h).toFixed(4)];\n  });"
 },
 {
  "leccion": "interaccion",
  "archivo": "10-interaccion.html",
  "titulo": "Capas interactivas sobre imagen",
  "seccion": "Hotspots en la planta isométrica",
  "etiqueta": "La misma ficha como hoja inferior en móvil",
  "lang": "css",
  "codigo": "@media (max-width: 640px) {\n  .card {\n    position: fixed; inset: auto 0 0 0;    /* pegada abajo */\n    position-area: none; margin: 0;\n    width: auto; max-width: none;\n    border-radius: 16px 16px 0 0;\n    padding: 18px 20px calc(18px + env(safe-area-inset-bottom));\n  }\n}"
 },
 {
  "leccion": "recursos",
  "archivo": "11-recursos.html",
  "titulo": "Recursos visuales con IA",
  "seccion": "Prompts repetibles y consistencia",
  "etiqueta": "Esqueleto de prompt: solo cambia [PLANO]",
  "lang": "txt",
  "codigo": "[PLANO]    Plano general frontal desde el agua. Cámara a 1,6 m, lente 35 mm, torre centrada con aire arriba.\n[SUJETO]   Torre residencial de 40 plantas, fachada de vidrio con lamas verticales de piedra crema, coronación escalonada.\n[LUZ]      Hora azul, 15 minutos después de la puesta de sol. Cielo violeta profundo arriba, rosa suave en el horizonte.\n           Ventanas en luz cálida 2700 K, encendidas de forma irregular, alrededor del 60 %.\n[ENTORNO]  Paseo marítimo, agua en calma con reflejos, palmeras a contraluz.\n[ESTILO]   Fotografía de arquitectura realista, colores contenidos, sin HDR, grano fino.\n[EVITAR]   Texto, logotipos, personas en primer plano, fachada deformada, cielo saturado.\n[FORMATO]  16:9. (La versión 9:16 se genera aparte, con la torre más grande y aire arriba.)"
 },
 {
  "leccion": "recursos",
  "archivo": "11-recursos.html",
  "titulo": "Recursos visuales con IA",
  "seccion": "Prompts repetibles y consistencia",
  "etiqueta": "Dos planos más con el mismo esqueleto",
  "lang": "txt",
  "codigo": "[PLANO]    Plano medio de la planta 32, cámara frente a la fachada a la misma altura, lente 50 mm.\n           Se ven tres ventanales y la terraza con barandilla de vidrio.\n(SUJETO, LUZ, ENTORNO, ESTILO y EVITAR: idénticos)\n\n[PLANO]    Interior del salón de la planta 32 hacia los ventanales, lente 24 mm, cámara a 1,2 m.\n           Sofá bajo color arena, suelo de roble claro, lámpara de pie encendida. Fuera, la misma hora azul.\n(Mismos bloques; en ENTORNO: «Por la ventana, el mismo cielo y el mar del plano general».)"
 },
 {
  "leccion": "recursos",
  "archivo": "11-recursos.html",
  "titulo": "Recursos visuales con IA",
  "seccion": "De imagen a vídeo entre dos fotogramas",
  "etiqueta": "Prompt de movimiento para el clip del vuelo",
  "lang": "txt",
  "codigo": "Primer fotograma: 01-exterior-169.png      Último fotograma: 02-planta32-169.png\n[MOVIMIENTO] Avance lento y continuo de la cámara hacia la planta 32, en línea recta, sin giros ni cortes.\n[CÁMARA]     Velocidad constante, horizonte nivelado, sin vibración.\n[MANTENER]   La geometría de la torre, el número de plantas, la luz y el color del primer fotograma.\n[EVITAR]     Zoom digital, cambios de luz, ventanas que parpadean, objetos que aparecen o desaparecen."
 },
 {
  "leccion": "recursos",
  "archivo": "11-recursos.html",
  "titulo": "Recursos visuales con IA",
  "seccion": "De imagen a vídeo entre dos fotogramas",
  "etiqueta": "Sacar el último fotograma de un clip para encadenar el siguiente",
  "lang": "txt",
  "codigo": "ffmpeg -sseof -0.1 -i 02-vuelo.mp4 -frames:v 1 -update 1 02-vuelo-ultimo.png"
 },
 {
  "leccion": "recursos",
  "archivo": "11-recursos.html",
  "titulo": "Recursos visuales con IA",
  "seccion": "Fotogramas con ffmpeg",
  "etiqueta": "Secuencia de escritorio: 24 fps, 1600 px de ancho, WebP calidad 72",
  "lang": "txt",
  "codigo": "mkdir -p frames/desk\nffmpeg -i 02-vuelo-169.mp4 -vf \"fps=24,scale=1600:-2:flags=lanczos\" \\\n  -c:v libwebp -quality 72 -compression_level 6 frames/desk/%04d.webp\n# resultado: frames/desk/0001.webp, 0002.webp ... (cuatro cifras: se ordenan bien)"
 },
 {
  "leccion": "recursos",
  "archivo": "11-recursos.html",
  "titulo": "Recursos visuales con IA",
  "seccion": "Fotogramas con ffmpeg",
  "etiqueta": "Secuencia de móvil, desde su propio clip 9:16, y versión AVIF",
  "lang": "txt",
  "codigo": "mkdir -p frames/movil frames/avif\nffmpeg -i 02-vuelo-916.mp4 -vf \"fps=24,scale=720:-2:flags=lanczos\" \\\n  -c:v libwebp -quality 68 frames/movil/%04d.webp\n\n# AVIF pesa menos con la misma calidad, pero tarda más en codificar.\n# Ojo: para secuencias AVIF hay que forzar -f image2\nffmpeg -i 02-vuelo-169.mp4 -vf \"fps=24,scale=1600:-2:flags=lanczos\" \\\n  -c:v libaom-av1 -still-picture 1 -crf 34 -cpu-used 6 -f image2 frames/avif/%04d.avif\n\n# ¿cuántos fotogramas tiene el clip original?\nffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 02-vuelo-169.mp4"
 },
 {
  "leccion": "recursos",
  "archivo": "11-recursos.html",
  "titulo": "Recursos visuales con IA",
  "seccion": "Vídeo para scrub, pósters y peso",
  "etiqueta": "Vídeos preparados para scrub",
  "lang": "txt",
  "codigo": "# Todos los fotogramas son keyframe (-g 1): saltos instantáneos, archivo más grande\nffmpeg -i 02-vuelo-169.mp4 -an -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \\\n  -g 1 -movflags +faststart vuelo-scrub.mp4\n\n# Compromiso: un keyframe cada 6 fotogramas, sin fotogramas B\nffmpeg -i 02-vuelo-169.mp4 -an -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \\\n  -x264-params keyint=6:min-keyint=6:scenecut=0 -bf 0 -movflags +faststart vuelo-scrub-g6.mp4\n\n# WebM VP9 como alternativa (suele pesar menos)\nffmpeg -i 02-vuelo-169.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 36 -g 6 -row-mt 1 vuelo-scrub.webm\n\n# Póster: el primer fotograma, para que no haya hueco mientras carga\nffmpeg -i 02-vuelo-169.mp4 -frames:v 1 -c:v libwebp -quality 80 vuelo-poster.webp"
 },
 {
  "leccion": "recursos",
  "archivo": "11-recursos.html",
  "titulo": "Recursos visuales con IA",
  "seccion": "Vídeo para scrub, pósters y peso",
  "etiqueta": "Marcado: póster inmediato, vídeo y fotogramas sin bloquear",
  "lang": "html",
  "codigo": "<link rel=\"preload\" as=\"image\" href=\"frames/desk/0001.webp\" fetchpriority=\"high\">\n\n<video class=\"scrub\" muted playsinline preload=\"auto\" poster=\"vuelo-poster.webp\">\n  <source src=\"vuelo-scrub.webm\" type=\"video/webm\">\n  <source src=\"vuelo-scrub.mp4\" type=\"video/mp4\">\n</video>\n\n<!-- Interiores: no descargan nada hasta que alguien toca la estancia -->\n<video preload=\"none\" poster=\"salon-poster.webp\" muted playsinline>\n  <source src=\"salon.mp4\" type=\"video/mp4\">\n</video>"
 },
 {
  "leccion": "recursos",
  "archivo": "11-recursos.html",
  "titulo": "Recursos visuales con IA",
  "seccion": "Vídeo para scrub, pósters y peso",
  "etiqueta": "Carga por pasadas de una secuencia",
  "lang": "js",
  "codigo": "const N = 120, frames = new Array(N);\nconst url = i => `frames/${isPortrait ? 'movil' : 'desk'}/${String(i + 1).padStart(4, '0')}.webp`;\n\nasync function load(i) {\n  if (frames[i]) return;\n  const img = new Image();\n  img.src = url(i);\n  await img.decode().catch(() => {});   // decodifica fuera del momento de pintar\n  frames[i] = img;\n}\n// Pasadas: cada 8, cada 4, cada 2, todos. Cada pasada solo pide lo que falta.\nfor (const step of [8, 4, 2, 1]) {\n  const batch = [];\n  for (let i = 0; i < N; i += step) batch.push(load(i));\n  await Promise.all(batch);\n}\n// Al pintar: el fotograma pedido o el más cercano ya cargado\nfunction nearest(i) { for (let d = 0; d < N; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; } }"
 },
 {
  "leccion": "rendimiento",
  "archivo": "12-rendimiento.html",
  "titulo": "Rendimiento y accesibilidad del movimiento",
  "seccion": "El camino de un fotograma",
  "etiqueta": "Bien y mal",
  "lang": "css",
  "codigo": "/* Mal: todo a su propia capa «por si acaso» */\n* { will-change: transform; }\n\n/* Bien: solo lo que se mueve, y solo mientras se mueve */\n.torre.is-flying { will-change: transform; }"
 },
 {
  "leccion": "rendimiento",
  "archivo": "12-rendimiento.html",
  "titulo": "Rendimiento y accesibilidad del movimiento",
  "seccion": "Imágenes que no frenan el LCP",
  "etiqueta": "Póster del exterior: el candidato a LCP",
  "lang": "html",
  "codigo": "<picture>\n  <source type=\"image/avif\" srcset=\"torre-480.avif 480w, torre-800.avif 800w, torre-1200.avif 1200w, torre-1600.avif 1600w, torre-2400.avif 2400w\"\n          sizes=\"(max-width: 700px) 100vw, 60vw\" media=\"(orientation: landscape)\">\n  <source type=\"image/avif\" srcset=\"torre-v-720.avif 720w, torre-v-1080.avif 1080w\" sizes=\"100vw\">\n  <img src=\"torre-1200.webp\" alt=\"Torre Alameda al anochecer, con las ventanas encendidas sobre el mar\"\n       width=\"1600\" height=\"900\" fetchpriority=\"high\" decoding=\"async\">\n</picture>\n\n<!-- Todo lo que está más abajo: perezoso -->\n<img src=\"salon-800.webp\" alt=\"Salón de la planta 32\" width=\"800\" height=\"533\" loading=\"lazy\" decoding=\"async\">"
 },
 {
  "leccion": "rendimiento",
  "archivo": "12-rendimiento.html",
  "titulo": "Rendimiento y accesibilidad del movimiento",
  "seccion": "Secuencias en canvas: la memoria manda",
  "etiqueta": "Dibujar solo cuando cambia, con listeners pasivos",
  "lang": "js",
  "codigo": "let target = 0, current = -1, ticking = false;\n\n// passive: true le promete al navegador que no llamarás a preventDefault(),\n// así no espera a tu JS para hacer scroll (crítico en táctil)\naddEventListener('scroll', () => {\n  target = Math.round(progress() * (N - 1));\n  if (!ticking) { ticking = true; requestAnimationFrame(draw); }\n}, { passive: true });\n\nfunction draw() {\n  ticking = false;\n  if (target === current) return;          // nada nuevo que pintar\n  const img = nearest(target);\n  if (!img) return;\n  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);\n  current = target;\n}\n\n// canvas a su tamaño real, con la densidad limitada a 2\nconst dpr = Math.min(devicePixelRatio, 2);\ncanvas.width = canvas.clientWidth * dpr;\ncanvas.height = canvas.clientHeight * dpr;"
 },
 {
  "leccion": "rendimiento",
  "archivo": "12-rendimiento.html",
  "titulo": "Rendimiento y accesibilidad del movimiento",
  "seccion": "The Residence",
  "etiqueta": "CSS: el movimiento espacial solo si el usuario no pide lo contrario",
  "lang": "css",
  "codigo": ".escena { transition: opacity .5s; }                     /* base: fundido */\n\n@media (prefers-reduced-motion: no-preference) {\n  .escena { transition: transform 1.4s var(--ease), opacity .8s .6s; }\n  .is-open .escena { transform: scale(4.5); }           /* el vuelo, solo para quien lo quiere */\n}"
 },
 {
  "leccion": "rendimiento",
  "archivo": "12-rendimiento.html",
  "titulo": "Rendimiento y accesibilidad del movimiento",
  "seccion": "The Residence",
  "etiqueta": "GSAP: dos versiones de la misma escena",
  "lang": "js",
  "codigo": "const mm = gsap.matchMedia();\n\nmm.add({\n  full: '(prefers-reduced-motion: no-preference)',\n  reduce: '(prefers-reduced-motion: reduce)',\n  mobile: '(max-width: 700px)',\n}, ({ conditions: c }) => {\n  if (c.reduce) {\n    // sin scrub de cámara: fundidos que se disparan al llegar a cada sección\n    gsap.utils.toArray('.plano').forEach((el) =>\n      gsap.from(el, { autoAlpha: 0, duration: 0.6, scrollTrigger: { trigger: el, start: 'top 70%' } }));\n    return;\n  }\n  // versión completa; en móvil, pin más corto\n  gsap.to('.torre', { scale: 4.5, scrollTrigger: { trigger: '.vuelo', pin: true, scrub: true, end: c.mobile ? '+=150%' : '+=300%' } });\n});"
 },
 {
  "leccion": "proyecto",
  "archivo": "13-proyecto.html",
  "titulo": "Proyecto final: la torre",
  "seccion": "Mapa de la web",
  "etiqueta": "Archivos de la landing",
  "lang": "txt",
  "codigo": "landing/\n  index.html                 estructura y textos\n  css/landing.css            paleta, tipografía, secciones y móvil\n  js/landing.js              secuencia, timeline, plantas, menú y formulario\n  js/residencia.min.js       la maqueta 3D (generada, no se edita a mano)\n  src/residencia.js          código fuente de la maqueta en Three.js\n  frames/desk/0001-0120.webp secuencia 16:9 (1280 × 720, 3,3 MB)\n  frames/mob/0001-0120.webp  secuencia 9:16 (720 × 1280, 3,7 MB)\n  media/                     imágenes fijas y coordenadas de plantas (JSON)\n  package.json               solo para reconstruir residencia.min.js"
 },
 {
  "leccion": "proyecto",
  "archivo": "13-proyecto.html",
  "titulo": "Proyecto final: la torre",
  "seccion": "Paleta y tipografía: tres decisiones",
  "etiqueta": "landing/css/landing.css (inicio)",
  "lang": "css",
  "codigo": ":root {\n  /* Tres decisiones y el resto se deriva */\n  --noche: oklch(17% 0.05 292);\n  --crema: oklch(95% 0.016 78);\n  --ventana: oklch(80% 0.13 68);\n\n  --noche-2: oklch(from var(--noche) calc(l + 0.05) c h);\n  --crema-2: oklch(from var(--crema) calc(l - 0.18) calc(c * 1.6) h);\n  --crema-line: oklch(from var(--crema) l c h / 0.16);\n\n  --t-display: clamp(3rem, 1.4rem + 7vw, 8.4rem);\n  --t-h2: clamp(2.4rem, 1.5rem + 4vw, 5.2rem);\n}"
 },
 {
  "leccion": "proyecto",
  "archivo": "13-proyecto.html",
  "titulo": "Proyecto final: la torre",
  "seccion": "La llegada",
  "etiqueta": "landing/js/landing.js (extracto)",
  "lang": "js",
  "codigo": "const tl = gsap.timeline({\n  defaults: { ease: 'none' },\n  scrollTrigger: { trigger: '.arrival', start: 'top top', end: 'bottom bottom', scrub: 0.6 },\n});\ntl.to(seq, { f: FRAMES - 1, duration: 1, onUpdate: () => draw(seq.f) }, 0)\n  .to('.phase-1', { autoAlpha: 0, y: -40, duration: 0.1 }, 0.16)\n  .fromTo('.phase-2', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.34)\n  .to('.phase-2', { autoAlpha: 0, y: -40, duration: 0.08 }, 0.58)\n  .fromTo('.phase-3', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.78);\n\n// Scroll suave solo con ratón\nif (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {\n  lenis = new Lenis({ lerp: 0.1 });\n  lenis.on('scroll', ScrollTrigger.update);\n  gsap.ticker.add((t) => lenis.raf(t * 1000));\n  gsap.ticker.lagSmoothing(0);\n}"
 },
 {
  "leccion": "proyecto",
  "archivo": "13-proyecto.html",
  "titulo": "Proyecto final: la torre",
  "seccion": "Las plantas",
  "etiqueta": "Polígono de cada planta proyectado desde Three.js",
  "lang": "js",
  "codigo": "// Para cada planta: puntos del contorno a la altura del suelo y del techo,\n// proyectados a pantalla y reducidos a su envolvente convexa\nconst pts = balconyShape.getSpacedPoints(48);\nfor (let f = 0; f < 30; f++) {\n  const proj = [];\n  for (const y of [f * FH, (f + 1) * FH]) for (const p of pts) {\n    const v = new THREE.Vector3(p.x, y, -p.y).project(camera);\n    proj.push([(v.x + 1) / 2, (1 - v.y) / 2]);   // de -1…1 a 0…1\n  }\n  polygons.push(convexHull(proj));\n}"
 },
 {
  "leccion": "proyecto",
  "archivo": "13-proyecto.html",
  "titulo": "Proyecto final: la torre",
  "seccion": "La residencia en 3D",
  "etiqueta": "Carga bajo demanda y View Transition",
  "lang": "js",
  "codigo": "new IntersectionObserver((e, o) => {\n  if (e[0].isIntersecting) { ensureResidence(); o.disconnect(); }\n}, { rootMargin: '800px 0px' }).observe(document.querySelector('#residencia'));\n\nfunction ensureResidence() {\n  return (loading ??= import('./residencia.min.js').then(({ createResidencia }) => {\n    residence = createResidencia(canvas, { onFocus: showRoom });\n  }));\n}\n\n// De la planta elegida a la residencia, con un fundido de toda la página\nopenButton.addEventListener('click', () => {\n  const go = () => { floorLabel.textContent = `Planta ${activeFloor}`; scrollToEl(residencia); };\n  document.startViewTransition && !reduce ? document.startViewTransition(go) : go();\n});"
 },
 {
  "leccion": "proyecto",
  "archivo": "13-proyecto.html",
  "titulo": "Proyecto final: la torre",
  "seccion": "La residencia en 3D",
  "etiqueta": "Reconstruir residencia.min.js después de tocar src/residencia.js",
  "lang": "txt",
  "codigo": "cd landing\nnpm install\nnpm run build"
 }
];
