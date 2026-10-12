import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

await mkdir('public/favicon', { recursive: true });
const logo = 'src/assets/koderyx-logo.png';
// Only resize/encode: preserve all of the official logo, without cropping or recoloring.
await sharp(logo).resize(32, 32, { fit: 'contain', background: '#050703' }).png().toFile('public/favicon/favicon-32.png');
await sharp(logo).resize(180, 180, { fit: 'contain', background: '#050703' }).png().toFile('public/favicon/apple-touch-icon.png');
await sharp(logo).resize(1200, 630, { fit: 'contain', background: '#050703' }).jpeg({ quality: 90 }).toFile('public/images/og-koderyx.jpg');
for (const name of ['electrodental', 'halcon', 'clubfit']) {
  await sharp(`public/images/projects/${name}-logo.png`).webp({ lossless: true }).toFile(`public/images/projects/${name}-logo.webp`);
}
console.log('Favicons, Open Graph y logos optimizados. Originales conservados.');
