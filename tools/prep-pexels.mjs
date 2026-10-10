import { createRequire } from 'node:module'; const sharp = createRequire(import.meta.url)('../site/node_modules/sharp');
const S = 'assets-src/pexels/', O = 'site/public/img/';
await sharp(S + 'p-3707669.jpg').resize(1600).modulate({ saturation: 0.5 }).webp({ quality: 68 }).toFile(O + 'stone.webp');
await sharp(S + 'p-7952505.jpg').resize(1920).webp({ quality: 74 }).toFile(O + 'paper.webp');
await sharp(S + 'p-8148893.jpg').resize(1920).webp({ quality: 72 }).toFile(O + 'sky.webp');
console.log('ok');
