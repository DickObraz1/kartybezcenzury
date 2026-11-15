// Hlavní skript stránky. Je malý a spouští se hned: Black Friday stav, odpočet, kód, tlačítka,
// mini hra, lišta, cookies, měření. Těžké věci (3D, efekty při scrollu) se dotahují až potom.
import { AKCE, PRODUKTY, TEXTY, HRA, cenaSKodem, kc, odkazProdukt } from '../content/texty';
import { initMereni, nactiSouhlas, ulozSouhlas, track } from '../lib/tracking';

const html = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const dotaz = new URLSearchParams(location.search);
const klid = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- čas a stav akce ----------
const START = Date.parse(AKCE.start), KONEC = Date.parse(AKCE.konec);
// ?cas=2026-12-01T10:00 nasimuluje jiný čas (jen pro testování).
const casParam = dotaz.get('cas');
const posun = casParam && !isNaN(Date.parse(casParam)) ? Date.parse(casParam) - Date.now() : 0;
const ted = () => Date.now() + posun;
type Stav = 'bezi' | 'bez';
const spoctiStav = (): Stav => (AKCE.zapnuto && ted() >= START && ted() <= KONEC ? 'bezi' : 'bez');
let stav: Stav = spoctiStav();
const cenaTed = (id: string) => (stav === 'bezi' ? cenaSKodem(PRODUKTY[id]) : PRODUKTY[id].cena);

function pouzijStav() {
  html.dataset.stav = stav;
  for (const e of $$('[data-kod]')) e.textContent = stav === 'bezi' ? AKCE.kod : '';
  obnovListu();
}

const dve = (n: number) => String(n).padStart(2, '0');
function tik() {
  const s = spoctiStav();
  if (s !== stav) { stav = s; pouzijStav(); }
  if (stav !== 'bezi') return;
  const zbyva = Math.max(0, KONEC - ted());
  const d = Math.floor(zbyva / 864e5), h = Math.floor(zbyva / 36e5) % 24, m = Math.floor(zbyva / 6e4) % 60, sek = Math.floor(zbyva / 1e3) % 60;
  const cisla = [d, h, m, sek];
  for (const o of $$('[data-odpocet]')) {
    for (let i = 0; i < 4; i++) {
      const b = $(`[data-c${i + 1}]`, o)!, t = dve(cisla[i]);
      if (b.textContent !== t) b.textContent = t;
    }
  }
  const kratky = (d ? d + ' d ' : '') + dve(h) + ':' + dve(m) + ':' + dve(sek);
  for (const o of $$('[data-odpocet-kratky]')) o.textContent = kratky;
}

// ---------- odkazy do e-shopu ----------
// UTM a fbclid z adresy téhle stránky se předají do e-shopu beze změny. Žádné vlastní UTM se nepřidává.
const NEPREDAVAT = new Set(['cas', 'debug', '3d', 'addtocart', 'quantity', 'return']);
function doEshopu(adresa: string) {
  const u = new URL(adresa);
  dotaz.forEach((hodnota, klic) => {
    if (!NEPREDAVAT.has(klic) && !u.searchParams.has(klic)) u.searchParams.append(klic, hodnota);
  });
  return u.href;
}
function ozdobOdkazy() {
  for (const a of $$<HTMLAnchorElement>('a[data-eshop]')) {
    a.dataset.zaklad ??= a.href;
    a.href = doEshopu(a.dataset.zaklad);
  }
}

// ---------- slevový kód ----------
let hlaskaCas = 0;
function hlaska(text: string) {
  const h = $('[data-hlaska]');
  if (!h) return;
  h.textContent = text;
  h.classList.add('uka');
  clearTimeout(hlaskaCas);
  hlaskaCas = window.setTimeout(() => h.classList.remove('uka'), 2600);
}
/** Zkopíruje kód hned. Funguje i ve vestavěných prohlížečích Instagramu a Facebooku. */
function zkopirujKod(): boolean {
  let ok = false;
  try {
    const t = document.createElement('textarea');
    t.value = AKCE.kod; t.readOnly = true;
    t.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(t);
    t.select(); t.setSelectionRange(0, 99);
    ok = document.execCommand('copy');
    t.remove();
  } catch { /* zkusíme novější způsob */ }
  if (!ok && navigator.clipboard) { navigator.clipboard.writeText(AKCE.kod).catch(() => {}); ok = true; }
  return ok;
}

