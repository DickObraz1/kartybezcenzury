// Měření: GA4 (a volitelně Meta Pixel). Jediné místo, odkud se cokoli posílá.
// Nákup a přidání do košíku měří e-shop (Upgates). Odsud se AddToCart ani purchase neposílá.
import { AKCE, PRODUKTY, cenaSKodem, uspora } from '../content/texty';

const GA = import.meta.env.PUBLIC_GA4_ID as string | undefined;
const PX = import.meta.env.PUBLIC_META_PIXEL_ID as string | undefined;
const KLIC = 'kbc_souhlas';
const STARY_KLIC = 'cookieConsent'; // klíč, který používá zbytek webu (podstránky)
const LADENI = new URLSearchParams(location.search).has('debug');

export type Souhlas = { mereni: boolean; reklama: boolean };
type Data = Record<string, unknown>;

declare global {
  interface Window { dataLayer: unknown[]; fbq?: any; _fbq?: any }
}

window.dataLayer = window.dataLayer || [];
function gtag(..._a: unknown[]) { window.dataLayer.push(arguments); }

let pixelBezi = false;
const frontaMeta: [string, string, Data?][] = [];
const bezi = () => document.documentElement.dataset.stav === 'bezi';

export function nactiSouhlas(): Souhlas | null {
  try {
    const s = localStorage.getItem(KLIC);
    if (s) return JSON.parse(s);
    // Kdo už odpověděl na staré verzi webu, toho se neptáme znovu.
    const stary = localStorage.getItem(STARY_KLIC);
    if (stary === 'accepted') return { mereni: true, reklama: false };
    if (stary === 'rejected') return { mereni: false, reklama: false };
  } catch { /* soukromý režim */ }
  return null;
}

function nacti(src: string) {
  const s = document.createElement('script');
  s.async = true; s.src = src; document.head.appendChild(s);
}

function spustPixel() {
  if (pixelBezi || !PX) return;
  pixelBezi = true;
  const n: any = (window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); });
  if (!window._fbq) window._fbq = n;
  n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  nacti('https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', PX);
  window.fbq('track', 'PageView');
  for (const [typ, nazev, data] of frontaMeta.splice(0)) window.fbq(typ, nazev, data);
}

function meta(typ: 'track' | 'trackCustom', nazev: string, data?: Data) {
  if (!PX) return;
  if (LADENI) console.log('[Meta]', typ, nazev, JSON.stringify(data ?? {}), pixelBezi ? '' : '(čeká na souhlas)');
  if (pixelBezi) window.fbq(typ, nazev, data);
  else if (frontaMeta.length < 30) frontaMeta.push([typ, nazev, data]);
}

function ga(nazev: string, data?: Data) {
  if (LADENI) console.log('[GA4]', nazev, JSON.stringify(data ?? {}));
  if (GA) gtag('event', nazev, data);
}

export function ulozSouhlas(s: Souhlas) {
  try {
    localStorage.setItem(KLIC, JSON.stringify(s));
    localStorage.setItem(STARY_KLIC, s.mereni ? 'accepted' : 'rejected');
  } catch { /* soukromý režim */ }
  pouzijSouhlas(s);
}

function pouzijSouhlas(s: Souhlas) {
  gtag('consent', 'update', {
    analytics_storage: s.mereni ? 'granted' : 'denied',
    ad_storage: s.reklama ? 'granted' : 'denied',
    ad_user_data: s.reklama ? 'granted' : 'denied',
    ad_personalization: s.reklama ? 'granted' : 'denied',
  });
  if (s.reklama) spustPixel();
}

export function initMereni() {
  // Dokud člověk neřekne ano, všechno je zakázané.
  gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    wait_for_update: 500,
  });
  const s = nactiSouhlas();
  if (s) pouzijSouhlas(s);
  if (GA) {
    gtag('js', new Date());
    gtag('config', GA, LADENI ? { debug_mode: true } : {});
    // Knihovna GA se stahuje až po vykreslení stránky, ať nebrzdí.
    const start = () => nacti('https://www.googletagmanager.com/gtag/js?id=' + GA);
    if (document.readyState === 'complete') setTimeout(start, 1200);
    else addEventListener('load', () => setTimeout(start, 1200), { once: true });
  }
  if (LADENI) console.log('[měření] GA4', GA, 'Pixel', PX, 'souhlas', s);
}

const cenaTed = (id: string) => (bezi() ? cenaSKodem(PRODUKTY[id]) : PRODUKTY[id].cena);
function polozka(id: string) {
  const p = PRODUKTY[id];
  return {
    item_id: String(p.upgatesId || p.id), item_name: p.nazev, price: cenaTed(id), item_brand: 'DickObraz', quantity: 1,
    ...(bezi() ? { discount: uspora(p), coupon: AKCE.kod } : {}),
  };
}

type Udalost =
  | { n: 'view_item'; produkt: string }
  | { n: 'cta_click'; produkt: string; misto: string }
  | { n: 'code_copy'; misto: string }
  | { n: 'game_round'; kolo: number }
  | { n: 'reveal'; karta: number }
  | { n: 'players'; pocet: number }
  | { n: 'video' }
  | { n: 'signup' }
  | { n: 'scroll'; hloubka: number };

/** Jediná funkce pro všechny události. */
export function track(u: Udalost) {
  switch (u.n) {
    case 'view_item': {
      const p = PRODUKTY[u.produkt];
      ga('view_item', { currency: 'CZK', value: cenaTed(u.produkt), items: [polozka(u.produkt)] });
      meta('track', 'ViewContent', {
        content_ids: [String(p.upgatesId || p.id)], content_type: 'product', content_name: p.nazev,
        value: cenaTed(u.produkt), currency: 'CZK',
      });
      break;
    }
    case 'cta_click': {
      const p = PRODUKTY[u.produkt];
      ga('select_item', { item_list_id: 'kbc_landing', items: [polozka(u.produkt)] });
      ga('kbc_cta_click', { produkt: u.produkt, umisteni: u.misto });
      meta('trackCustom', 'KBC_KlikKoupit', { content_ids: [String(p.upgatesId || p.id)], content_name: p.nazev, umisteni: u.misto, value: cenaTed(u.produkt), currency: 'CZK' });
      break;
    }
    case 'code_copy':
      ga('kbc_code_copy', { umisteni: u.misto });
      meta('trackCustom', 'KBC_KodZkopirovan', { umisteni: u.misto });
      break;
    case 'game_round':
      ga('kbc_kolo', { kolo: u.kolo });
      if (u.kolo === 3) meta('trackCustom', 'KBC_Odehrano', { kol: 3 });
      break;
    case 'reveal':
      ga('kbc_odcenzurovano', { karta: u.karta });
      break;
    case 'players':
      ga('kbc_hraci', { pocet: u.pocet });
      break;
    case 'video':
      ga('kbc_video');
      break;
    case 'signup':
      ga('newsletter_signup');
      break;
    case 'scroll':
      ga('kbc_scroll', { hloubka: u.hloubka });
      break;
  }
}
