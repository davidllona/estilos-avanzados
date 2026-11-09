// Sorra · menú del móvil. Es el único JavaScript de la web.
(() => {
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  if (!btn || !menu) return;
  const set = (open) => {
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('.vh').textContent = open ? 'Cerrar menú' : 'Abrir menú';
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  // Si se gira el móvil o se agranda la ventana con el menú abierto, se cierra
  matchMedia('(min-width: 761px)').addEventListener('change', () => set(false));
})();
