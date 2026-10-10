/*
  One tiny particle engine for every atmosphere on the page:
  moon dust at the gate, falling grit when the doors move, dawn pollen, finale fireflies.
  Pauses itself off-screen; never runs under prefers-reduced-motion.
*/

export interface ParticleOpts {
  count: number;
  color: [number, number, number];
  size: [number, number];
  speed: number; // px per frame at 60fps
  drift: 'up' | 'down' | 'wander';
  twinkle?: boolean;
  glow?: boolean;
}

interface P {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  ph: number;
}

export interface ParticleField {
  burst(n: number, opts?: Partial<ParticleOpts>): void;
  setAlpha(a: number): void;
  destroy(): void;
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function particles(canvas: HTMLCanvasElement, opts: ParticleOpts): ParticleField {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  let w = 0;
  let h = 0;
  let raf = 0;
  let visible = true;
  let alpha = 1;
  let list: P[] = [];
  const extra: (P & { life: number; o: ParticleOpts })[] = [];

  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const spawn = (o: ParticleOpts, anywhere = true): P => ({
    x: rand(0, w),
    y: anywhere ? rand(0, h) : o.drift === 'up' ? h + 10 : -10,
    r: rand(o.size[0], o.size[1]),
    vx: rand(-0.3, 0.3) * o.speed,
    vy: (o.drift === 'up' ? -1 : o.drift === 'down' ? 1 : rand(-0.4, 0.4)) * rand(0.4, 1) * o.speed,
    a: rand(0.3, 1),
    ph: rand(0, Math.PI * 2),
  });

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!list.length) list = Array.from({ length: opts.count }, () => spawn(opts));
  };

  const draw = (p: P, o: ParticleOpts, t: number, fade = 1) => {
    const tw = o.twinkle ? 0.5 + 0.5 * Math.sin(t * 0.002 + p.ph) : 1;
    const a = p.a * tw * fade * alpha;
    if (a < 0.02) return;
    const [r, g, b] = o.color;
    if (o.glow) {
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grd.addColorStop(0, `rgba(${r},${g},${b},${a})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const step = (t: number) => {
    raf = requestAnimationFrame(step);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of list) {
      if (opts.drift === 'wander') {
        p.vx += rand(-0.03, 0.03);
        p.vy += rand(-0.03, 0.03);
        p.vx = Math.max(-opts.speed, Math.min(opts.speed, p.vx));
        p.vy = Math.max(-opts.speed, Math.min(opts.speed, p.vy));
      }
      p.x += p.vx + Math.sin(t * 0.0006 + p.ph) * 0.15;
      p.y += p.vy;
      if (p.y < -20 || p.y > h + 20 || p.x < -20 || p.x > w + 20) Object.assign(p, spawn(opts, opts.drift === 'wander'));
      draw(p, opts, t);
    }
    for (let i = extra.length - 1; i >= 0; i--) {
      const p = extra[i];
      p.vy += 0.05;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      if (p.life <= 0 || p.y > h + 20) extra.splice(i, 1);
      else draw(p, p.o, t, Math.min(1, p.life / 40));
    }
  };

  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);
  window.addEventListener('resize', resize);
  resize();
  if (!reduced()) raf = requestAnimationFrame(step);

  return {
    burst(n, o = {}) {
      if (reduced()) return;
      const oo = { ...opts, ...o };
      for (let i = 0; i < n; i++) {
        extra.push({
          x: rand(w * 0.25, w * 0.75),
          y: rand(h * 0.05, h * 0.3),
          r: rand(oo.size[0], oo.size[1]),
          vx: rand(-0.6, 0.6),
          vy: rand(0, 1.5),
          a: rand(0.4, 0.9),
          ph: 0,
          life: rand(60, 140),
          o: oo,
        });
      }
    },
    setAlpha(a) {
      alpha = a;
    },
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
