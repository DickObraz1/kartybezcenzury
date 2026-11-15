// Všechno, co není nutné k nákupu: 3D krabičky v hero a efekty při scrollu.
// Načítá se až po vykreslení stránky. Když cokoli selže, zůstane obyčejná (statická) verze.
type Api = { nastavPosun: (f: (cil: Element) => void) => void };

export async function spust(api: Api) {
  const ua = navigator.userAgent;
  const ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // iPhony hlásí počet jader schválně nízko, proto se u nich na jádra nehledí a rozhoduje změřená plynulost.
  let slabe = !ios && (navigator.hardwareConcurrency || 8) <= 4;
  let gl = false;
  try { const c = document.createElement('canvas'); gl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { gl = false; }
  const vynutit = new URLSearchParams(location.search).get('3d'); // ?3d=0 vypne, ?3d=1 vynutí (testování)
  if (vynutit === '0') gl = false;
  if (vynutit === '1') slabe = false;

  import('./efekty').then((m) => m.init(api)).catch(() => {});

  const stage = document.querySelector<HTMLElement>('[data-stage]');
  if (stage && gl && !slabe) {
    const start = () => import('./hero3d').then((m) => m.init(stage)).catch(() => stage.classList.remove('gl'));
    // Na telefonu se 3D spustí až s prvním dotykem nebo scrollem, aby nebrzdilo první načtení.
    if (matchMedia('(pointer: coarse)').matches) {
      const jednou = () => { removeEventListener('touchstart', jednou); removeEventListener('scroll', jednou); start(); };
      addEventListener('touchstart', jednou, { passive: true });
      addEventListener('scroll', jednou, { passive: true });
    } else start();
  }
}