// ---------- spodní lišta ----------
// Kupuje základní hru. Když je na obrazovce rozšíření, kupuje rozšíření.
let aktualni = 'kbc';
function obnovListu() {
  const a = $<HTMLAnchorElement>('[data-lista-tlacitko]');
  if (!a) return;
  const p = PRODUKTY[aktualni];
  a.href = doEshopu(odkazProdukt(p));
  a.dataset.zaklad = odkazProdukt(p);
  a.dataset.produkt = p.id;
  const cena = kc(cenaTed(aktualni)) + ' Kč';
  $('[data-lista-produkt]', a)!.textContent = stav === 'bezi' ? p.kratce + ' · ' + cena : '';
  const nazev = $('[data-lista-nazev]'), c = $('[data-lista-cena]');
  if (nazev) nazev.textContent = p.nazev;
  if (c) c.textContent = cena;
}

// ---------- plynulý posun na kotvu ----------
let posunNa: (cil: Element) => void = (cil) => cil.scrollIntoView({ behavior: 'smooth', block: 'start' });
export const nastavPosun = (f: (cil: Element) => void) => { posunNa = f; };

// ---------- mini hra: zahraj si kolo ----------
const zamichej = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const MEZERA = /_{3,}/;
function initHra() {
  const stul = $('[data-hra]');
  if (!stul) return;
  const otazkaEl = $('[data-hra-otazka]', stul)!, ruka = $('[data-hra-ruka]', stul)!, reakce = $('[data-hra-reakce]', stul)!;
  const dalsi = $<HTMLButtonElement>('[data-hra-dalsi]', stul)!, michat = $<HTMLButtonElement>('[data-hra-zamichat]', stul)!;
  const pop = $('[data-hra-pop]', stul)!, pocitadlo = $('[data-hra-kolo]');
  const karty = $$<HTMLButtonElement>('[data-hra-karta]', ruka);
  let otazky = zamichej(HRA.otazky), odpovedi = zamichej(HRA.odpovedi), reakceBalik = zamichej(HRA.reakce);
  let otazka = '', odehrano = 0, zahrano = false;
  const lizni = <T,>(balik: T[], zdroj: T[]) => { if (!balik.length) balik.push(...zamichej(zdroj)); return balik.pop()!; };
  pop.classList.add('ceka');

  function rozdej(novaOtazka: boolean) {
    zahrano = false;
    if (novaOtazka) { otazka = lizni(otazky, HRA.otazky); otazkaEl.textContent = otazka; }
    for (const k of karty) { k.classList.remove('vybrana'); $('span', k)!.textContent = lizni(odpovedi, HRA.odpovedi); }
    ruka.classList.remove('hotovo', 'rozdat'); void ruka.offsetWidth; ruka.classList.add('rozdat');
    reakce.textContent = '';
    dalsi.hidden = true; michat.hidden = false;
  }
  function zahraj(k: HTMLButtonElement) {
    if (zahrano) return;
    zahrano = true;
    const odpoved = $('span', k)!.textContent!;
    k.classList.add('vybrana'); ruka.classList.add('hotovo');
    const znacka = document.createElement('mark');
    if (MEZERA.test(otazka)) {
      const [pred, po] = otazka.split(MEZERA);
      // odpověď uprostřed věty: bez tečky na konci
      znacka.textContent = odpoved.replace(/\.$/, '');
      otazkaEl.replaceChildren(pred, znacka, po.replace(/^\./, '.'));
    } else {
      znacka.textContent = odpoved; znacka.className = 'dole';
      otazkaEl.replaceChildren(otazka, znacka);
    }
    const karta = otazkaEl.parentElement!;
    karta.classList.remove('bum'); void karta.offsetWidth; karta.classList.add('bum');
    reakce.textContent = lizni(reakceBalik, HRA.reakce);
    odehrano++;
    if (pocitadlo) pocitadlo.textContent = String(odehrano);
    dalsi.hidden = false; michat.hidden = true;
    track({ n: 'game_round', kolo: odehrano });
    if (odehrano === 3) { pop.classList.remove('ceka'); pop.classList.add('vjezd'); }
  }
  ruka.addEventListener('click', (e) => { const k = (e.target as Element).closest<HTMLButtonElement>('[data-hra-karta]'); if (k) zahraj(k); });
  dalsi.addEventListener('click', () => rozdej(true));
  michat.addEventListener('click', () => rozdej(false));
  rozdej(true);
}

