/*
  The gate: the moon rises, the engraving lights up line by line, the guest says the word,
  the runes catch fire, the stone rumbles, the leaves swing inward and we fly into the light.
*/
import { gsap } from 'gsap';
import { particles } from './particles';

export function initGate(onOpened: () => void) {
  const gate = document.querySelector<HTMLElement>('[data-gate]');
  if (!gate) {
    onOpened();
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = <T extends Element>(s: string) => gate.querySelector<T>(s)!;
  const $$ = (s: string) => gate.querySelectorAll<SVGElement | HTMLElement>(s);

  const btn = $<HTMLButtonElement>('[data-gate-open]');
  const copy = [$('.gate__kicker'), $('.gate__riddle'), $('.gate__hint')];
  const lines = $$('.gate__door .ln, .gate__frame .ln');
  const leavesSvg = $$('.gate__door, .gate__frame');
  const dust = particles($<HTMLCanvasElement>('.gate__dust'), {
    count: 50,
    color: [205, 218, 255],
    size: [0.5, 1.7],
    speed: 0.22,
    drift: 'wander',
    twinkle: true,
  });

  // ---------- the engraving appears ----------
  const intro = gsap.timeline({ delay: 0.4, paused: reduced });
  intro
    .to('.gate__moon', { opacity: 1, duration: 2.6, ease: 'sine.inOut' })
    .to(copy[0], { opacity: 1, duration: 1.2 }, 0.3)
    .fromTo(
      lines,
      { drawSVG: '0%' },
      { drawSVG: '100%', duration: 2.6, ease: 'power2.inOut', stagger: { each: 0.01, from: 'random' } },
      0.6,
    )
    .fromTo('.arch-runes', { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'sine.in' }, '-=1.6')
    .fromTo(copy[1], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' }, '-=0.8')
    .to(copy[2], { opacity: 1, duration: 0.9 }, '-=0.5')
    .to(btn, { opacity: 1, duration: 0.8, onComplete: () => btn.classList.add('is-ready') }, '-=0.4');

  if (reduced) {
    gsap.set(['.gate__moon', ...copy, btn, '.arch-runes'], { opacity: 1 });
  }

  // a tap during the intro fast-forwards it
  gate.addEventListener('pointerdown', (e) => {
    if (intro.isActive() && !(e.target as Element).closest('[data-gate-open]')) intro.timeScale(5);
  });

  // ---------- the doors open ----------
  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    btn.disabled = true;
    intro.progress(1);

    const finish = () => {
      gate.classList.add('is-gone');
      dust.destroy();
    };

    if (reduced) {
      onOpened();
      gsap.to(gate, { opacity: 0, duration: 0.4, onComplete: finish });
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    tl.to(btn, { opacity: 0, scale: 0.94, duration: 0.4 })
      .to(copy, { opacity: 0, duration: 0.6 }, '<')
      // the word is spoken: the inscription turns from moonlight to fire
      .to('.arch-runes', { fill: '#ffe2a0', duration: 1.1, ease: 'power2.in' }, '<')
      .to(lines, { stroke: '#ffeccb', duration: 1.1, ease: 'power2.in', stagger: { each: 0.002, from: 'center' } }, '<')
      .to(
        leavesSvg,
        {
          filter: 'drop-shadow(0 0 3px rgba(255,214,140,0.95)) drop-shadow(0 0 18px rgba(255,170,80,0.6))',
          duration: 1.1,
        },
        '<',
      )
      // the stone rumbles
      .add(() => dust.burst(110, { color: [196, 186, 168], size: [0.7, 2.1], glow: false, twinkle: false }))
      .to('.gate__shake', { keyframes: { x: [0, -3, 3, -2, 2, -1, 1, 0], y: [0, 1, -1, 1, -1, 0] }, duration: 0.8, ease: 'none' })
      .to('.door-slab, .door-shade', { opacity: 1, duration: 0.5 }, '<')
      // the leaves swing inward, light pours out
      .to('.gate__light', { opacity: 1, duration: 1.6, ease: 'sine.in' }, '-=0.1')
      .to('.gate__door--l', { rotateY: 104, duration: 2.8, ease: 'power2.inOut' }, '<')
      .to('.gate__door--r', { rotateY: -104, duration: 2.8, ease: 'power2.inOut' }, '<')
      // and we walk through
      .to('.gate__stage', { scale: 3.4, yPercent: 8, duration: 2.6, ease: 'power3.in' }, '<0.9')
      .to('.gate__moon, .gate__bg', { opacity: 0.2, duration: 2 }, '<')
      .to('.gate__flash', { opacity: 1, duration: 1.1, ease: 'power2.in' }, '-=1.2')
      .add(onOpened)
      .to(gate, { opacity: 0, duration: 1.3, ease: 'sine.out' });
  };

  btn.addEventListener('click', open);

  // typing the word works too
  let typed = '';
  window.addEventListener('keydown', (e) => {
    if (opened || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-6);
    if (typed === 'mellon') open();
  });
}
