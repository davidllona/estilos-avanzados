/* =========================================================
   La residencia: planta isométrica en 3D en tiempo real.
   Se empaqueta con esbuild en ../js/residencia.min.js
   (npm run build en la carpeta landing/, ver README).
   ========================================================= */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const ROOMS = [
  { id: 'salon',      name: 'Salón',               m2: 42, x: [-10, -1.2], z: [-1.6, 6],  cam: [-13, 7.5, 13],  look: [-5.6, 0.4, 2.2] },
  { id: 'cocina',     name: 'Cocina y comedor',    m2: 28, x: [-1.2, 4.6], z: [-1.6, 6],  cam: [6, 7.5, 13],    look: [1.6, 0.4, 2.2] },
  { id: 'principal',  name: 'Dormitorio principal', m2: 24, x: [4.6, 10],  z: [-6, 2.6],  cam: [15, 8, 4.5],    look: [7.3, 0.4, -1.8] },
  { id: 'bano',       name: 'Baño en suite',        m2: 9,  x: [4.6, 10],  z: [2.6, 6],   cam: [13.5, 7, 11],   look: [7.3, 0.3, 4.3] },
  { id: 'estudio',    name: 'Estudio',              m2: 14, x: [-10, -3.4], z: [-6, -1.6], cam: [-15, 7.5, -1], look: [-6.7, 0.4, -3.8] },
  { id: 'terraza',    name: 'Terraza',              m2: 31, x: [-10, 10],  z: [6, 9.2],   look: [0, 0.3, 7.6], dir: [0.15, 0.75, 1] },
];

const C = {
  oak: 0xc89a6c, wall: 0xefe6da, fabric: 0xe9e2d6, fabric2: 0xb9a48c, walnut: 0x5a3a26, stone: 0xd9d2c8,
  metal: 0x1d1a20, leaf: 0x4f6b45, leaf2: 0x6f8a5a, water: 0x7fd6d0, rug: 0xd8ccbb, bed: 0xf2ede4,
};

function plankTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#c4945f'; g.fillRect(0, 0, 512, 512);
  let seed = 3; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < 512; y += 32) {
    let x = -r() * 200;
    while (x < 512) {
      const w = 140 + r() * 160, l = 48 + r() * 18;
      g.fillStyle = `hsl(30 ${26 + r() * 10}% ${l}%)`; g.fillRect(x, y, w, 31);
      g.globalAlpha = 0.08; for (let i = 0; i < 6; i++) { g.fillStyle = r() > .5 ? '#000' : '#fff'; g.fillRect(x, y + r() * 31, w, 1); } g.globalAlpha = 1;
      g.fillStyle = 'rgba(40,20,10,.35)'; g.fillRect(x, y, 1.5, 31);
      x += w;
    }
    g.fillStyle = 'rgba(40,20,10,.3)'; g.fillRect(0, y + 31, 512, 1);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2.5); t.anisotropy = 8;
  return t;
}