// ---------- kolik vás bude ----------
function initHraci() {
  const box = $('[data-hraci]');
  if (!box) return;
  const jezdec = $<HTMLInputElement>('[data-hraci-jezdec]', box)!, cislo = $('[data-hraci-cislo]', box)!;
  const hlaskaEl = $('[data-hraci-hlaska]', box)!, rada = $('[data-hraci-rada]', box)!, obe = $('[data-hraci-obe]', box)!;
  const hlasky: Record<string, string> = JSON.parse(box.dataset.hlasky!), od = Number(box.dataset.od);
  const panaci = $$('.panaci i', box);
  const prekresli = () => {
    const n = Number(jezdec.value);
    cislo.textContent = String(n);
    hlaskaEl.textContent = hlasky[n] ?? '';
    panaci.forEach((p, i) => p.classList.toggle('on', i < n));
    const vic = n >= od;
    rada.textContent = vic ? rada.dataset.obe! : rada.dataset.zaklad!;
    obe.hidden = !vic;
  };
  jezdec.addEventListener('input', prekresli);
  jezdec.addEventListener('change', () => track({ n: 'players', pocet: Number(jezdec.value) }));
  prekresli();
}

// ---------- e-mail ----------
function initEmail() {
  const form = $<HTMLFormElement>('#signup-form'), btn = $<HTMLButtonElement>('#signup-btn');
  const email = $<HTMLInputElement>('#signup-email'), gdpr = $<HTMLInputElement>('#signup-gdpr');
  const past = $<HTMLInputElement>('#hp-website'), chyba = $('#signup-error'), hotovo = $('#signup-success');
  if (!form || !btn || !email || !gdpr || !chyba || !hotovo) return;
  const puvodni = btn.textContent ?? '';
  const ukazChybu = (t: string) => { chyba.textContent = t; chyba.hidden = false; };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    chyba.hidden = true;
    const adresa = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adresa)) { ukazChybu('Zadej platný e-mail.'); email.focus(); return; }
    if (!gdpr.checked) { ukazChybu('Potvrď souhlas se zpracováním e-mailu.'); gdpr.focus(); return; }
    btn.disabled = true; btn.textContent = form.dataset.odesilam ?? '…';
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adresa, gdpr: true, honeypot: past?.value ?? '' }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (res.ok && data.ok) { form.hidden = true; hotovo.hidden = false; track({ n: 'signup' }); return; }
      ukazChybu(data.error ?? 'Něco se pokazilo. Zkus to znovu.');
    } catch { ukazChybu('Chyba sítě. Zkus to za chvíli.'); }
    btn.disabled = false; btn.textContent = puvodni;
  });
}

