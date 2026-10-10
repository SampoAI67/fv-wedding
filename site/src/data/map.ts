/*
  "La Terra di Federica e Valentino": a hand-drawn-style fantasy map, generated at build time.
  World units: 1600 x 1100. Seeded RNG so the map is identical on every build.
  Everything here is plain path data; Journey.astro renders it and journey.ts animates the camera.
*/

export const WORLD = { w: 1600, h: 1100 };

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r = rng(30082027);
const f = (n: number) => Math.round(n * 10) / 10;

/* ---------- symbols ---------- */

export interface Mountain {
  fill: string;
  ink: string;
  hatch: string;
}

function mountain(x: number, y: number, s: number, peakX = x): Mountain {
  const w = 34 * s;
  const h = 44 * s;
  const px = peakX;
  const py = y - h;
  const ink = `M${f(x - w)} ${f(y)} Q${f(x - w * 0.5)} ${f(y - h * 0.42)} ${f(px - 3 * s)} ${f(py + 4 * s)} L${f(px)} ${f(py)} L${f(px + 4 * s)} ${f(py + 5 * s)} Q${f(x + w * 0.55)} ${f(y - h * 0.5)} ${f(x + w)} ${f(y)}`;
  let hatch = '';
  for (let k = 1; k <= 4; k++) {
    const t = k / 5.2;
    const hx = px + (x + w - px) * t;
    const hy = py + (y - py) * t;
    hatch += `M${f(hx)} ${f(hy)} l${f(-7 * s * (1 - t * 0.4))} ${f(9 * s)} `;
  }
  // a ridge line from the peak down the shadow side
  hatch += `M${f(px)} ${f(py)} Q${f(px + 2 * s)} ${f(py + h * 0.45)} ${f(px - 4 * s)} ${f(y - 2)}`;
  return { fill: `${ink} Z`, ink, hatch };
}

function tree(x: number, y: number, s = 1) {
  const c = 9 * s;
  return `M${f(x)} ${f(y)} V${f(y - 8 * s)} M${f(x - c)} ${f(y - 10 * s)} q${f(-2 * s)} ${f(-10 * s)} ${f(6 * s)} ${f(-13 * s)} q${f(3 * s)} ${f(-9 * s)} ${f(9 * s)} ${f(-2 * s)} q${f(8 * s)} ${f(2 * s)} ${f(3 * s)} ${f(12 * s)} q${f(-6 * s)} ${f(5 * s)} ${f(-18 * s)} ${f(3 * s)} Z`;
}

function birch(x: number, y: number, s = 1) {
  const h = 30 * s;
  const marks = [0.25, 0.5, 0.72].map((t) => `M${f(x - 1.5 * s)} ${f(y - h * t)} h${f(3 * s)}`).join(' ');
  return `M${f(x - 1.5 * s)} ${f(y)} V${f(y - h)} M${f(x + 1.5 * s)} ${f(y)} V${f(y - h)} ${marks} M${f(x)} ${f(y - h * 0.6)} l${f(-7 * s)} ${f(-9 * s)} M${f(x)} ${f(y - h * 0.75)} l${f(7 * s)} ${f(-8 * s)} M${f(x - 8 * s)} ${f(y - h * 0.86)} q${f(8 * s)} ${f(-14 * s)} ${f(16 * s)} 0 q${f(-8 * s)} ${f(5 * s)} ${f(-16 * s)} 0 Z`;
}

function hill(x: number, y: number, w: number) {
  return `M${f(x - w)} ${f(y)} Q${f(x)} ${f(y - w * 0.62)} ${f(x + w)} ${f(y)}`;
}

function tuft(x: number, y: number) {
  return `M${f(x)} ${f(y)} l1.5 -6 M${f(x + 3)} ${f(y)} l0 -8 M${f(x + 6)} ${f(y)} l-1 -6`;
}

/* ---------- layers ---------- */

// keep-out rectangles for scatter (labels, cartouche, places)
const keepOut: [number, number, number, number][] = [
  [40, 40, 560, 220], // cartouche
  [1330, 30, 1580, 1080], // lake
  [150, 730, 480, 960], // Contea
  [560, 520, 740, 720], // Colle della Luna
  [740, 290, 1240, 580], // ridge
  [1080, 480, 1380, 740], // birch wood + Serle
  [620, 940, 1040, 1040], // plain label
];
const free = (x: number, y: number) => !keepOut.some(([a, b, c, d]) => x > a && x < c && y > b && y < d);

