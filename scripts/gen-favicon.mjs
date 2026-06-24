// One-off generator: rasterize public/favicon.svg into favicon.ico (16/32/48)
// and apple-touch-icon.png (180). Re-run with `node scripts/gen-favicon.mjs`
// whenever favicon.svg changes.
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svg = await readFile(join(publicDir, 'favicon.svg'));

// High density so the rasterized glyph stays crisp when scaled down.
const render = (size) =>
  sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain' }).png().toBuffer();

const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(icoSizes.map(render));
const ico = await pngToIco(icoBuffers);
await writeFile(join(publicDir, 'favicon.ico'), ico);
console.log(`gen-favicon: wrote favicon.ico (${icoSizes.join('/')})`);

const apple = await render(180);
await writeFile(join(publicDir, 'apple-touch-icon.png'), apple);
console.log('gen-favicon: wrote apple-touch-icon.png (180)');