export function createResidencia(canvas, { onHover, onFocus, interactive = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(24, 1, 0.5, 400);
  const HOME = { pos: new THREE.Vector3(26, 27, 30), look: new THREE.Vector3(0, 0, 1.2) };
  camera.position.copy(HOME.pos); camera.lookAt(HOME.look);

  const root = new THREE.Group(); scene.add(root);
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...o });
  const M = {
    oak: new THREE.MeshStandardMaterial({ map: plankTexture(), roughness: 0.55 }),
    wall: mat(0xe2d8cc, { roughness: 0.9 }), fabric: mat(C.fabric, { roughness: 1 }), fabric2: mat(C.fabric2, { roughness: 1 }),
    walnut: mat(C.walnut, { roughness: 0.5 }), stone: mat(C.stone, { roughness: 0.35 }), metal: mat(C.metal, { roughness: 0.35, metalness: 0.6 }),
    leaf: mat(C.leaf), leaf2: mat(C.leaf2), rug: mat(C.rug, { roughness: 1 }), bed: mat(C.bed, { roughness: 1 }),
    water: new THREE.MeshStandardMaterial({ color: C.water, roughness: 0.05, metalness: 0.1, emissive: 0x2a8f8a, emissiveIntensity: 0.4 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xcfd8f0, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.18, depthWrite: false }),
    slab: mat(0xcbb8a6, { roughness: 0.8 }), deck: mat(0x9a7a5f, { roughness: 0.8 }),
    lamp: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.82, 0.6) }),
  };
  const box = (w, h, d, m, x, y, z, r = 0.04) => {
    const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y + h / 2, z); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); return mesh;
  };
  const cyl = (rt, rb, h, m, x, y, z, seg = 24) => { const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); mesh.position.set(x, y + h / 2, z); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); return mesh; };
  const plant = (x, z, s = 1) => { cyl(0.32 * s, 0.26 * s, 0.55 * s, M.stone, x, 0, z); const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 * s, 1), M.leaf); l.position.set(x, 1.0 * s, z); l.scale.y = 1.25; l.castShadow = true; root.add(l); const l2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42 * s, 1), M.leaf2); l2.position.set(x + 0.25 * s, 1.45 * s, z - 0.1); l2.castShadow = true; root.add(l2); };

  /* Losa con el contorno curvo de la torre */
  const shape = new THREE.Shape();
  const W = 10.8, D0 = -6.4, D1 = 9.6, R = 3.4;
  shape.moveTo(-W + R, D0); shape.lineTo(W - R, D0); shape.quadraticCurveTo(W, D0, W, D0 + R); shape.lineTo(W, D1 - R); shape.quadraticCurveTo(W, D1, W - R, D1);
  shape.lineTo(-W + R, D1); shape.quadraticCurveTo(-W, D1, -W, D1 - R); shape.lineTo(-W, D0 + R); shape.quadraticCurveTo(-W, D0, -W + R, D0);
  const slabGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3, curveSegments: 24 });
  slabGeo.rotateX(Math.PI / 2);
  const slab = new THREE.Mesh(slabGeo, M.slab); slab.position.y = -0.12; slab.receiveShadow = true; root.add(slab);
  // suelo interior de roble y tarima en la terraza
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), M.oak); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.01, 0); floor.receiveShadow = true; root.add(floor);
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(14.4, 3.4), M.deck); deck.rotation.x = -Math.PI / 2; deck.position.set(0, 0.012, 7.6); deck.receiveShadow = true; root.add(deck);

  /* Muros (cortados a media altura, como una maqueta) */
  const WH = 2.1, T = 0.18;
  const wall = (x0, z0, x1, z1) => { const w = Math.abs(x1 - x0) || T, d = Math.abs(z1 - z0) || T; box(w + (x1 !== x0 ? T : 0), WH, d + (z1 !== z0 ? T : 0), M.wall, (x0 + x1) / 2, 0, (z0 + z1) / 2, 0.02); };
  wall(-10, -6, 10, -6); wall(-10, -6, -10, 6); wall(10, -6, 10, 6);
  wall(-3.4, -6, -3.4, -3.6); wall(-10, -1.6, -5.2, -1.6);
  wall(4.6, -6, 4.6, -3.2); wall(4.6, -1.2, 4.6, 6); wall(4.6, 2.6, 7.2, 2.6); wall(8.6, 2.6, 10, 2.6);
  // fachada de vidrio hacia la terraza
  const glassFront = new THREE.Mesh(new THREE.BoxGeometry(20, WH + 0.3, 0.06), M.glass); glassFront.position.set(0, (WH + 0.3) / 2, 6); root.add(glassFront);
  // barandilla de vidrio de la terraza
  const rail = new THREE.Mesh(new THREE.BoxGeometry(14, 1.0, 0.05), M.glass); rail.position.set(0, 0.5, 9.5); root.add(rail);

  /* Salón */
  box(9.2, 0.02, 5.2, M.rug, -5.6, 0.012, 2.6, 0);
  box(4.6, 0.45, 1.05, M.fabric, -6.2, 0, 4.4, 0.18); box(4.6, 0.55, 0.3, M.fabric, -6.2, 0.45, 4.85, 0.14);
  box(1.05, 0.45, 2.6, M.fabric, -8.85, 0, 2.6, 0.18); box(0.3, 0.55, 2.6, M.fabric, -9.25, 0.45, 2.6, 0.14);
  box(2.2, 0.32, 1.1, M.stone, -5.8, 0, 2.3, 0.1);
  cyl(0.55, 0.55, 0.6, M.fabric2, -3.0, 0, 1.0, 32); cyl(0.55, 0.55, 0.6, M.fabric2, -2.9, 0, 3.0, 32);
  box(4.2, 0.9, 0.5, M.walnut, -6.4, 0, -1.25, 0.04);           // mueble bajo con chimenea
  box(1.6, 0.35, 0.08, M.lamp, -6.4, 0.32, -0.98, 0);            // llama
  plant(-9.3, -0.8, 1.1);
  /* Cocina y comedor */
  box(3.2, 0.95, 1.1, M.stone, 1.6, 0, 1.6, 0.05);
  for (let i = 0; i < 3; i++) cyl(0.2, 0.18, 0.75, M.walnut, 0.6 + i * 1.0, 0, 2.55);
  box(5.4, 0.95, 0.7, M.walnut, 1.7, 0, -1.2, 0.03); box(5.4, 0.06, 0.72, M.stone, 1.7, 0.95, -1.2, 0.01);
  box(2.8, 0.06, 1.2, M.walnut, 1.8, 0.72, 4.3, 0.02); box(0.1, 0.72, 0.9, M.metal, 0.6, 0, 4.3, 0); box(0.1, 0.72, 0.9, M.metal, 3.0, 0, 4.3, 0);
  for (const [dx, dz] of [[-0.7, -0.85], [0.7, -0.85], [-0.7, 0.85], [0.7, 0.85]]) box(0.5, 0.45, 0.5, M.fabric2, 1.8 + dx, 0, 4.3 + dz, 0.12);
  cyl(0.28, 0.28, 0.06, M.lamp, 1.8, 1.9, 4.3);
  /* Dormitorio principal */
  box(2.4, 0.45, 2.8, M.walnut, 7.3, 0, -3.6, 0.06); box(2.3, 0.28, 2.3, M.bed, 7.3, 0.45, -3.3, 0.14);
  box(0.7, 0.18, 0.4, M.bed, 6.75, 0.73, -4.6, 0.08); box(0.7, 0.18, 0.4, M.bed, 7.85, 0.73, -4.6, 0.08);
  box(2.4, 0.08, 1.0, M.fabric2, 7.3, 0.74, -2.6, 0.04);
  box(0.6, 0.5, 0.5, M.walnut, 5.65, 0, -4.9, 0.04); box(0.6, 0.5, 0.5, M.walnut, 8.95, 0, -4.9, 0.04);
  cyl(0.12, 0.16, 0.35, M.lamp, 5.65, 0.5, -4.9); cyl(0.12, 0.16, 0.35, M.lamp, 8.95, 0.5, -4.9);
  box(0.65, 2.0, 3.2, M.walnut, 9.5, 0, 0.6, 0.03);
  box(2.6, 0.02, 1.8, M.rug, 7.3, 0.012, -1.4, 0);
  /* Baño */
  box(1.8, 0.6, 0.85, M.stone, 7.4, 0, 5.3, 0.25); box(1.5, 0.05, 0.6, M.water, 7.4, 0.56, 5.3, 0.02);
  box(1.6, 0.85, 0.5, M.walnut, 9.6 - 0.35, 0, 3.6, 0.03); box(0.08, 0.9, 1.2, M.glass, 5.7, 0, 4.4, 0);
  /* Estudio */
  box(2.2, 0.75, 0.8, M.walnut, -6.6, 0, -5.4, 0.03); box(0.55, 0.85, 0.55, M.fabric2, -6.6, 0, -4.4, 0.12);
  box(1.0, 0.04, 0.6, M.metal, -6.6, 0.75, -5.45, 0.01); box(1.2, 1.8, 0.4, M.walnut, -9.6, 0, -4.2, 0.03);
  plant(-4.2, -2.4, 0.8);
  /* Entrada */
  box(1.8, 0.85, 0.45, M.walnut, 0.4, 0, -5.6, 0.03); plant(3.6, -5.2, 0.9);
  /* Terraza */
  for (const x of [-7.5, -5.7]) { box(0.8, 0.3, 2.0, M.fabric, x, 0, 7.7, 0.12); box(0.8, 0.35, 0.4, M.fabric, x, 0.3, 8.55, 0.12); }
  box(3.0, 0.4, 0.9, M.fabric, 1.2, 0, 8.6, 0.15); cyl(0.5, 0.5, 0.35, M.stone, 1.2, 0, 7.4);
  cyl(0.35, 0.35, 0.3, M.lamp, 1.2, 0.35, 7.4);
  for (const x of [-9.4, -3.6, 5.4, 9.3]) plant(x, 8.7, 0.9);
  // jacuzzi de terraza
  box(2.4, 0.5, 2.0, M.stone, 7.6, 0, 7.7, 0.3); box(2.0, 0.05, 1.6, M.water, 7.6, 0.46, 7.7, 0.25);

  /* Zonas de las estancias: invisibles para el ratón y con brillo al pasar por encima */
  const zones = ROOMS.map((r) => {
    const w = r.x[1] - r.x[0], d = r.z[1] - r.z[0];
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.25, d - 0.25), new THREE.MeshBasicMaterial({ color: 0xffb547, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.x = -Math.PI / 2; m.position.set((r.x[0] + r.x[1]) / 2, 0.05, (r.z[0] + r.z[1]) / 2); m.userData.room = r; root.add(m);
    return m;
  });

  /* Luz */
  scene.add(new THREE.HemisphereLight(0xc7b8ff, 0x3a2a30, 0.7));
  const key = new THREE.DirectionalLight(0xffc49a, 2.0);
  key.position.set(-14, 22, 16); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -16; key.shadow.camera.right = 16; key.shadow.camera.top = 16; key.shadow.camera.bottom = -16;
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8e7bff, 0.8); rim.position.set(18, 10, -14); scene.add(rim);
  for (const [x, z] of [[-5.8, 2.3], [1.8, 4.3], [7.3, -3.3], [1.2, 7.4]]) { const p = new THREE.PointLight(0xffb070, 6, 6, 2); p.position.set(x, 1.6, z); scene.add(p); }

  /* Cámara: animación suave entre vistas (sin librerías, para que el módulo sea autónomo) */
  const cur = { pos: HOME.pos.clone(), look: HOME.look.clone() };
  let from = null, to = null, t0 = 0, dur = 1;
  const easeIO = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function flyTo(pos, look, seconds = 1.4) {
    from = { pos: cur.pos.clone(), look: cur.look.clone() }; to = { pos: pos.clone(), look: look.clone() };
    t0 = performance.now(); dur = reduce ? 0.001 : seconds;
  }
  let focused = null;
  function focus(id) {
    const r = ROOMS.find((x) => x.id === id);
    if (!r) return reset();
    focused = r;
    zones.forEach((z) => (z.material.opacity = z.userData.room === r ? 0.22 : 0));
    // la cámara se coloca en la misma diagonal que la vista general, a una distancia según el tamaño de la estancia
    const look = new THREE.Vector3(...r.look);
    const size = Math.max(r.x[1] - r.x[0], r.z[1] - r.z[0]);
    const dir = new THREE.Vector3(...(r.dir || [0.62, 0.8, 0.78])).normalize();
    flyTo(look.clone().addScaledVector(dir, 7 + size * 1.25), look);
    onFocus && onFocus(r);
  }
  function reset() { focused = null; zones.forEach((z) => (z.material.opacity = 0)); flyTo(HOME.pos, HOME.look); onFocus && onFocus(null); }

  /* Ratón / dedo */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let hovered = null;
  function pick(e) {
    const b = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(zones, false)[0];
    return hit ? hit.object.userData.room : null;
  }
  if (interactive) {
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = pick(e);
      if (r !== hovered) {
        hovered = r; canvas.style.cursor = r ? 'pointer' : '';
        zones.forEach((z) => (z.material.opacity = z.userData.room === focused ? 0.22 : z.userData.room === r ? 0.12 : 0));
        onHover && onHover(r);
      }
    });
    canvas.addEventListener('pointerleave', () => { hovered = null; zones.forEach((z) => (z.material.opacity = z.userData.room === focused ? 0.22 : 0)); onHover && onHover(null); });
    canvas.addEventListener('click', (e) => { const r = pick(e); if (r) focus(r.id); });
  }

  /* Tamaño y bucle: solo se dibuja cuando hace falta */
  let w = 0, h = 0, raf = 0, visible = true, dirty = true;
  function resize() {
    const b = canvas.parentElement.getBoundingClientRect();
    if (b.width === w && b.height === h) return;
    w = b.width; h = b.height; renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // en vertical alejamos la cámara para que quepa la planta entera
    // fov vertical calculado para que siempre quepan unos 44° en horizontal (la planta entera)
    const hfov = THREE.MathUtils.degToRad(camera.aspect > 1 ? 36 : 48);
    camera.fov = Math.max(24, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hfov / 2) / camera.aspect)));
    camera.updateProjectionMatrix(); dirty = true;
  }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    resize();
    if (to) {
      const k = Math.min(1, (now - t0) / (dur * 1000)), e = easeIO(k);
      cur.pos.lerpVectors(from.pos, to.pos, e); cur.look.lerpVectors(from.look, to.look, e);
      if (k >= 1) to = null;
      dirty = true;
    }
    // respiración muy leve de la maqueta cuando está en reposo
    if (!focused && !to && !reduce) { root.rotation.y = Math.sin(now / 4000) * 0.03; dirty = true; }
    if (!dirty) return;
    camera.position.copy(cur.pos); camera.lookAt(cur.look);
    renderer.render(scene, camera); dirty = false;
  }
  const markDirty = () => (dirty = true);
  canvas.addEventListener('pointermove', markDirty); canvas.addEventListener('pointerleave', markDirty);
  const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) dirty = true; });
  io.observe(canvas);
  raf = requestAnimationFrame(tick);

  return {
    rooms: ROOMS, focus, reset, scene, root,
    renderOnce() { resize(); camera.position.copy(cur.pos); camera.lookAt(cur.look); renderer.render(scene, camera); },
    project(id) { // posición en pantalla (0..1) del centro de una estancia: para colocar etiquetas HTML
      const r = ROOMS.find((x) => x.id === id); const v = new THREE.Vector3((r.x[0] + r.x[1]) / 2, 0.2, (r.z[0] + r.z[1]) / 2);
      root.localToWorld(v); v.project(camera); return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 };
    },
    dispose() { cancelAnimationFrame(raf); io.disconnect(); renderer.dispose(); pmrem.dispose(); },
  };
}
