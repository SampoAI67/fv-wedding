import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';
import { initGate } from './gate';
import { initHero, heroIntro } from './hero';
import { initJourney } from './journey';
import { initRsvp } from './rsvp';
import { particles } from './particles';
import { initCountdown } from './countdown';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- smooth scroll ----------
const lenis = reduced ? null : new Lenis({ autoRaf: false, lerp: 0.1 });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    const el = id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { duration: 1.8 });
    else el.scrollIntoView();
  }),
);

// ---------- toast ----------
const toastEl = document.querySelector<HTMLElement>('[data-toast]')!;
let toastTimer = 0;
const toast = (msg: string) => {
  toastEl.textContent = msg;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 6500);
};

// ---------- sections ----------
initHero();
initCountdown();
initJourney();
initRsvp(toast, (el) => {
  ScrollTrigger.refresh();
  if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1 });
  else el.scrollIntoView();
});

const flies = document.querySelector<HTMLCanvasElement>('.finale__flies');
if (flies) {
  particles(flies, { count: 44, color: [242, 214, 124], size: [0.9, 2.1], speed: 0.35, drift: 'wander', twinkle: true, glow: true });
}

if (!reduced) {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) =>
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    }),
  );
}

// ---------- the gate opens the experience ----------
initGate(() => {
  document.body.classList.remove('is-locked');
  document.querySelector('[data-header]')?.classList.add('is-visible');
  lenis?.start();
  heroIntro();
  ScrollTrigger.refresh();
});
