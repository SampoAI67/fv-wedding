import { createRequire } from 'node:module'; const sharp = createRequire(import.meta.url)('../site/node_modules/sharp');
const files = process.argv.slice(3); const out = process.argv[2]; const W = +(process.env.TW||420), H = +(process.env.TH||280);
const tiles = await Promise.all(files.map(f => sharp(f).resize(W, H, { fit: 'cover' }).toBuffer()));
const cols = 4, rows = Math.ceil(files.length / cols);
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: '#000' } })
  .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * W, top: Math.floor(i / cols) * H }))).jpeg({ quality: 70 }).toFile(out);
