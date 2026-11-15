// 3D v hero: krabička Karet bez cenzury, rozšíření Mezi nohama a jedna karta levitují, reagují na myš a na náklon telefonu.
// Pod plátnem pořád leží statická (CSS) verze stejné scény. Když 3D nejede plynule, vrátí se k ní.
import {
  WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, Mesh, MeshLambertMaterial, AmbientLight,
  DirectionalLight, CanvasTexture, SRGBColorSpace, Group, type Texture,
} from 'three';

type Slot = { x: number; y: number; z: number; h: number; ry: number; rz: number; jas: number };
const STRED: Slot = { x: -0.04, y: 0, z: 0.12, h: 0.8, ry: -0.5, rz: -0.06, jas: 1 };
const VLEVO: Slot = { x: -0.68, y: -0.04, z: -0.1, h: 0.5, ry: 0.5, rz: 0.2, jas: 1 };
const VPRAVO: Slot = { x: 0.64, y: -0.05, z: -0.05, h: 0.58, ry: -0.3, rz: -0.12, jas: 1 };

async function texturaKrabicky(): Promise<Texture> {
  try { await document.fonts.load('60px Anton'); } catch { /* nevadí */ }
  const c = document.createElement('canvas');
  c.width = 384; c.height = 432;
  const x = c.getContext('2d')!;
  x.fillStyle = '#FFD000'; x.fillRect(0, 0, c.width, c.height);
  const pruh = (y: number) => {
    x.save(); x.beginPath(); x.rect(28, y, c.width - 56, 30); x.clip();
    x.fillStyle = '#111';
    for (let i = -40; i < c.width; i += 34) { x.beginPath(); x.moveTo(i, y + 30); x.lineTo(i + 17, y + 30); x.lineTo(i + 47, y); x.lineTo(i + 30, y); x.fill(); }
    x.restore();
  };
  pruh(34); pruh(c.height - 64);
  x.fillStyle = '#111'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '78px Anton, Impact, sans-serif';
  ['KARTY', 'BEZ', 'CENZURY'].forEach((s, i) => x.fillText(s, c.width / 2, 138 + i * 80));
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace;
  return t;
}

async function texturaRozsireni(): Promise<Texture> {
  const c = document.createElement('canvas');
  c.width = 320; c.height = 472;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, '#161616'); g.addColorStop(0.4, '#1d1d1d'); g.addColorStop(1, '#e77fb4');
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  const pruh = (y: number) => {
    x.save(); x.beginPath(); x.rect(0, y, c.width, 26); x.clip();
    x.fillStyle = '#FFD000'; x.fillRect(0, y, c.width, 26);
    x.fillStyle = '#111';
    for (let i = -40; i < c.width; i += 34) { x.beginPath(); x.moveTo(i, y + 26); x.lineTo(i + 17, y + 26); x.lineTo(i + 43, y); x.lineTo(i + 26, y); x.fill(); }
    x.restore();
  };
  pruh(22); pruh(c.height - 48);
  x.fillStyle = '#FFD000'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '62px Anton, Impact, sans-serif';
  x.fillText('KARTY', c.width / 2, 130); x.font = '46px Anton, Impact, sans-serif'; x.fillText('BEZ CENZURY', c.width / 2, 190);
  x.fillStyle = '#ff9ccb'; x.font = '30px Anton, Impact, sans-serif'; x.fillText('MEZI NOHAMA', c.width / 2, 244);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace;
  return t;
}

async function texturaKarty(text: string): Promise<Texture> {
  try { await document.fonts.load('700 30px Poppins'); } catch { /* nevadí */ }
  const c = document.createElement('canvas');
  c.width = 288; c.height = 400;
  const x = c.getContext('2d')!;
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#111'; x.textBaseline = 'top'; x.font = '700 31px Poppins, Arial, sans-serif';
  let radek = '', y = 30;
  for (const slovo of text.split(' ')) {
    const zkus = radek ? radek + ' ' + slovo : slovo;
    if (x.measureText(zkus).width > c.width - 52 && radek) { x.fillText(radek, 26, y); y += 40; radek = slovo; } else radek = zkus;
  }
  x.fillText(radek, 26, y);
  x.font = '17px Anton, Impact, sans-serif'; x.fillText('KARTY BEZ CENZURY', 26, c.height - 44);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace;
  return t;
}

