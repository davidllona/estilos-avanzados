# Hora azul · cuaderno de color y movimiento

Cuaderno de estudio interactivo, en español, para pasar de «CSS normal» a webs como las de los vídeos de scroll cinematográfico: paletas con criterio, composición que no sea solo cards, animaciones de scroll y la torre residencial con plantas interactivas.

**Verlo:** https://davidllona.github.io/estilos-avanzados/

Está pensado para repasarse desde el **móvil**. Cada demo tiene un botón «Ver en móvil» y cada lección tiene apartados «En el móvil» que explican qué funciona en el teléfono, qué no y cómo adaptarlo.

## Qué contiene

Una **ruta por niveles**: de diseño en 2D a webs con 3D de verdad. Cada nivel termina con un proyecto, una landing completa que usa todo lo aprendido.

| Nivel | Lecciones | Proyecto |
| --- | --- | --- |
| **1 · Fundamentos visuales** | Qué hace que una web parezca cara · Cómo se lee un color · Qué transmite cada color · Por qué unos colores pegan · Acentos · Construir una paleta · Catálogo de paletas · Qué transmite una tipografía · Combinar tipografías · Tipografía, color y fondo · OKLCH · Paletas en CSS · Tipografía en CSS · Composición | *Sorra*, estudio de arquitectura (`proyectos/nivel-1/`) |
| **2 · Movimiento** | Movimiento con criterio · Scroll con CSS · View Transitions · GSAP | *Ressò 2027*, festival (`proyectos/nivel-2/`) |
| **3 · Scroll cinematográfico** | Secuencias de fotogramas · Capas interactivas · Recursos con IA · Rendimiento | *Vésper*, la torre en fotogramas (`landing/`) |
| **4 · 3D de verdad** | Three.js en una web · 3D guiado por el scroll · Shaders · Modelos GLB · Interacción en 3D | *Lucero*, la torre en tiempo real (`proyectos/torre-3d/`) |
| Referencia · Diseñar por sector | Cómo se piensa una web · Webs que venden emoción · Webs que venden confianza | |

Además:

- **`index.html`** · la portada: la torre en 3D en tiempo real; al bajar, la cámara sube planta a planta y cada tramo es un nivel.
- **`laboratorio.html`** · laboratorio de color: mueve los tres colores de la paleta y mira qué combina, qué no y por qué; web cara contra web barata; diez paletas explicadas.
- **`radar.html`** · novedades de CSS y animación con su soporte real en Chrome, Safari y Firefox. Los datos están en `assets/js/radar-data.js`.
- **`chuleta.html`** · todos los fragmentos de código del cuaderno con buscador.

## Formato de cada lección

- Demos en vivo (**laboratorios**): el código que ves es exactamente el que se ejecuta. «Editar» lo convierte en un editor y la demo se actualiza al escribir; «Deshacer cambios» lo restaura; «Ver en móvil» la muestra a 390 px.
- Cada lección tiene identidad propia (paleta y tipografía en un `<style>` que redefine los tokens de `base.css`) y una portada a pantalla completa con la técnica de la lección funcionando.
- Recuadros **Criterio** (decisiones de diseño), **En el móvil**, **Ojo** (trampas) y **Soporte** (navegadores, con datos de Baseline de noviembre de 2026).
- Tests de predicción y comprobación, «Entender más» plegado, resumen de tres puntos y un reto práctico.
- El progreso se guarda en el `localStorage` del navegador: en la portada, cada lección terminada se marca como «Hecha» y el botón principal te lleva a la siguiente.

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
index.html                portada: la torre 3D y la ruta por niveles
laboratorio.html          laboratorio de color
radar.html, chuleta.html  novedades y chuleta
lecciones/NN-*.html       una página por lección
assets/css/base.css       estilos del cuaderno (paleta «hora azul», componentes, responsive)
assets/css/demo.css       base que se carga dentro de cada demo (fuentes y reset)
assets/js/cuaderno.js     motor: temario, barra, índice lateral, laboratorios, tests y progreso
assets/js/torre3d.js      la torre en Three.js (portada, lección de 3D con scroll)
assets/models/            residencia.glb para la lección de modelos
assets/js/radar-data.js   datos del radar y de la tabla de soporte
assets/js/chuleta-data.js generado con tools/generar_chuleta.py
assets/media/             vídeo de la torre para la demo de currentTime
assets/fonts/             12 familias (Bricolage, Newsreader, Fraunces, Bodoni Moda, Syne, Archivo…); ver assets/css/fonts.css
vendor/                   GSAP 3.15 (ScrollTrigger, SplitText, Flip), Lenis 1.3, Prism y Three.js r187 (con addons), en local
proyectos/                landings de los niveles 1, 2 y 4
landing/                  la landing Vésper, proyecto del nivel 3 (ver abajo)
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
   `data-libs` admite `gsap scrolltrigger splittext flip lenis`. Con `data-three` el bloque JS se carga como módulo con un import map: `import * as THREE from 'three'` y `three/addons/...`.
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

- Material de estudio personal. Sorra, Ressò, Vésper y Lucero son proyectos ficticios.
- [GSAP](https://gsap.com) (licencia estándar sin coste de Webflow), [Lenis](https://github.com/darkroomengineering/lenis) (MIT), [Prism](https://prismjs.com) (MIT) y [Three.js](https://threejs.org) (MIT) están en `vendor/` y `landing/js/`.
- Fuentes con licencia SIL Open Font License, vía Fontsource.
