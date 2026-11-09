/* =========================================================
   La torre en 3D en tiempo real (módulo reutilizable).
   Escena procedimental: cielo con shader, agua con reflejo,
   ciudad lejana, torre de 30 plantas con ventanas en shader y bloom.
   Uso:
     import { createTower } from '../assets/js/torre3d.js';
     const torre = createTower(canvas, { lite });   // lite: móvil o equipos modestos
     torre.setProgress(0..1);      // posición de la cámara en el recorrido
     torre.highlight(min, max, 0..1);  // ilumina un rango de plantas
   Necesita un importmap con "three" y "three/addons/" (ver index.html).
   ========================================================= */
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createTower(canvas, { lite = false, path = null } = {}) {
  const FH = 3.2, NF = 30, W = 11, D = 7, R = 4.6;           // planta: semiejes y radio de esquina
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lite ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.78;
  const scene = new THREE.Scene();
  const HORIZON = new THREE.Color().setRGB(0.62, 0.36, 0.48);
  scene.fog = new THREE.FogExp2(HORIZON, 0.00055);
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.5, 6000);

  const GLSL_HASH = `
  float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }`;

  /* ---------- Cielo ---------- */
  const sunDir = new THREE.Vector3(-0.75, 0.035, -0.66).normalize();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sunDir: { value: sunDir } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform vec3 sunDir; varying vec3 vDir; ${GLSL_HASH}
    void main(){
      float y = vDir.y;
      vec3 c0 = vec3(1.00,0.55,0.38), c1 = vec3(0.86,0.36,0.50), c2 = vec3(0.42,0.20,0.46), c3 = vec3(0.15,0.10,0.32), c4 = vec3(0.035,0.03,0.11);
      vec3 col = mix(c0, c1, smoothstep(0.0, 0.06, y));
      col = mix(col, c2, smoothstep(0.04, 0.16, y));
      col = mix(col, c3, smoothstep(0.13, 0.34, y));
      col = mix(col, c4, smoothstep(0.3, 0.85, y));
      float s = max(dot(vDir, sunDir), 0.);
      col += vec3(1.0,0.55,0.35) * pow(s, 24.) * 0.45 + vec3(1.0,0.5,0.45) * pow(s, 3.) * 0.12;
      // nubes alargadas iluminadas desde abajo
      vec2 q = vDir.xz / max(y + 0.08, 0.05);
      float n = fbm(q * vec2(0.9, 2.6) + 3.0);
      float band = smoothstep(0.03, 0.12, y) * (1. - smoothstep(0.22, 0.45, y));
      float cl = smoothstep(0.55, 0.85, n) * band;
      col = mix(col, vec3(1.0,0.55,0.55) * (0.55 + 0.6*pow(s,2.)), cl * 0.4);
      gl_FragColor = vec4(col, 1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`
  }));
  scene.add(sky);

  /* ---------- Agua con reflejo ---------- */
  const waterShader = {
    name: 'Water', uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, uTime: { value: 0 } },
    vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
      void main(){ vUv = textureMatrix*vec4(position,1.); vW = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; varying vec4 vUv; varying vec3 vW; ${GLSL_HASH}
      void main(){
        vec2 p = vW.xz; float dist0 = length(vW.xz - cameraPosition.xz);
        float n = noise(p*vec2(0.08, 0.6)) + 0.5*noise(p*vec2(0.2,1.7)+uTime) - 0.75;
        float k = 1. / (1. + dist0 / 260.);
        vec4 uv = vUv; uv.x += n * 1.6 * k; uv.y += n * 0.6 * k;
        vec3 refl = texture2DProj(tDiffuse, uv).rgb;
        float dist = length(vW.xz - cameraPosition.xz);
        vec3 deep = vec3(0.04, 0.03, 0.09);
        float f = clamp(0.45 + dist/1200., 0., 0.85);
        vec3 col = mix(deep, refl, f);
        // destellos finos en el agua
        float sp = smoothstep(0.93, 1.0, noise(p*vec2(0.5,4.0)));
        col += vec3(1.0,0.7,0.6) * sp * 0.08;
        gl_FragColor = vec4(col, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  };
  const water = lite
    ? new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.05, 0.035, 0.1) }))
    : new Reflector(new THREE.PlaneGeometry(6000, 6000), { textureWidth: 512, textureHeight: 512, clipBias: 0.003, shader: waterShader, multisample: 0 });
  water.rotation.x = -Math.PI / 2; water.position.y = -1.2;
  scene.add(water);

  /* Tierra: paseo y orilla bajo la torre */
  const land = new THREE.Mesh(new THREE.BoxGeometry(260, 2, 120), new THREE.MeshStandardMaterial({ color: 0x4a3d55, roughness: 0.85 }));
  land.position.set(0, -1, -42); scene.add(land);
  const prom = new THREE.Mesh(new THREE.BoxGeometry(260, 0.3, 14), new THREE.MeshStandardMaterial({ color: 0x8d7f86, roughness: 0.8 }));
  prom.position.set(0, 0.05, 11); scene.add(prom);

  /* ---------- Ciudad lejana ---------- */
  {
    const N = 420, g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0);
    const m = new THREE.ShaderMaterial({
      fog: true, uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog]),
      vertexShader: `varying vec3 vW; varying vec3 vN; #include <fog_pars_vertex>
        void main(){ vec4 w = modelMatrix*instanceMatrix*vec4(position,1.); vW = w.xyz; vN = normalize(mat3(modelMatrix*instanceMatrix)*normal);
        vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition; #include <fog_vertex> }`.replace(/#include <fog_pars_vertex>/, '\n#include <fog_pars_vertex>\n').replace(/#include <fog_vertex>/, '\n#include <fog_vertex>\n'),
      fragmentShader: `${GLSL_HASH} varying vec3 vW; varying vec3 vN;
        #include <fog_pars_fragment>
        void main(){
          vec3 col = vec3(0.05,0.035,0.09) + vec3(0.10,0.04,0.05) * max(dot(vN, normalize(vec3(-0.7,0.2,-0.6))),0.);
          vec2 cell = floor(vec2(vW.x + vW.z, vW.y) / vec2(2.2, 3.0));
          float lit = step(0.88, hash(cell));
          vec2 f = fract(vec2(vW.x + vW.z, vW.y) / vec2(2.2, 3.0));
          lit *= step(0.25, f.x) * step(f.x, 0.75) * step(0.3, f.y) * step(f.y, 0.75) * step(0.5, 1.-abs(vN.y));
          col += vec3(1.0,0.62,0.32) * lit * 1.1;
          gl_FragColor = vec4(col, 1.);
          #include <fog_fragment>
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    });
    const inst = new THREE.InstancedMesh(g, m, N);
    const o = new THREE.Object3D(); let rnd = 7;
    const r = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < N; i++) {
      const a = r();
      // franja de ciudad al fondo y a la izquierda, al otro lado del agua
      const x = -1800 + r() * 2600, z = -900 - r() * 700 - (x < -300 ? 0 : 300);
      const h = 8 + Math.pow(r(), 2.2) * (x > -900 && x < -200 ? 160 : 70);
      o.position.set(x, -20, z); o.scale.set(14 + r() * 30, h * 0.7, 14 + r() * 30); o.rotation.y = a * 0.3; o.updateMatrix();
      inst.setMatrixAt(i, o.matrix);
    }
    scene.add(inst);
  }

  // orilla oscura bajo la ciudad lejana: así los edificios no parecen flotar
  const shore = new THREE.Mesh(new THREE.BoxGeometry(6000, 2, 1400), new THREE.MeshBasicMaterial({ color: 0x140e20 }));
  shore.position.set(0, -0.6, -1500); scene.add(shore);

  /* ---------- La torre ---------- */
  function rrect(w, d, r) {
    const s = new THREE.Shape();
    s.moveTo(-w + r, -d); s.lineTo(w - r, -d); s.quadraticCurveTo(w, -d, w, -d + r);
    s.lineTo(w, d - r); s.quadraticCurveTo(w, d, w - r, d); s.lineTo(-w + r, d);
    s.quadraticCurveTo(-w, d, -w, d - r); s.lineTo(-w, -d + r); s.quadraticCurveTo(-w, -d, -w + r, -d);
    return s;
  }
  const tower = new THREE.Group(); scene.add(tower);
  const slabMat = new THREE.MeshStandardMaterial({ color: 0xe6d6c4, roughness: 0.65 });
  slabMat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      // cara inferior del balcón: la luz cálida de las ventanas la ilumina
      if (vNormal.y < -0.5 ) totalEmissiveRadiance += vec3(1.0,0.55,0.3) * 0.16;`);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n');
  };
  const slabMatWorld = slabMat;
  const glassMat = new THREE.ShaderMaterial({
    uniforms: { fh: { value: FH }, gap: { value: 0.5 }, hiMin: { value: -1 }, hiMax: { value: -1 }, hiAmt: { value: 0 } },
    vertexShader: `varying vec3 vL; varying vec3 vW; varying vec3 vN;
      void main(){ vL = position; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `${GLSL_HASH} uniform float fh; uniform float gap; uniform float hiMin; uniform float hiMax; uniform float hiAmt; varying vec3 vL; varying vec3 vW; varying vec3 vN;
      void main(){
        float fl = floor(vW.y / fh);
        float fv = clamp((vW.y - fl*fh) / (fh - gap), 0., 1.);
        float ang = atan(vL.z, vL.x);
        float u = (ang / 6.28318 + 0.5) * 64.;
        float cell = floor(u), fu = fract(u);
        float h = hash(vec2(cell * 0.37, fl * 1.13));
        float h2 = hash(vec2(cell + 11., fl + 7.));
        float lit = step(0.58, h);
        if (fl < 1.) lit = 1.;
        // plantas del nivel activo: todas encendidas y más cálidas
        float inLevel = step(hiMin, fl) * step(fl, hiMax);
        lit = max(lit, inLevel * hiAmt * step(0.18, h));                                   // vestíbulo siempre encendido
        vec3 V = normalize(cameraPosition - vW);
        float fres = pow(1. - max(dot(V, vN), 0.), 3.);
        // vidrio apagado: refleja el cielo
        vec3 glass = mix(vec3(0.02,0.018,0.05), vec3(0.42,0.22,0.40), clamp(fres*1.2 + vW.y/400., 0., 1.));
        // interior encendido: más luz abajo (lámparas), variación de calidez y cortinas
        vec3 warm = mix(vec3(1.0,0.42,0.14), vec3(1.0,0.66,0.34), h2) * (0.7 + 1.1*h2);
        warm *= 0.45 + 0.75 * pow(1. - fv, 1.5);
        float curtain = step(0.7, h2) * smoothstep(0.15, 0.0, abs(fu-0.5)-0.35);
        vec3 col = mix(glass, warm * (1. - curtain*0.5), lit * (1. - fres*0.6));
        // montantes
        float mull = 1. - step(0.06, fu) * step(fu, 0.94);
        col = mix(col, vec3(0.05,0.045,0.08), mull * 0.85);
        col += inLevel * hiAmt * vec3(0.18, 0.08, 0.02) * (1. - mull);
        gl_FragColor = vec4(col, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const railMat = new THREE.MeshBasicMaterial({ color: 0xc9b8d6, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false });
  const balShape = rrect(W + 1.6, D + 1.6, R + 1.6);
  const coreShape = rrect(W, D, R);
  const slabGeo = new THREE.ExtrudeGeometry(balShape, { depth: 0.42, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 18 });
  slabGeo.rotateX(-Math.PI / 2);
  const coreGeo = new THREE.ExtrudeGeometry(coreShape, { depth: FH - 0.48, bevelEnabled: false, curveSegments: 24 });
  coreGeo.rotateX(-Math.PI / 2);
  // barandilla de vidrio: solo la pared lateral de un extruido sin tapas
  const railGeo = new THREE.ExtrudeGeometry(rrect(W + 1.5, D + 1.5, R + 1.5), { depth: 1.05, bevelEnabled: false, curveSegments: 18 });
  railGeo.rotateX(-Math.PI / 2);
  const floorObjs = [];
  for (let f = 0; f < NF; f++) {
    const y = f * FH;
    const g = new THREE.Group(); g.position.y = y;
    const slab = new THREE.Mesh(slabGeo, slabMatWorld); slab.position.y = 0;
    const core = new THREE.Mesh(coreGeo, glassMat); core.position.y = 0.48;
    g.add(slab, core);
    if (f > 0) { const rail = new THREE.Mesh(railGeo, railMat); rail.position.y = 0.48; g.add(rail); }
    tower.add(g); floorObjs.push(g);
  }
  // coronación: losa final, pérgola y piscina de borde infinito iluminada
  const roofY = NF * FH;
  const roof = new THREE.Mesh(slabGeo, slabMat); roof.position.y = roofY; tower.add(roof);
  const crown = new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(W - 2.5, D - 2, R - 1.5), { depth: 3.2, bevelEnabled: false, curveSegments: 18 }).rotateX(-Math.PI / 2), glassMat);
  crown.position.set(-2.5, roofY + 0.48, -0.5); tower.add(crown);
  const crownTop = new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(W - 1.8, D - 1.4, R - 1.2), { depth: 0.5, bevelEnabled: false, curveSegments: 18 }).rotateX(-Math.PI / 2), slabMat);
  crownTop.position.set(-2.5, roofY + 3.7, -0.5); tower.add(crownTop);
  const pool = new THREE.Mesh(new THREE.BoxGeometry(9, 0.7, 4.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 2.2, 2.4) }));
  pool.position.set(5.2, roofY + 0.75, 5.0); tower.add(pool);
  const poolEdge = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.25, 0.25), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 2.6, 2.8) }));
  poolEdge.position.set(5.2, roofY + 0.5, 7.25); tower.add(poolEdge);
  // farolas del paseo
  for (let i = -12; i <= 12; i++) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.4, 1.2) }));
    l.position.set(i * 9, 4, 16.5); scene.add(l);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), new THREE.MeshStandardMaterial({ color: 0x1a1522 }));
    p.position.set(i * 9, 2, 16.5); scene.add(p);
  }

  /* ---------- Luz ---------- */
  scene.add(new THREE.HemisphereLight(0x8a6fc0, 0x1c1424, 0.7));
  const sun = new THREE.DirectionalLight(0xff8a6a, 1.3); sun.position.copy(sunDir).multiplyScalar(400); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffc4a6, 1.5); fill.position.set(120, 60, 300); scene.add(fill);
  const fill2 = new THREE.DirectionalLight(0x7f7fe0, 0.6); fill2.position.set(-200, 80, 200); scene.add(fill2);


  /* ---------- Postproceso ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), lite ? 0.22 : 0.3, 0.4, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- Recorrido de cámara: del agua a la azotea ----------
     0 → 0.15  llegada desde el agua
     0.15 → 1  sube rodeando la torre hasta la azotea */
  const look = new THREE.Vector3();
  const easeIO = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const defaultPath = (t) => {
    if (t < 0.15) {
      const k = easeIO(t / 0.15);
      camera.position.set(THREE.MathUtils.lerp(-70, -48, k), THREE.MathUtils.lerp(5, 14, k), THREE.MathUtils.lerp(230, 92, k));
      look.set(THREE.MathUtils.lerp(-18, 0, k), THREE.MathUtils.lerp(40, 16, k), 0);
    } else {
      const k = (t - 0.15) / 0.85;
      const ang = THREE.MathUtils.lerp(-0.42, 0.38, k), dist = THREE.MathUtils.lerp(92, 66, k);
      const y = THREE.MathUtils.lerp(14, roofY + 16, k);
      camera.position.set(Math.sin(ang) * dist, y, Math.cos(ang) * dist);
      look.set(0, y - THREE.MathUtils.lerp(4, 22, k), 0);
    }
    camera.lookAt(look);
  };
  const follow = path || defaultPath;

  let progress = 0, shown = 0, hi = { min: -1, max: -1, amt: 0, target: 0 }, w = 0, h = 0, raf = 0, running = true, dirty = true;
  function resize() {
    const r = canvas.getBoundingClientRect();
    if (r.width === w && r.height === h) return;
    w = r.width; h = r.height;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 55 : 35;     // en vertical, más campo de visión
    camera.updateProjectionMatrix(); dirty = true;
  }
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    resize();
    const d = progress - shown;
    if (Math.abs(d) > 0.0002) { shown += d * 0.08; dirty = true; }
    const da = hi.target - hi.amt;
    if (Math.abs(da) > 0.002) { hi.amt += da * 0.1; glassMat.uniforms.hiAmt.value = hi.amt; dirty = true; }
    if (!dirty) return;
    follow(shown, camera, look);
    composer.render();
    dirty = false;
  }
  raf = requestAnimationFrame(frame);
  return {
    THREE, scene, camera, renderer, floors: NF, floorHeight: FH,
    setProgress(t, instant = false) { progress = Math.min(1, Math.max(0, t)); if (instant) shown = progress; dirty = true; },
    highlight(min, max, amt = 1) { glassMat.uniforms.hiMin.value = min; glassMat.uniforms.hiMax.value = max; hi.target = amt; dirty = true; },
    pause() { running = false; }, resume() { running = true; dirty = true; },
    invalidate() { dirty = true; },
    dispose() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
