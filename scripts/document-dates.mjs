// Regenerates src/data/documentDates.ts from git history.
//
// Every PDF under public/ is picked up automatically. Its "updated" date is when
// the document itself last changed, taken from the first of these that works:
//
//   1. The modification date embedded in the PDF (/ModDate or XMP ModifyDate).
//      It travels with the file's contents, so it stays correct for PDFs that
//      were copied in from another repo, where git only knows the copy date.
//   2. A manual entry in DATE_OVERRIDES, for PDFs that embed no date (Google
//      Docs exports). Each is pinned to the exact file contents it describes.
//   3. The date of the most recent commit that changed the file.
//   4. The file's mtime (uncommitted file or shallow clone).
//
// Entries are keyed by the URL the site serves the file at (e.g.
// "/Trigger,Nicholas-CV.pdf"), so the PDF viewer can look up its own date.
//
// Run by .github/workflows/deploy.yml before the build, by
// .github/workflows/update-document.yml after a swap, and locally via
// `npm run doc-dates`.
//
// Usage:
//   node scripts/document-dates.mjs            regenerate src/data/documentDates.ts
//   node scripts/document-dates.mjs --check    exit 1 if the file is out of date
//   node scripts/document-dates.mjs --path cv  print the public/ path for one key
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, stat, appendFile, readdir } from 'node:fs/promises';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

// Short names for PDFs that update-document.yml can swap (its `document`
// choice), resolved with --path. Dates are tracked for every PDF in public/
// regardless; this map only exists so the workflow doesn't hard-code filenames.
const ALIASES = {
  resume: 'public/Trigger,Nicholas-Resume.pdf',
  cv: 'public/Trigger,Nicholas-CV.pdf',
};

// Hand-set dates for PDFs that don't embed a modification date. `blob` is the
// file's git blob hash (`git hash-object <file>`): if the PDF is ever replaced,
// the hash stops matching, the override is ignored with a warning, and the date
// falls through to git — so a stale override can't outlive the file it's for.
const DATE_OVERRIDES = {
  // Cover says "1 May 2025", but entries inside run to April 2026.
  'public/CLABSI_DHF_FINAL_NICHOLAS_TRIGGER.pdf': {
    iso: '2026-05-08',
    blob: '8e0c8f2cc86df2fb37da98b07034f922e6279f01',
  },
  // Estimated from the latest date in the document (a source retrieved April
  // 20, 2023); the application was for the Summer 2023 cohort.
  'public/PATS_arm.pdf': {
    iso: '2023-04-20',
    blob: 'e9e8eeed4705db921d56f18d5334cdd445f7fc39',
  },
};

const OUT_FILE = join(repoRoot, 'src', 'data', 'documentDates.ts');

// --path <key>: let the workflows resolve a filename without duplicating the map.
const pathFlag = process.argv.indexOf('--path');
if (pathFlag !== -1) {
  const key = process.argv[pathFlag + 1];
  if (!ALIASES[key]) {
    console.error(`document-dates: unknown document '${key}' (expected one of: ${Object.keys(ALIASES).join(', ')})`);
    process.exit(1);
  }
  console.log(ALIASES[key]);
  process.exit(0);
}

const checkOnly = process.argv.includes('--check');

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const isShallow = git('rev-parse', '--is-shallow-repository') === 'true';

// Calendar date (YYYY-MM-DD) of the last change to `file`, or null if git can't
// tell us — no history for the path, a shallow clone that truncated it, or no
// git at all. %cs is the commit's own date in the timezone it was made in, so
// an evening commit doesn't slide to the next day the way a UTC cast would.
function lastCommitDate(file) {
  return git('log', '-1', '--format=%cs', '--', file) || null;
}

// Latest modification date embedded in the PDF, as YYYY-MM-DD in the PDF's own
// timezone, or null. Reads the Info dictionary's /ModDate (D:YYYYMMDD...) and
// XMP <xmp:ModifyDate>; incremental saves can leave several, so take the
// latest. Info dictionaries inside compressed object streams aren't visible to
// this scan — those PDFs just fall through to the next source.
async function embeddedPdfDate(file) {
  const text = (await readFile(join(repoRoot, file))).toString('latin1');
  const dates = [
    ...[...text.matchAll(/\/ModDate\s*\(D:(\d{4})(\d{2})(\d{2})/g)].map((m) => `${m[1]}-${m[2]}-${m[3]}`),
    ...[...text.matchAll(/<xmp:ModifyDate>(\d{4}-\d{2}-\d{2})/g)].map((m) => m[1]),
  ].filter((iso) => {
    // Ignore obviously bogus values (unset clocks, far-future typos).
    const year = Number(iso.slice(0, 4));
    return year >= 1990 && iso <= localDate(new Date());
  });
  return dates.sort().at(-1) ?? null;
}

// Local calendar date of a Date, for the mtime fallback.
function localDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

const longDate = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

// Every .pdf under public/, as repo-relative paths with forward slashes.
async function findPdfs(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await findPdfs(full)));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      found.push(relative(repoRoot, full).split(sep).join('/'));
    }
  }
  return found;
}