// northern range: two rows, back row first so the front row occludes it
export const northRange: Mountain[] = [];
for (let x = 150; x < 1330; x += 44 + r() * 10) {
  const y = 252 + 22 * Math.sin(x / 140) + r() * 10;
  if (x < 560 && y - 40 < 220) continue;
  northRange.push(mountain(x, y, 0.7 + r() * 0.3));
}
for (let x = 130; x < 1340; x += 56 + r() * 12) {
  const y = 300 + 24 * Math.sin(x / 120 + 1) + r() * 12;
  northRange.push(mountain(x, y, 1.0 + r() * 0.35));
}

// the beacon ridge: five tall peaks, one per moment of the day
export const BEACONS: [number, number][] = [
  [800, 452],
  [895, 412],
  [990, 382],
  [1085, 352],
  [1180, 322],
];
export const ridge: Mountain[] = [];
BEACONS.forEach(([bx, by], i) => {
  const s = 1.6;
  if (i > 0) {
    const [ax, ay] = BEACONS[i - 1];
    ridge.push(mountain((ax + bx) / 2, (ay + by) / 2 + 80, 1.0 + r() * 0.2));
  }
  ridge.push(mountain(bx, by + 44 * s, s, bx));
});

// the Contea: soft hills with round doors
export const conteaHills: string[] = [];
export const conteaDoors: string[] = [];
const hillSpots: [number, number, number][] = [
  [200, 800, 48], [280, 776, 56], [372, 794, 50], [440, 820, 40], [236, 868, 52],
  [330, 862, 60], [420, 884, 46], [190, 920, 38], [290, 930, 44],
];
hillSpots.forEach(([x, y, w], i) => {
  conteaHills.push(hill(x, y, w));
  conteaHills.push(`M${f(x - w * 0.55)} ${f(y - w * 0.18)} q${f(w * 0.2)} ${f(-w * 0.14)} ${f(w * 0.4)} ${f(-w * 0.1)}`);
  if (i % 2 === 0) {
    const dx = x + (i % 4 === 0 ? -8 : 10);
    const dy = y - 4;
    conteaDoors.push(`M${f(dx - 7)} ${f(dy)} a7 7 0 0 1 14 0 Z M${f(dx)} ${f(dy - 7)} V${f(dy)}`);
  }
});
conteaHills.push('M150 950 l12 -4 l12 4 l12 -4 l12 4 l12 -4 M470 760 l10 -3 l10 3 l10 -3 l10 3');

// woods
export const trees: string[] = [];
for (let i = 0; i < 18; i++) {
  const a = r() * Math.PI * 2;
  const d = Math.sqrt(r());
  trees.push(tree(560 + Math.cos(a) * 80 * d, 880 + Math.sin(a) * 40 * d, 0.9 + r() * 0.3));
}
for (let i = 0; i < 10; i++) {
  trees.push(tree(980 + r() * 120, 660 + r() * 60, 0.8 + r() * 0.3));
}
for (let i = 0; i < 8; i++) {
  trees.push(tree(120 + r() * 70, 560 + r() * 90, 0.8 + r() * 0.3));
}

// the birch wood around the venue
export const VENUE: [number, number] = [1262, 604];
export const birches: string[] = [];
for (let i = 0; i < 70 && birches.length < 30; i++) {
  const a = r() * Math.PI * 2;
  const d = 0.35 + Math.sqrt(r()) * 0.65;
  const x = VENUE[0] + Math.cos(a) * 118 * d;
  const y = VENUE[1] + 12 + Math.sin(a) * 64 * d;
  if (Math.hypot(x - VENUE[0], (y - VENUE[1]) * 1.6) < 46) continue;
  if (x < 1196 && y > 600) continue; // leave room for the village
  birches.push(birch(x, y, 0.85 + r() * 0.35));
}
birches.sort((a, b) => parseFloat(a.split(' ')[1]) - parseFloat(b.split(' ')[1]));

// Serle: a few houses and a bell tower
export const village =
  'M1128 640 v-14 l8 -8 l8 8 v14 Z M1132 640 v-6 h4 v6 M1150 640 v-26 h10 v26 Z M1150 614 l5 -9 l5 9 M1153 622 h4 M1168 640 v-12 l9 -8 l9 8 v12 Z M1174 640 v-6 h5 v6 M1120 640 h72';

// the venue: a long hall with a pitched roof
export const venueHall = `M${VENUE[0] - 22} ${VENUE[1] + 8} v-16 l22 -14 l22 14 v16 Z M${VENUE[0] - 5} ${VENUE[1] + 8} v-10 h10 v10 M${VENUE[0] - 16} ${VENUE[1] - 2} h5 M${VENUE[0] + 11} ${VENUE[1] - 2} h5 M${VENUE[0] - 30} ${VENUE[1] + 8} h60`;

