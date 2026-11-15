// Efekty při scrollu: plynulý scroll (jen počítač), objevování nadpisů, vějíř karet, páska.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Api = { nastavPosun: (f: (cil: Element) => void) => void };

export async function init(api: Api) {
  gsap.registerPlugin(ScrollTrigger);
  const mys = matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (mys) {
    // Plynulý scroll a chromatický posun jen s myší. Na telefonu zůstává nativní scroll, je nejrychlejší.
    const { default: Lenis } = await import('lenis');
    const lenis = new Lenis({ lerp: 0.11 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    api.nastavPosun((cil) => lenis.scrollTo(cil as HTMLElement, { offset: -10, duration: 1.1 }));
    let posledni = 0;
    const koren = document.documentElement;
    lenis.on('scroll', (l: { velocity: number }) => {
      const r = Math.round(Math.max(-7, Math.min(7, l.velocity / 9)) * 2) / 2;
      if (r !== posledni) { posledni = r; koren.style.setProperty('--rych', String(r)); }
    });
  }

  // Nadpisy a dlaždice vyjedou, až na ně dojde řada (jen ty, co ještě nejsou vidět).
  for (const el of document.querySelectorAll<HTMLElement>('[data-objev]')) {
    if (el.getBoundingClientRect().top < innerHeight * 0.9) continue;
    gsap.from(el, {
      opacity: 0, y: 34, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  }

  // Balíček karet se při scrollu rozevře do vějíře.
  const vejir = document.querySelector<HTMLElement>('[data-vejir]');
  if (vejir) {
    gsap.fromTo(vejir, { '--o': 0 }, {
      '--o': 1, ease: 'none',
      scrollTrigger: { trigger: vejir, start: 'top 92%', end: 'top 38%', scrub: true },
    });
  }

  // Přetržená páska v hero se při odjezdu rozjede od sebe.
  const hero = document.getElementById('hero');
  if (hero) {
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.stage .p1', { xPercent: -30, scrollTrigger: st });
    gsap.to('.stage .p2', { xPercent: 30, scrollTrigger: st });
  }
}
