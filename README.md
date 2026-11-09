# Hora azul · cuaderno de color y movimiento

Cuaderno de estudio interactivo, en español, para pasar de «CSS normal» a webs como las de los vídeos de scroll cinematográfico: paletas con criterio, composición que no sea solo cards, animaciones de scroll y la torre residencial con plantas interactivas.

**Verlo:** https://davidllona.github.io/estilos-avanzados/

Está pensado para repasarse desde el **móvil**. Cada demo tiene un botón «Ver en móvil» y cada lección tiene apartados «En el móvil» que explican qué funciona en el teléfono, qué no y cómo adaptarlo.

## Qué contiene

El cuaderno explica **el porqué** del diseño: qué transmite cada color, por qué unos pegan con otros, qué tipografía va con qué fondo y cómo se piensa una web según el negocio. La técnica de CSS y el scroll cinematográfico quedan como bloque extra.

| Bloque | Lecciones |
| --- | --- |
| Antes de empezar | Qué hace que una web parezca cara |
| **Color** | Cómo se lee un color · Qué transmite cada color · Por qué unos colores pegan · El toque: acentos que lo cambian todo · Construir una paleta paso a paso · Catálogo de paletas explicadas |
| **Tipografía** | Qué transmite una tipografía · Combinar tipografías · Tipografía, color y fondo |
| **Diseño web** | Cómo se piensa una web · Webs que venden emoción · Webs que venden confianza |
| Técnica (el extra) | OKLCH · Paletas en CSS · Tipografía en CSS · Composición · Movimiento · Scroll con CSS · View Transitions · GSAP · Secuencias · Capas interactivas · Recursos con IA · Rendimiento · Proyecto final: la torre |

Además:

- **`landing/`** · *Vésper*, la landing final con todas las técnicas: llegada a la torre con 120 fotogramas controlados por el scroll (versión 16:9 y 9:16), plantas que se iluminan sobre la imagen, la residencia en 3D en tiempo real con Three.js, View Transitions, scroll-driven CSS y Lenis.
- **`radar.html`** · novedades de CSS y animación con su soporte real en Chrome, Safari y Firefox. Los datos están en `assets/js/radar-data.js`.
- **`chuleta.html`** · todos los fragmentos de código del cuaderno con buscador.

## Formato de cada lección

- Demos en vivo (**laboratorios**): el código que ves es exactamente el que se ejecuta. «Editar» lo convierte en un editor y la demo se actualiza al escribir; «Deshacer cambios» lo restaura; «Ver en móvil» la muestra a 390 px.
- Cada lección tiene identidad propia (paleta y tipografía en un `<style>` que redefine los tokens de `base.css`) y una portada a pantalla completa con la técnica de la lección funcionando.
- Recuadros **Criterio** (decisiones de diseño), **En el móvil**, **Ojo** (trampas) y **Soporte** (navegadores, con datos de Baseline de noviembre de 2026).
- Tests de predicción y comprobación, «Entender más» plegado, resumen de tres puntos y un reto práctico.
- El progreso se guarda en el `localStorage` del navegador: en la portada, cada lección terminada enciende una planta de la torre.

## Verlo en local

Es una web estática sin build. Sírvela desde la raíz del repo:

```bash
python3 -m http.server 8000   # y abre http://localhost:8000
# o bien
npx serve
```

## Publicar en GitHub Pages

En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`. En un minuto queda en `https://davidllona.github.io/estilos-avanzados/`. El archivo `.nojekyll` ya está incluido.

## Estructura

```
index.html                portada: torre de progreso y temario
radar.html, chuleta.html  novedades y chuleta
lecciones/NN-*.html       una página por lección
assets/css/base.css       estilos del cuaderno (paleta «hora azul», componentes, responsive)
assets/css/demo.css       base que se carga dentro de cada demo (fuentes y reset)
assets/js/cuaderno.js     motor: temario, barra, índice lateral, laboratorios, tests y progreso
assets/js/radar-data.js   datos del radar y de la tabla de soporte
assets/js/chuleta-data.js generado con tools/generar_chuleta.py
assets/media/             vídeo de la torre para la demo de currentTime
assets/fonts/             12 familias (Bricolage, Newsreader, Fraunces, Bodoni Moda, Syne, Archivo…); ver assets/css/fonts.css
vendor/                   GSAP 3.15 (ScrollTrigger, SplitText, Flip), Lenis 1.3 y Prism, en local
landing/                  la landing Vésper (ver abajo)
tools/                    scripts de mantenimiento
```

## Cómo añadir una lección

1. Copia una lección existente (la `01-oklch.html` es la más sencilla) y cambia `data-lesson`.
2. Regístrala en el array `LESSONS` de `assets/js/cuaderno.js` (id, archivo, título, bloque y minutos). La portada, la paginación y el índice salen de ahí.
3. Laboratorio:
   ```html
   <figure class="lab" data-title="Título" data-hint="Qué hacer" data-height="380" data-height-mobile="520" data-libs="gsap scrolltrigger">
     <script type="text/x-demo" data-lang="html"> … </script>
     <script type="text/x-demo" data-lang="css"> … </script>
     <script type="text/x-demo" data-lang="js"> … </script>
     <figcaption>Qué observar.</figcaption>
   </figure>
   ```
   `data-libs` admite `gsap scrolltrigger splittext flip lenis`.
4. Código suelto: `<script type="text/x-code" data-lang="css" data-label="opcional"> … </script>`.
5. Test: `<div class="quiz" data-answer="2"><p class="q">…</p><ol><li>…</li></ol><p class="why">…</p></div>` (`data-answer` empieza en 1).
6. Vuelve a generar la chuleta: `python3 tools/generar_chuleta.py`.

## La landing

- `landing/frames/desk` y `landing/frames/mob`: 120 fotogramas WebP cada una (1280 × 720 y 720 × 1280), renderizados con una escena procedimental de Three.js.
- `landing/media/plantas-*.json`: polígonos de cada planta en coordenadas 0–1, proyectados con la misma cámara del render.
- `tools/torre/escena.html` y `tools/torre/renderizar.py`: la escena de la torre y el script que la renderiza fotograma a fotograma (necesita `cd landing && npm install` para tener Three.js y `pip install playwright`).
- `landing/src/residencia.js`: la maqueta 3D. Para regenerar `landing/js/residencia.min.js`:
  ```bash
  cd landing && npm install && npm run build
  ```

## Créditos y licencias

- Material de estudio personal. Vésper es un proyecto ficticio.
- [GSAP](https://gsap.com) (licencia estándar sin coste de Webflow), [Lenis](https://github.com/darkroomengineering/lenis) (MIT), [Prism](https://prismjs.com) (MIT) y [Three.js](https://threejs.org) (MIT) están en `vendor/` y `landing/js/`.
- Fuentes con licencia SIL Open Font License, vía Fontsource.