// the Colle della Luna: a lone hill, a slender tower, a crescent moon
export const LUNA: [number, number] = [648, 612];
export const lunaHill = `M560 676 Q648 560 736 676 M586 664 q20 -12 36 -14 M690 650 q14 4 24 14`;
export const lunaTower =
  'M640 612 V566 h16 v46 M638 566 h20 v-6 h-4 v4 h-4 v-4 h-4 v4 h-4 v-4 h-4 Z M646 584 v6 M646 600 h4 v12 h-4 Z';
export const lunaMoon = 'M712 520 a22 22 0 1 0 18 34 a17 17 0 1 1 -18 -34 Z';

// the great lake (east), with shore ripples and an island
export const lake =
  'M1410 36 C1398 120 1432 180 1410 262 C1392 332 1428 402 1408 470 C1394 540 1420 602 1390 662 C1360 722 1302 762 1312 842 C1322 922 1282 982 1300 1064 L1564 1064 L1564 36 Z';
export const lakeShore =
  'M1410 36 C1398 120 1432 180 1410 262 C1392 332 1428 402 1408 470 C1394 540 1420 602 1390 662 C1360 722 1302 762 1312 842 C1322 922 1282 982 1300 1064';
export const island = 'M1444 740 c10 -14 34 -12 40 0 c6 12 -10 22 -24 20 c-12 -2 -22 -8 -16 -20 Z';
export const waves: string[] = [];
for (let i = 0; i < 26; i++) {
  const y = 80 + r() * 940;
  const x = 1460 + r() * 80 - (y > 760 ? 60 : 0);
  waves.push(`M${f(x)} ${f(y)} q4 -4 8 0 t8 0`);
}
export const serpent =
  'M1452 420 q10 -18 20 0 M1478 420 q10 -16 20 0 M1504 420 q8 -12 16 0 M1446 422 q-8 -10 -18 -4 q4 2 2 6 M1426 414 l-4 -2 M1520 420 q6 0 10 -6';

// the Mella river, running from the mountains through the Contea to the plain
export const river =
  'M430 330 C400 380 452 430 412 486 C372 542 332 566 332 642 C332 702 256 724 236 800 C222 856 246 936 206 998 C192 1028 196 1052 186 1064';

// grass tufts and field marks to texture the empty land
export const tufts: string[] = [];
for (let i = 0; i < 260 && tufts.length < 90; i++) {
  const x = 60 + r() * 1260;
  const y = 380 + r() * 680;
  if (free(x, y) && y > 360) tufts.push(tuft(x, y));
}
export const fields: string[] = [];
for (let i = 0; i < 9; i++) {
  const x = 640 + r() * 520;
  const y = 860 + r() * 70;
  fields.push(`M${f(x)} ${f(y)} l40 -6 M${f(x + 2)} ${f(y + 7)} l40 -6 M${f(x + 4)} ${f(y + 14)} l40 -6`);
}

// compass rose
const C: [number, number] = [1458, 968];
export const compass = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const L = i % 2 ? 30 : 54;
    const a1 = a - 0.18;
    const a2 = a + 0.18;
    pts.push(
      `M${f(C[0] + Math.cos(a1) * 9)} ${f(C[1] + Math.sin(a1) * 9)} L${f(C[0] + Math.cos(a) * L)} ${f(C[1] + Math.sin(a) * L)} L${f(C[0] + Math.cos(a2) * 9)} ${f(C[1] + Math.sin(a2) * 9)}`,
    );
  }
  return { center: C, rays: pts.join(' ') };
})();

// border ticks
export const ticks = (() => {
  let d = '';
  for (let x = 40; x <= 1560; x += 40) d += `M${x} 24 v8 M${x} 1068 v8 `;
  for (let y = 40; y <= 1060; y += 40) d += `M24 ${y} h8 M1568 ${y} h8 `;
  return d;
})();

/* ---------- the journey ---------- */

export const SEGMENTS = [
  'M310 806 C380 796 420 744 470 734 C540 720 560 684 600 654 C614 644 624 630 636 618',
  'M648 618 C700 590 726 548 776 526 C846 498 904 476 962 456 C1032 434 1100 414 1172 396',
  'M1172 396 C1230 424 1252 472 1232 512 C1216 546 1240 574 1260 596',
];

/** Camera frames in world units: what the camera fits into the free part of the screen at each stop. */
export const FRAMES = {
  overview: { cx: 800, cy: 550, w: 1600, h: 1100, full: true },
  contea: { cx: 318, cy: 822, w: 470, h: 330 },
  luna: { cx: 652, cy: 600, w: 360, h: 260 },
  fuochi: { cx: 985, cy: 418, w: 580, h: 300 },
  bosco: { cx: 1236, cy: 598, w: 380, h: 270 },
};
export type FrameKey = keyof typeof FRAMES;
