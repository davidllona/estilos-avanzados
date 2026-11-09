/* =========================================================
   Lucero · datos de las plantas (los comparten el 3D, el respaldo y el formulario)
   ========================================================= */
export const NF = 30;          // plantas: de la 0 (vestíbulo) a la 29
export const FH = 3.2;         // altura de planta en la escena de torre3d.js

// Ruido determinista: las mismas plantas libres en cada visita
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

const TIPOS = [
  { desde: 2,  nombre: 'Residencia Puerto', m2: 132, terraza: 24, dorm: '2 dormitorios' },
  { desde: 10, nombre: 'La Residencia',     m2: 148, terraza: 31, dorm: '2 dormitorios y estudio' },
  { desde: 22, nombre: 'Residencia Alta',   m2: 162, terraza: 34, dorm: '3 dormitorios' },
  { desde: 26, nombre: 'Ático',             m2: 214, terraza: 58, dorm: '3 dormitorios y estudio' },
];

export const FLOORS = Array.from({ length: NF }, (_, f) => {
  if (f === 0) return { f, residential: false, nombre: 'Vestíbulo', texto: 'Recepción veinticuatro horas, conserjería y llegada en coche a cubierto.' };
  if (f === 1) return { f, residential: false, nombre: 'Club', texto: 'Gimnasio con vistas al puerto, spa y sala de cine para cuarenta personas.' };
  const tipo = [...TIPOS].reverse().find((t) => f >= t.desde);
  const total = f >= 26 ? 2 : 3;
  const avail = f === 18 ? 2 : Math.floor(hash(f) * (total + 1));
  return {
    f, residential: true, total, avail, ...tipo,
    price: 1.2 + f * 0.036 + (f >= 26 ? 0.9 : 0),
    view: f < 10 ? 'Puerto y paseo' : f < 22 ? 'Mar y ciudad' : 'Bahía completa',
  };
});

/* Estancias de la residencia: los mismos id que ROOMS de residencia.min.js.
   Se duplican aquí para que la lista funcione también sin WebGL. */
export const ROOMS = [
  { id: 'salon',     name: 'Salón',                m2: 42, text: 'Doble orientación y chimenea de bioetanol. El sofá mira a la puesta de sol, no a la televisión.' },
  { id: 'cocina',    name: 'Cocina y comedor',     m2: 28, text: 'Isla de piedra de cuatro metros y mesa para ocho junto al ventanal.' },
  { id: 'principal', name: 'Dormitorio principal', m2: 24, text: 'Suite con vestidor y la cama en el eje de las vistas al puerto.' },
  { id: 'bano',      name: 'Baño en suite',        m2: 9,  text: 'Bañera exenta de piedra y ducha a ras de suelo, con luz natural.' },
  { id: 'estudio',   name: 'Estudio',              m2: 14, text: 'Un despacho silencioso que también puede ser un tercer dormitorio.' },
  { id: 'terraza',   name: 'Terraza',              m2: 31, text: 'Rodea el salón, con jacuzzi y sombra al mediodía.' },
];

export const money =(m) => m.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' M€';
export const pad = (n) => String(n).padStart(2, '0');