export async function init(stage: HTMLElement) {
  const canvas = stage.querySelector('canvas')!;
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new Scene();
  const VYSKA = 1.28; // plátno je o 28 % vyšší než scéna, aby se objekty při pohybu neořízly
  const cam = new PerspectiveCamera(30, 1, 0.1, 20);
  cam.position.z = VYSKA / 2 / Math.tan((15 * Math.PI) / 180);
  scene.add(new AmbientLight(0xffffff, 1.5));
  const svetlo = new DirectionalLight(0xffffff, 1.9);
  svetlo.position.set(-1.2, 1.6, 2.5);
  scene.add(svetlo);
  const fialove = new DirectionalLight(0x9b72cf, 1.4);
  fialove.position.set(2, -1, -1);
  scene.add(fialove);

  const textKarty = stage.querySelector('.hkarta')?.textContent?.trim() || 'Karty bez cenzury';
  const [tKbc, tMn, tKarta] = await Promise.all([texturaKrabicky(), texturaRozsireni(), texturaKarty(textKarty)]);
  for (const t of [tKbc, tMn, tKarta]) t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  const zluta = new MeshLambertMaterial({ color: 0xffd000 });
  const krabice = new Mesh(new BoxGeometry(0.88, 1, 0.5),
    [zluta, zluta, new MeshLambertMaterial({ color: 0xffe14d }), zluta, new MeshLambertMaterial({ map: tKbc }), zluta]);

  const tmava = new MeshLambertMaterial({ color: 0x2a2a2a }), ruzova = new MeshLambertMaterial({ color: 0xc86a9a });
  const rozsireni = new Mesh(new BoxGeometry(0.68, 1, 0.3), [ruzova, tmava, tmava, ruzova, new MeshLambertMaterial({ map: tMn }), tmava]);
  const bila = new MeshLambertMaterial({ color: 0xf4f4f4 }), cernaRub = new MeshLambertMaterial({ color: 0x111111 });
  const karta = new Mesh(new BoxGeometry(0.72, 1, 0.012), [bila, bila, bila, bila, new MeshLambertMaterial({ map: tKarta }), cernaRub]);

  const objekty: { m: Mesh; s: Slot; faze: number; g: Group }[] = [];
  const pridej = (m: Mesh, s: Slot, faze: number) => {
    const g = new Group();
    g.add(m); g.position.set(s.x, s.y, s.z); g.scale.setScalar(s.h);
    scene.add(g);
    objekty.push({ m, s, faze, g });
  };
  pridej(krabice, STRED, 0); pridej(karta, VLEVO, 2); pridej(rozsireni, VPRAVO, 4);

  // velikost podle skutečného místa na stránce
  const zmer = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    // na úzkém a vysokém plátně objekty zmenšíme, aby se vešly na šířku
    const sirka = VYSKA * cam.aspect;
    scene.scale.setScalar(Math.min(1, sirka / 1.75));
    cam.updateProjectionMatrix();
  };
  zmer();
  new ResizeObserver(zmer).observe(canvas);

  // myš a náklon telefonu
  let cx = 0, cy = 0, nx = 0, ny = 0;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    cx = (e.clientX / innerWidth) * 2 - 1; cy = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  let beta0: number | null = null;
  const naklon = (e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;
    if (beta0 == null) beta0 = e.beta;
    cx = Math.max(-1, Math.min(1, e.gamma / 28));
    cy = Math.max(-1, Math.min(1, (e.beta - beta0) / 28));
  };
  const DOE = (window as any).DeviceOrientationEvent;
  if (DOE && matchMedia('(pointer: coarse)').matches) {
    if (typeof DOE.requestPermission === 'function') {
      // iPhone: o povolení se smí žádat jen po ťuknutí.
      const tl = stage.querySelector<HTMLElement>('[data-naklon]');
      if (tl) {
        tl.hidden = false;
        tl.addEventListener('click', () => {
          DOE.requestPermission().then((r: string) => { if (r === 'granted') addEventListener('deviceorientation', naklon, { passive: true }); }).catch(() => {});
          tl.hidden = true;
        }, { once: true });
        setTimeout(() => { tl.hidden = true; }, 9000);
      }
    } else addEventListener('deviceorientation', naklon, { passive: true });
  }

  // vykresluje se jen když je hero vidět
  let vidim = true, bezi = false, zruseno = false;
  new IntersectionObserver((z) => { vidim = z[0].isIntersecting; spust(); }).observe(stage);
  document.addEventListener('visibilitychange', spust);

  const t0 = performance.now();
  let snimky = 0, mereno = false, hotovo = false;
  function snimek(ted: number) {
    bezi = false;
    if (zruseno) return;
    const t = (ted - t0) / 1000;
    nx += (cx - nx) * 0.06; ny += (cy - ny) * 0.06;
    for (const o of objekty) {
      const s = o.s;
      o.g.position.y = s.y + Math.sin(t * 0.9 + o.faze) * 0.035;
      o.m.rotation.y = s.ry + Math.sin(t * 0.55 + o.faze) * 0.3 + nx * 0.5;
      o.m.rotation.x = Math.sin(t * 0.7 + o.faze * 1.3) * 0.06 + ny * 0.3;
      o.m.rotation.z = s.rz + Math.sin(t * 0.4 + o.faze) * 0.03;
    }
    renderer.render(scene, cam);
    if (!hotovo) { hotovo = true; stage.classList.add('gl'); }
    // první 2 sekundy se měří plynulost; když to trhá, 3D se vypne a zůstane statická verze
    if (!mereno) {
      snimky++;
      if (t > 2.2) {
        mereno = true;
        if (snimky / t < 26) { zruseno = true; stage.classList.remove('gl'); renderer.dispose(); return; }
      }
    }
    spust();
  }
  function spust() {
    if (bezi || zruseno || !vidim || document.hidden) return;
    bezi = true;
    requestAnimationFrame(snimek);
  }
  spust();
}
