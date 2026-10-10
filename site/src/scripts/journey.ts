/*
  The map journey. The section pins; scroll drives one timeline that moves a camera across the
  map (by animating the SVG viewBox, so the ink stays vector-sharp at any zoom), walks the
  traveller along the route, lights the beacons and shows one parchment card per stop.
  Camera frames are defined in world units (data/map.ts) and fitted to whatever part of the
  screen the card leaves free, so the same timeline works on phones and desktops.
*/
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FRAMES, SEGMENTS, type FrameKey } from '../data/map';
import { toRunes } from '../data/content';

type Cam = { cx: number; cy: number; s: number; fx: number; fy: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initJourney() {
  const section = document.querySelector<HTMLElement>('.journey');
  if (!section) return;
  const stage = section.querySelector<HTMLElement>('.journey__stage')!;
  const svg = section.querySelector<SVGSVGElement>('.journey__map')!;
  const card = (k: string) => section.querySelector<HTMLElement>(`[data-card="${k}"]`)!;

  const segs = SEGMENTS.map((_, i) => svg.querySelector<SVGPathElement>(`#seg${i}`)!);
  const lens = segs.map((p) => p.getTotalLength() + 2);
  const masks = [...svg.querySelectorAll<SVGPathElement>('.seg-mask')];
  masks.forEach((m, i) => {
    m.style.strokeDasharray = `${lens[i]}`;
    m.style.strokeDashoffset = `${lens[i]}`;
  });
  const traveller = svg.querySelector<SVGGElement>('.traveller')!;
  const start = segs[0].getPointAtLength(0);
  traveller.setAttribute('transform', `translate(${start.x} ${start.y})`);

  // ---------- camera ----------
  let vw = 0;
  let vh = 0;
  let pad = 24;
  const measure = () => {
    vw = stage.clientWidth;
    vh = stage.clientHeight;
    pad = Math.min(40, Math.max(16, vw * 0.03));
  };
  measure();

  const camFor = (key: FrameKey): Cam => {
    const fr = FRAMES[key];
    const wide = vw >= 900;
    if ('full' in fr) {
      const s = Math.min(vw / fr.w, vh / fr.h) * (wide ? 0.92 : 0.98);
      return { cx: fr.cx, cy: fr.cy, s, fx: vw / 2, fy: wide ? vh * 0.44 : vh * 0.36 };
    }
    let x0: number, y0: number, fw: number, fh: number;
    if (wide) {
      x0 = Math.min(430, vw * 0.36) + pad * 2;
      y0 = 70;
      fw = vw - x0 - pad;
      fh = vh - 100;
    } else {
      const ch = Math.min(card(key).offsetHeight, vh * 0.52);
      x0 = 0;
      y0 = 64;
      fw = vw;
      fh = Math.max(170, vh - ch - 24 - y0);
    }
    const s = Math.min(fw / fr.w, fh / fr.h);
    return { cx: fr.cx, cy: fr.cy, s, fx: x0 + fw / 2, fy: y0 + fh / 2 };
  };

  const cam: Cam = camFor('overview');
  const render = () => {
    const w = vw / cam.s;
    const h = vh / cam.s;
    svg.setAttribute(
      'viewBox',
      `${(cam.cx - cam.fx / cam.s).toFixed(2)} ${(cam.cy - cam.fy / cam.s).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`,
    );
  };
  render();

  const easeIO = gsap.parseEase('power2.inOut');
  /** A camera move between two frames; with `seg`, the traveller walks that route segment. */
  const move = (from: FrameKey, to: FrameKey, seg?: number) => {
    const proxy = { p: 0 };
    return gsap.to(proxy, {
      p: 1,
      duration: 1.7,
      ease: 'none',
      onUpdate: () => {
        const t = proxy.p;
        const e = easeIO(t);
        const A = camFor(from);
        const B = camFor(to);
        let cx = lerp(A.cx, B.cx, e);
        let cy = lerp(A.cy, B.cy, e);
        let s = lerp(A.s, B.s, e);
        if (seg !== undefined) {
          const pt = segs[seg].getPointAtLength((lens[seg] - 2) * e);
          traveller.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
          masks[seg].style.strokeDashoffset = `${lens[seg] * (1 - e)}`;
          const follow = Math.sin(Math.PI * t) * 0.6;
          cx = cx * (1 - follow) + pt.x * follow;
          cy = cy * (1 - follow) + pt.y * follow;
          s *= 1 - 0.2 * Math.sin(Math.PI * t);
        }
        cam.cx = cx;
        cam.cy = cy;
        cam.s = s;
        cam.fx = lerp(A.fx, B.fx, e);
        cam.fy = lerp(A.fy, B.fy, e);
        render();
      },
    });
  };

  // ---------- timeline ----------
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  const cardIn = (k: string) =>
    tl.fromTo(card(k), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  const cardOut = (k: string) => tl.to(card(k), { autoAlpha: 0, y: -18, duration: 0.4, ease: 'power2.in' });
  const hold = (label: string, d = 1) => {
    tl.addLabel(label, `+=${d / 2}`);
    tl.to({}, { duration: d });
  };

  // out of the clouds, onto the map. "start"/"end" labels let directional snapping release the
  // pin at both ends instead of pulling the guest back to the first/last stop.
  tl.addLabel('start', 0);
  tl.to('.journey__mist', { opacity: 0, duration: 0.9, ease: 'power1.inOut' });
  cardIn('intro');
  hold('intro', 0.9);
  cardOut('intro');
  tl.to(traveller, { opacity: 1, duration: 0.3 }, '<');

  // I · the Contea
  tl.add(move('overview', 'contea'));
  cardIn('contea');
  hold('contea', 1.3);
  cardOut('contea');

  // II · the Colle della Luna (moon-letters decode as the card arrives)
  tl.add(move('contea', 'luna', 0));
  cardIn('luna');
  const moonEl = card('luna').querySelector<HTMLElement>('[data-moon]')!;
  const latin = [...(moonEl.dataset.moon ?? '')];
  const runes = latin.map((ch) => (ch === ' ' ? ' ' : toRunes(ch)));
  const decode = { t: 0 };
  tl.to(
    decode,
    {
      t: 1,
      duration: 0.8,
      onUpdate: () => {
        const k = Math.round(decode.t * latin.length);
        moonEl.innerHTML =
          `<span class="ml-latin">${latin.slice(0, k).join('')}</span>` + `<span>${runes.slice(k).join('')}</span>`;
      },
    },
    '<0.2',
  );
  hold('luna', 1);
  cardOut('luna');

  // III · the beacon ridge: one fire per moment of the day
  tl.add(move('luna', 'fuochi', 1));
  cardIn('fuochi');
  const fires = [...svg.querySelectorAll<SVGGElement>('.beacon__fire')];
  const items = [...card('fuochi').querySelectorAll<HTMLElement>('[data-prog]')];
  fires.forEach((fire, i) => {
    tl.fromTo(
      fire,
      { opacity: 0, scale: 0.2 },
      { opacity: 1, scale: 1, transformOrigin: '50% 100%', duration: 0.3, ease: 'back.out(2)' },
      i ? '>' : '>-0.1',
    );
    tl.to(items[i], { opacity: 1, '--lit': 1, duration: 0.3 }, '<');
  });
  hold('fuochi', 0.9);
  cardOut('fuochi');

  // IV · the birch wood and the venue
  tl.add(move('fuochi', 'bosco', 2));
  tl.fromTo(
    '.venue-star',
    { opacity: 0, scale: 0 },
    { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2.5)' },
    '-=0.15',
  );
  cardIn('bosco');
  hold('bosco', 1.1);
  cardOut('bosco');

  // the whole journey, traced
  tl.add(move('bosco', 'overview'));
  cardIn('fine');
  hold('fine', 0.9);
  tl.addLabel('end');

  const st = ScrollTrigger.create({
    animation: tl,
    trigger: section,
    start: 'top top',
    end: () => `+=${Math.round(window.innerHeight * 10)}`,
    pin: true,
    scrub: 0.9,
    invalidateOnRefresh: true,
    snap: {
      snapTo: 'labelsDirectional',
      duration: { min: 0.3, max: 0.9 },
      delay: 0.12,
      ease: 'power1.inOut',
    },
  });

  // on resize: re-measure, then replay the timeline to the same point so the camera re-fits
  ScrollTrigger.addEventListener('refresh', () => {
    measure();
    const p = tl.progress();
    tl.progress(0).progress(p);
    render();
  });

  return st;
}
