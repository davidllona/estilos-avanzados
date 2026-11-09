/* =========================================================
   Lucero · la torre en tiempo real
   - Recorrido de cámara propio (CatmullRom) que sustituye al de torre3d.js
   - Raycast contra un volumen invisible: la planta sale de la altura del impacto
   - Vuelo a una planta y proyección a pantalla para anclar la ficha HTML
   ========================================================= */
import { createTower } from '../../../assets/js/torre3d.js';
import { NF, FH } from './datos.js';

export function createVuelo(canvas, { lite = false, reduce = false, onFrame = () => {} } = {}) {
  let THREE;                       // llega con la torre: así no hay dos copias de Three
  const S = {};                    // vectores de trabajo (sin crear objetos en cada fotograma)

  /* ---------- Planos clave del recorrido ----------
     C: dónde está la cámara · T: qué mira · sx, sy: dónde cae T en pantalla (-1..1).
     Con sx/sy encuadras como un diseñador («la torre en el tercio derecho»)
     y la cuenta del lookAt se hace sola para cualquier proporción. */
  const KEYS = {
    wide: [
      { C: [74, 4, 360],   T: [0, 46, 0],  sx: 0.18, sy: 0.05 },   // 0  llegada por el agua
      { C: [34, 9, 196],   T: [0, 34, 0],  sx: 0.22, sy: 0 },      // 1  la torre crece
      { C: [-8, 13, 92],   T: [0, 26, 0],  sx: 0.25, sy: -0.05 },  // 2  al pie
      { C: [-46, 36, 48],  T: [0, 44, 0],  sx: 0.3,  sy: 0 },      // 3  sube pegada a la fachada
      { C: [-36, 76, 34],  T: [0, 84, 0],  sx: 0.28, sy: 0 },      // 4  últimas plantas
      { C: [8, 118, 46],   T: [3, 97, 3],  sx: 0.18, sy: -0.1 },   // 5  azotea
      { C: [60, 20, 178],  T: [0, 52, 0],  sx: 0.24, sy: -0.03 },      // 6  la torre entera: elegir planta
    ],
    tall: [
      { C: [40, 4, 330],   T: [0, 50, 0],  sx: 0, sy: 0.12 },
      { C: [22, 8, 170],   T: [0, 40, 0],  sx: 0, sy: 0.1 },
      { C: [-6, 12, 74],   T: [0, 30, 0],  sx: 0, sy: 0.12 },
      { C: [-40, 34, 42],  T: [0, 46, 0],  sx: 0, sy: 0.1 },
      { C: [-30, 74, 30],  T: [0, 86, 0],  sx: 0, sy: 0.1 },
      { C: [10, 120, 40],  T: [3, 97, 3],  sx: 0, sy: 0.05 },
      { C: [46, 34, 200],  T: [0, 48, 0],  sx: 0, sy: 0.22 },
    ],
  };

  let curves = null, curvesAspect = 0;
  function lookFor(C, T, sx, sy, cam, out) {
    // desplaza el punto de mira para que T caiga en (sx, sy) de la pantalla
    const dir = S.d.copy(T).sub(C); const dist = dir.length(); dir.normalize();
    const right = S.r.crossVectors(dir, S.up).normalize();
    const up = S.u.crossVectors(right, dir).normalize();
    const tanV = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), tanH = tanV * cam.aspect;
    return out.copy(T).addScaledVector(right, -sx * dist * tanH).addScaledVector(up, -sy * dist * tanV);
  }
  function buildCurves(cam) {
    const set = cam.aspect < 0.8 ? KEYS.tall : KEYS.wide;
    const C = set.map((k) => new THREE.Vector3(...k.C));
    const L = set.map((k, i) => lookFor(C[i], S.t.set(...k.T), k.sx, k.sy, cam, new THREE.Vector3()));
    curves = { C: new THREE.CatmullRomCurve3(C, false, 'centripetal'), L: new THREE.CatmullRomCurve3(L, false, 'centripetal') };
    curvesAspect = cam.aspect;
  }

  /* ---------- Pose de una planta (la cámara se acerca a su fachada) ---------- */
  function floorPose(f, cam, outC, outL) {
    const y = f * FH + FH / 2;
    const tall = cam.aspect < 0.8;
    S.t.set(0, y, 0);
    outC.set(...(tall ? [24, y + 9, 66] : [30, y + 6, 46]));
    lookFor(outC, S.t, tall ? 0 : -0.3, tall ? 0.32 : 0, cam, outL);
  }

  /* ---------- Estado: vuelo a planta y paralaje del puntero ---------- */
  const fly = { from: null, to: null, t0: 0, dur: 1.5, active: false };
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let lastC, lastL, baseC, baseL, flyC, flyL;

  function path(t, cam, look) {
    if (!curves || Math.abs(cam.aspect - curvesAspect) > 0.01) buildCurves(cam);
    const u = t * t * (3 - 2 * t) * 0.18 + t * 0.82;          // un poco de reposo al empezar y al acabar
    curves.C.getPoint(u, baseC); curves.L.getPoint(u, baseL);
    let C = baseC, L = baseL;
    if (fly.active) {
      const k = Math.min(1, (performance.now() - fly.t0) / (fly.dur * 1000)), e = ease(k);
      const fromC = fly.from ? fly.from.C : baseC, fromL = fly.from ? fly.from.L : baseL;
      if (fly.to != null) floorPose(fly.to, cam, flyC, flyL); else { flyC.copy(baseC); flyL.copy(baseL); }
      C = S.c2.lerpVectors(fromC, flyC, e); L = S.l2.lerpVectors(fromL, flyL, e);
      if (k >= 1 && fly.to == null) fly.active = false;      // de vuelta al recorrido
    }
    cam.position.copy(C);
    cam.position.x += par.x; cam.position.y += par.y;
    look.copy(L);
    cam.lookAt(look);
    lastC.copy(C); lastL.copy(L);
    cam.updateMatrixWorld();
    onFrame(api);
  }

  const tower = createTower(canvas, { lite, path });
  THREE = tower.THREE;
  Object.assign(S, { d: new THREE.Vector3(), r: new THREE.Vector3(), u: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0),
    t: new THREE.Vector3(), c2: new THREE.Vector3(), l2: new THREE.Vector3(), p: new THREE.Vector3() });
  lastC = new THREE.Vector3(); lastL = new THREE.Vector3(); baseC = new THREE.Vector3(); baseL = new THREE.Vector3();
  flyC = new THREE.Vector3(); flyL = new THREE.Vector3();
  const { camera, scene } = tower;

  /* ---------- Volumen invisible para el raycast ----------
     Una sola malla con la planta de la torre (30 × 3,2 m de alto).
     material.visible = false: no se pinta, pero el rayo sí la toca. */
  function rrect(w, d, r) {
    const s = new THREE.Shape();
    s.moveTo(-w + r, -d); s.lineTo(w - r, -d); s.quadraticCurveTo(w, -d, w, -d + r);
    s.lineTo(w, d - r); s.quadraticCurveTo(w, d, w - r, d); s.lineTo(-w + r, d);
    s.quadraticCurveTo(-w, d, -w, d - r); s.lineTo(-w, -d + r); s.quadraticCurveTo(-w, -d, -w + r, -d);
    return s;
  }
  const hitGeo = new THREE.ExtrudeGeometry(rrect(12.6, 8.6, 6.2), { depth: NF * FH, bevelEnabled: false, curveSegments: 8 });
  hitGeo.rotateX(-Math.PI / 2);
  const hitbox = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ visible: false }));
  scene.add(hitbox);
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

  /* ---------- Anillo de la planta activa ----------
     El shader de la torre ya enciende las ventanas (highlight); el anillo suma un
     contorno luminoso que el bloom convierte en halo: se lee incluso con la torre pequeña. */
  const ring = new THREE.Group(); ring.visible = false; scene.add(ring);
  const ringPts = rrect(13.1, 9.1, 6.7).getSpacedPoints(96).map((p) => new THREE.Vector3(p.x, 0, -p.y));
  const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
  const ringMat = new THREE.LineBasicMaterial({ color: new THREE.Color(2.4, 1.5, 0.75), transparent: true, opacity: 1, depthWrite: false });
  const lineLow = new THREE.LineLoop(ringGeo, ringMat), lineHigh = new THREE.LineLoop(ringGeo, ringMat);
  lineHigh.position.y = FH;
  const bandGeo = new THREE.ExtrudeGeometry(rrect(13.1, 9.1, 6.7), { depth: FH, bevelEnabled: false, curveSegments: 12 });
  bandGeo.rotateX(-Math.PI / 2);
  const bandMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.62, 0.3), transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  ring.add(lineLow, lineHigh, new THREE.Mesh(bandGeo, bandMat));
  const WARM = new THREE.Color(2.4, 1.5, 0.75), COOL = new THREE.Color(0.9, 0.85, 1.1);

  function pickAt(clientX, clientY) {
    const b = canvas.getBoundingClientRect();
    ndc.set(((clientX - b.left) / b.width) * 2 - 1, -((clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(hitbox, false)[0];
    return hit ? Math.min(NF - 1, Math.max(0, Math.floor(hit.point.y / FH))) : -1;
  }

  /* ---------- Resaltado: el hover manda sobre la selección mientras dura ---------- */
  let hovered = -1, selected = -1, dimmed = () => false;
  function applyHighlight() {
    const f = hovered >= 0 ? hovered : selected;
    if (f < 0) { tower.highlight(-1, -1, 0); ring.visible = false; return; }
    const dim = dimmed(f);
    tower.highlight(f, f, dim ? 0.45 : 1);
    ring.visible = true; ring.position.y = f * FH;
    ringMat.color.copy(dim ? COOL : WARM); ringMat.opacity = dim ? 0.5 : 1;
    bandMat.opacity = dim ? 0.05 : 0.14;
  }

  /* ---------- Bucle propio solo mientras hay animación (vuelo o paralaje) ---------- */
  let looping = false;
  function loop() {
    const settling = Math.abs(par.tx - par.x) > 0.01 || Math.abs(par.ty - par.y) > 0.01;
    if (settling) { par.x += (par.tx - par.x) * 0.06; par.y += (par.ty - par.y) * 0.06; }
    const flying = fly.active && (performance.now() - fly.t0) < fly.dur * 1000 + 50;
    if (settling || flying) { tower.invalidate(); requestAnimationFrame(loop); } else { looping = false; tower.invalidate(); }
  }
  const kick = () => { if (!looping) { looping = true; requestAnimationFrame(loop); } };

  function flyTo(f) {
    fly.from = fly.active || f == null ? { C: lastC.clone(), L: lastL.clone() } : null;
    fly.to = f; fly.t0 = performance.now(); fly.dur = reduce ? 0.001 : 1.5; fly.active = true;
    kick();
  }

  const api = {
    tower, camera, THREE,
    setProgress(p) { tower.setProgress(p, reduce); },
    pickAt,
    hover(f) { if (f !== hovered) { hovered = f; applyHighlight(); } },
    select(f) { selected = f; applyHighlight(); },
    setDimmed(fn) { dimmed = fn; },
    focus(f) { flyTo(f); },
    unfocus() { if (fly.active && fly.to != null) flyTo(null); },
    get focused() { return fly.active ? fly.to : null; },
    parallax(x, y) { if (reduce || lite) return; par.tx = x * 4; par.ty = y * 2; kick(); },
    // altura de la cámara expresada como planta (para el contador durante el vuelo)
    cameraFloor() { return Math.min(NF - 1, Math.max(0, Math.floor(camera.position.y / FH))); },
    cameraHeight() { return camera.position.y; },
    // dónde cae en pantalla un punto de una planta (para anclar HTML al 3D)
    // devuelve el punto más a la derecha (side 1) o a la izquierda (side -1) del contorno de la planta
    project(f, side = 1) {
      let best = null;
      for (const q of ringPts) {
        const v = S.p.set(q.x, f * FH + FH / 2, q.z).project(camera);
        if (!best || v.x * side > best.x * side) best = { x: v.x, y: v.y, z: v.z };
      }
      return { x: (best.x + 1) / 2, y: (1 - best.y) / 2, visible: best.z < 1 };
    },
    // centro de la planta en pantalla (para pruebas y etiquetas)
    projectCenter(f) {
      const v = S.p.set(0, f * FH + FH / 2, 9.2).project(camera);
      return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 };
    },
    pause: () => tower.pause(), resume: () => tower.resume(),
  };
  return api;
}
