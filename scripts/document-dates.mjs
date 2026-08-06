// Regenerates src/data/documentDates.ts from git history.
//
// For each PDF in DOCUMENTS, the "updated" date is the commit date of the most
// recent commit that changed that file — i.e. when the PDF actually last
// differed from its previous version, not when the repo was last built.
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
import { readFile, writeFile, stat, appendFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

// key -> path relative to the repo root. The keys are what the viewers import
// (documentDates.resume / documentDates.cv) and what update-document.yml
// offers as its `document` choice, so this map is the single source of truth.
const DOCUMENTS = {
  resume: 'public/Trigger,Nicholas-Resume.pdf',
  cv: 'public/Trigger,Nicholas-CV.pdf',
};

const OUT_FILE = join(repoRoot, 'src', 'data', 'documentDates.ts');

// --path <key>: let the workflows resolve a filename without duplicating the map.
const pathFlag = process.argv.indexOf('--path');
if (pathFlag !== -1) {
  const key = process.argv[pathFlag + 1];
  if (!DOCUMENTS[key]) {
    console.error(`document-dates: unknown document '${key}' (expected one of: ${Object.keys(DOCUMENTS).join(', ')})`);
    process.exit(1);
  }
  console.log(DOCUMENTS[key]);
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

const entries = [];
const notes = [];

for (const [key, file] of Object.entries(DOCUMENTS)) {
  let iso = lastCommitDate(file);
  let source = 'git';

  if (!iso) {
    // Uncommitted file, or a shallow clone whose history doesn't reach the last
    // change. Fall back to the file's mtime so the build still gets a date.
    try {
      iso = localDate((await stat(join(repoRoot, file))).mtime);
      source = isShallow ? 'mtime (shallow clone)' : 'mtime (uncommitted)';
      notes.push(`${key}: no commit found for ${file}, fell back to file mtime`);
    } catch {
      console.error(`document-dates: ${file} not found and not in git history`);
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
// Each entry is the date of the most recent commit that changed the matching
// PDF in public/, so the viewers can say when the document itself last changed.
export interface DocumentDate {
  /** Commit date of the last change, as YYYY-MM-DD. */
  iso: string;
  /** Human-readable date, e.g. "August 6, 2026". */
  label: string;
}

export const documentDates = {
${entries.map((e) => `  ${e.key}: { iso: '${e.iso}', label: '${e.label}' },`).join('\n')}
} satisfies Record<string, DocumentDate>;
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
