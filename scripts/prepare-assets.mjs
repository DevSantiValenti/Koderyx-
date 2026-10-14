import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('public/favicon', { recursive: true });
const logo = 'src/assets/koderyx-logo.png';
// The official mark occupies the upper portion of the 500px logo. This crop
// excludes the KODERYX wordmark while preserving the circular K exactly.
const mark = sharp(logo)
  .extract({ left: 82, top: 4, width: 336, height: 336 })
  .flatten({ background: '#050703' });
const iconSizes = [16, 32, 48, 96, 180];
const icons = new Map();
for (const size of iconSizes) {
  icons.set(size, await mark.clone().resize(size, size).png({ compressionLevel: 9 }).toBuffer());
}
await writeFile('public/favicon-48x48.png', icons.get(48));
await writeFile('public/favicon-96x96.png', icons.get(96));
await writeFile('public/apple-touch-icon.png', icons.get(180));
// Keep the previous URLs serving the updated mark for existing bookmarks/caches.
await writeFile('public/favicon/favicon-32.png', icons.get(32));
await writeFile('public/favicon/apple-touch-icon.png', icons.get(180));

const icoSizes = [16, 32, 48, 96];
const icoBytes = 6 + icoSizes.length * 16 + icoSizes.reduce((total, size) => total + icons.get(size).length, 0);
const ico = Buffer.alloc(icoBytes);
ico.writeUInt16LE(1, 2); // ICO image type
ico.writeUInt16LE(icoSizes.length, 4);
let imageOffset = 6 + icoSizes.length * 16;
icoSizes.forEach((size, index) => {
  const entry = 6 + index * 16;
  const png = icons.get(size);
  ico.writeUInt8(size, entry);
  ico.writeUInt8(size, entry + 1);
  ico.writeUInt16LE(1, entry + 4); // color planes
  ico.writeUInt16LE(32, entry + 6); // bits per pixel
  ico.writeUInt32LE(png.length, entry + 8);
  ico.writeUInt32LE(imageOffset, entry + 12);
  png.copy(ico, imageOffset);
  imageOffset += png.length;
});
await writeFile('public/favicon.ico', ico);

await sharp(logo).resize(1200, 630, { fit: 'contain', background: '#050703' }).jpeg({ quality: 90 }).toFile('public/images/og-koderyx.jpg');
for (const name of ['electrodental', 'halcon', 'clubfit']) {
  await sharp(`public/images/projects/${name}-logo.png`).webp({ lossless: true }).toFile(`public/images/projects/${name}-logo.webp`);
}
console.log('Favicons del isotipo K, Open Graph y logos optimizados. Originales conservados.');
