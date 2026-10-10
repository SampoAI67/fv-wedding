import { gsap } from 'gsap';
import { particles } from './particles';

export function initHero() {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero) return;

  particles(hero.querySelector<HTMLCanvasElement>('.hero__motes')!, {
    count: 38,
    color: [255, 238, 196],
    size: [0.6, 1.7],
    speed: 0.28,
    drift: 'up',
    twinkle: true,
    glow: true,
  });

  // scrolling: we rise above the land and into the clouds, where the map takes over
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
  });
  tl.to('.hero__media', { scale: 1.38, yPercent: 7, duration: 1 }, 0)
    .to('.hero__copy', { yPercent: -18, opacity: 0, filter: 'blur(6px)', duration: 0.5 }, 0.05)
    .to('.hero__cue', { opacity: 0, duration: 0.12 }, 0)
    .to('.hero__mist', { opacity: 1, scale: 1.4, duration: 0.6 }, 0.2)
    .to('.hero__cloud', { opacity: 1, yPercent: 0, duration: 0.62 }, 0.38);
}

/** Runs the moment the gate's light fades: the dawn and the names arrive. */
export function heroIntro() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  gsap.fromTo('.hero__media img', { scale: 1.22 }, { scale: 1, duration: 5, ease: 'power2.out' });
  gsap.from('[data-hero-name]', {
    yPercent: 50,
    opacity: 0,
    filter: 'blur(12px)',
    duration: 1.8,
    ease: 'power3.out',
    stagger: 0.2,
    delay: 0.5,
  });
  gsap.from('[data-hero-in]', { opacity: 0, y: 14, duration: 1.3, ease: 'power2.out', stagger: 0.12, delay: 1.1 });
}
