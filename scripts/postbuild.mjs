// Post-build steps for the static GitHub Pages deploy:
//   1. Generate sitemap.xml from the known routes.
//   2. Emit dist/404.html (GitHub Pages serves this for unmatched paths).
import { readFile, writeFile, copyFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist');

const SITE_URL = 'https://nicholastrigger.com';

// Static, indexable routes (mirror src/routes.tsx, minus the 404/catch-all).
const paths = [
  '/',
  '/projects',
  '/cv',
  '/projects/arm',
  '/projects/arm/application',
  '/projects/clabsi',
  '/projects/clabsi/dhf',
  '/projects/clabsi/poster',
  '/projects/dog',
  '/projects/dog/posters',
  '/projects/chip-tester',
  '/projects/ecg',
  '/projects/factory-scheduler',
  '/projects/pet-ct-sim',
  '/projects/games',
  '/projects/games/snake',
  '/projects/games/2048',
];

const today = new Date().toISOString().slice(0, 10);

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  paths
    .map(
      (p) =>
        `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`,
    )
    .join('\n') +
  `\n</urlset>\n`;

await writeFile(join(dist, 'sitemap.xml'), sitemap, 'utf8');
console.log(`postbuild: wrote sitemap.xml (${paths.length} urls)`);

// GitHub Pages serves dist/404.html for unmatched paths. vite-react-ssg
// already prerenders the /404 route to dist/404.html; only synthesize one
// from index.html if that's somehow missing.
const target = join(dist, '404.html');
try {
  await access(target);
  console.log('postbuild: kept prerendered 404.html');
} catch {
  await copyFile(join(dist, 'index.html'), target);
  console.log('postbuild: wrote 404.html from index.html (fallback)');
}

// Make sure the sitemap reference in robots.txt is present (no-op if already there).
const robotsPath = join(dist, 'robots.txt');
try {
  const robots = await readFile(robotsPath, 'utf8');
  if (!robots.includes('Sitemap:')) {
    await writeFile(robotsPath, `${robots.trimEnd()}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  }
} catch {
  // robots.txt is in public/ and copied by Vite; ignore if missing.
}
  