// ---------- kliky (jeden posluchač pro celou stránku) ----------
document.addEventListener('click', (e) => {
  const t = e.target as Element;

  const koupit = t.closest<HTMLAnchorElement>('a[data-koupit]');
  if (koupit) {
    // Nic se nezdržuje: kód se zkopíruje okamžitě a odkaz pokračuje do košíku.
    const id = koupit.dataset.produkt!;
    if (stav === 'bezi' && id !== 'komplet' && zkopirujKod()) hlaska(TEXTY.kod.zkopirovano);
    track({ n: 'cta_click', produkt: id, misto: koupit.dataset.misto || 'produkt' });
    return;
  }

  const kod = t.closest<HTMLElement>('[data-kopiruj]');
  if (kod) {
    if (zkopirujKod()) {
      hlaska(TEXTY.kod.zkopirovano);
      kod.classList.remove('ok'); void kod.offsetWidth; kod.classList.add('ok');
      const napis = $('[data-kopiruj-text]', kod);
      if (napis) {
        napis.dataset.puvodni ??= napis.textContent ?? '';
        napis.textContent = napis.dataset.hotovo!;
        setTimeout(() => { napis.textContent = napis.dataset.puvodni!; }, 2600);
      }
      track({ n: 'code_copy', misto: kod.dataset.misto || '' });
    }
    return;
  }

  if (t.closest('[data-cookies-otevrit]')) { e.preventDefault(); html.dataset.ck = '1'; return; }

  const kotva = t.closest<HTMLAnchorElement>('a[href^="#"]');
  if (kotva && kotva.getAttribute('href')!.length > 1) {
    const cil = document.getElementById(kotva.getAttribute('href')!.slice(1));
    if (cil) { e.preventDefault(); posunNa(cil); }
    return;
  }

  const cenz = t.closest<HTMLElement>('[data-cenz]');
  if (cenz && !cenz.classList.contains('odhaleno')) {
    cenz.classList.add('odhaleno');
    track({ n: 'reveal', karta: Number(cenz.dataset.cenz) + 1 });
    return;
  }

  const pk = t.closest<HTMLElement>('[data-pk]');
  if (pk) {
    const sekce = pk.closest<HTMLElement>('[data-prokoho]')!;
    sekce.classList.toggle('neni', pk.dataset.pk === 'neni');
    for (const b of $$('[data-pk]', sekce)) b.setAttribute('aria-selected', String(b === pk));
    for (const s of $$('.pk-seznam', sekce)) { s.classList.remove('zive'); void s.offsetWidth; s.classList.add('zive'); }
    return;
  }

  const video = t.closest<HTMLElement>('[data-video]');
  if (video) {
    // Video se stáhne až po kliknutí. Do té doby stránka YouTube vůbec nevolá.
    const f = document.createElement('iframe');
    f.src = video.dataset.video!;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true; f.title = video.textContent?.trim() ?? 'Video';
    video.replaceWith(f);
    track({ n: 'video' });
  }
});

// ---------- cookies ----------
function initCookies() {
  $('[data-cookies]')?.addEventListener('click', (e) => {
    const akce = (e.target as Element).closest<HTMLElement>('[data-c]')?.dataset.c;
    if (!akce) return;
    ulozSouhlas({ mereni: akce === 'ano', reklama: akce === 'ano' });
    delete html.dataset.ck;
  });
}

// ---------- sledování toho, co je na obrazovce ----------
function initPozorovani() {
  if (!('IntersectionObserver' in window)) return;
  const videno = new Set<string>();
  const io = new IntersectionObserver((zaznamy) => {
    for (const z of zaznamy) {
      if (!z.isIntersecting) continue;
      const el = z.target as HTMLElement;
      const id = el.dataset.produktKarta!;
      io.unobserve(el);
      if (videno.has(id) || el.offsetParent === null) continue;
      videno.add(id);
      track({ n: 'view_item', produkt: id });
    }
  }, { threshold: 0.4 });
  for (const el of $$('[data-produkt-karta]')) io.observe(el);

  const sekce = new IntersectionObserver((zaznamy) => {
    for (const z of zaznamy) {
      const id = (z.target as HTMLElement).dataset.sekce!;
      if (z.isIntersecting) aktualni = id; else if (aktualni === id) aktualni = 'kbc';
    }
    obnovListu();
  }, { rootMargin: '-45% 0px -45% 0px' });
  for (const el of $$('[data-sekce]')) sekce.observe(el);
}

function initScroll() {
  const meze = [25, 50, 75, 100];
  let ceka = false;
  const zkontroluj = () => {
    ceka = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    const proc = ((scrollY + 2) / max) * 100;
    while (meze.length && proc >= meze[0]) track({ n: 'scroll', hloubka: meze.shift()! });
    if (!meze.length) removeEventListener('scroll', naScroll);
  };
  const naScroll = () => { if (!ceka) { ceka = true; requestAnimationFrame(zkontroluj); } };
  addEventListener('scroll', naScroll, { passive: true });
}

// ---------- start ----------
initMereni();
pouzijStav();
ozdobOdkazy();
tik();
setInterval(tik, 1000);
initCookies();
initHra();
initHraci();
initEmail();
initPozorovani();
initScroll();
void nactiSouhlas;

// Těžké věci až když je stránka vykreslená a prohlížeč má volno.
const azBudeKlid = (f: () => void, pojistka = 2500) => {
  const spust = () => ('requestIdleCallback' in window ? requestIdleCallback(f, { timeout: pojistka }) : setTimeout(f, 300));
  if (document.readyState === 'complete') spust(); else addEventListener('load', spust, { once: true });
};
if (!klid) azBudeKlid(() => { import('./tezke').then((m) => m.spust({ nastavPosun })); });
