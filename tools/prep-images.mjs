import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module'; const sharp = createRequire(import.meta.url)('../site/node_modules/sharp');
const src = new URL('../assets-src/', import.meta.url);
const out = new URL('../site/public/img/', import.meta.url);
const p = (u, f) => fileURLToPath(new URL(f, u));
await sharp(p(src,'hero-landscape.png')).webp({ quality: 84 }).toFile(p(out,'hero.webp'));
await sharp(p(src,'hero-landscape.png')).resize(900).webp({ quality: 78 }).toFile(p(out,'hero-900.webp'));
// couple portrait: crop the circle from the printed save-the-date
const [cx, cy, r] = [512, 445, 212];
await sharp(p(src,'save-the-date.webp')).extract({ left: cx - r, top: cy - r, width: r * 2, height: r * 2 })
  .resize(640).webp({ quality: 88 }).toFile(p(out,'coppia.webp'));
console.log('ok');