const files = (await findPdfs(join(repoRoot, 'public'))).sort();

// A missing alias target means the workflow would try to swap a file that no
// longer exists — fail loudly rather than let it drift.
for (const [key, file] of Object.entries(ALIASES)) {
  if (!files.includes(file)) {
    console.error(`document-dates: alias '${key}' points at ${file}, which isn't in public/`);
    process.exit(1);
  }
}

const entries = [];
const notes = [];

for (const file of files) {
  // public/foo/bar.pdf is served at /foo/bar.pdf.
  const key = '/' + file.slice('public/'.length);
  let iso = await embeddedPdfDate(file);
  let source = 'pdf metadata';

  const override = DATE_OVERRIDES[file];
  if (!iso && override) {
    if (git('hash-object', '--', file) === override.blob) {
      iso = override.iso;
      source = 'override';
    } else {
      notes.push(`${key}: DATE_OVERRIDES entry no longer matches the file (it was replaced), ignoring it`);
    }
  } else if (iso && override) {
    notes.push(`${key}: has an embedded date now, so its DATE_OVERRIDES entry can be removed`);
  }

  if (!iso) {
    iso = lastCommitDate(file);
    source = 'git';
  }

  if (!iso) {
    // Uncommitted file, or a shallow clone whose history doesn't reach the last
    // change. Fall back to the file's mtime so the build still gets a date.
    try {
      iso = localDate((await stat(join(repoRoot, file))).mtime);
      source = isShallow ? 'mtime (shallow clone)' : 'mtime (uncommitted)';
      notes.push(`${key}: no commit found for ${file}, fell back to file mtime`);
    } catch {
      console.error(`document-dates: couldn't read ${file}`);
      process.exit(1);
    }
  }

  entries.push({
    key,
    file,
    iso,
    // Parsed as UTC midnight and formatted as UTC, so the plain calendar date
    // above round-trips to the label unchanged.
    label: longDate.format(new Date(`${iso}T00:00:00Z`)),
    source,
  });
}

const body = `// GENERATED FILE — do not edit by hand.
// Regenerate with \`npm run doc-dates\` (see scripts/document-dates.mjs).
//
// One entry per PDF in public/, keyed by the URL it's served at. Each is the
// date of the most recent commit that changed that PDF, so the viewer can say
// when the document itself last changed.
export interface DocumentDate {
  /** Commit date of the last change, as YYYY-MM-DD. */
  iso: string;
  /** Human-readable date, e.g. "August 6, 2026". */
  label: string;
}

export const documentDates: Record<string, DocumentDate> = {
${entries.map((e) => `  ${JSON.stringify(e.key)}: { iso: '${e.iso}', label: '${e.label}' },`).join('\n')}
};
`;

let previous = '';
try {
  previous = await readFile(OUT_FILE, 'utf8');
} catch {
  // First run — treat as changed.
}

const changed = previous !== body;

for (const note of notes) console.warn(`document-dates: ${note}`);

if (checkOnly) {
  if (changed) {
    console.error('document-dates: src/data/documentDates.ts is out of date (run `npm run doc-dates`)');
    process.exit(1);
  }
  console.log('document-dates: up to date');
  process.exit(0);
}

if (changed) await writeFile(OUT_FILE, body, 'utf8');

for (const e of entries) {
  console.log(`document-dates: ${e.key} -> ${e.label} (${e.iso}, from ${e.source})`);
}
console.log(
  changed
    ? 'document-dates: wrote src/data/documentDates.ts (dates changed)'
    : 'document-dates: no change',
);

// Surface the result on the Actions run page when we're in CI.
if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = entries.map((e) => `| \`${e.file}\` | ${e.label} | ${e.iso} |`).join('\n');
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    `### Document dates\n\n${changed ? '**Updated** — the viewer text changed for this build.' : 'No change since the last build.'}\n\n` +
      `| File | Shown as | Last changed |\n| --- | --- | --- |\n${rows}\n\n`,
  );
}
