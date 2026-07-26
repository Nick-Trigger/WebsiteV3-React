/**
 * Auto-discovered playground examples.
 *
 * Drop a file into src/playgrounds/examples/<language>/ and it appears in
 * that playground's Examples menu automatically — IF it is valid:
 *   - the extension matches the language (.py for python, .js for javascript);
 *   - the filename is plain (letters, digits, dashes, underscores only);
 *   - the file is non-empty and at most MAX_EXAMPLE_CHARS characters.
 * Invalid files are skipped with a console warning instead of breaking the
 * page. Files are bundled AS TEXT at build time (`?raw`) — they are never
 * imported as modules and never executed unless a visitor presses Run.
 *
 * Naming: an optional numeric prefix orders the menu and is stripped from the
 * title, e.g. `01-hello-world.py` → “Hello World”.
 */

export interface PlaygroundExample {
  id: string;
  title: string;
  code: string;
}

const MAX_EXAMPLE_CHARS = 20_000;

const pythonFiles = import.meta.glob('./python/*.py', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const javascriptFiles = import.meta.glob('./javascript/*.js', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const cFiles = import.meta.glob('./c/*.c', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const cppFiles = import.meta.glob('./cpp/*.cpp', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const rustFiles = import.meta.glob('./rust/*.rs', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function titleFromFilename(name: string): string {
  return name
    .replace(/^\d+[-_]/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildExamples(
  files: Record<string, unknown>,
  extension: string,
): PlaygroundExample[] {
  const namePattern = new RegExp(`^[A-Za-z0-9_-]+\\.${extension}$`);
  return Object.keys(files)
    .sort()
    .flatMap((path) => {
      const filename = path.split('/').pop() ?? path;
      const code = files[path];
      if (typeof code !== 'string' || !namePattern.test(filename)) {
        console.warn(`[playgrounds] skipping invalid example file: ${path}`);
        return [];
      }
      if (code.trim().length === 0 || code.length > MAX_EXAMPLE_CHARS) {
        console.warn(`[playgrounds] skipping empty/oversized example file: ${path}`);
        return [];
      }
      return [
        {
          id: filename,
          title: titleFromFilename(filename.slice(0, -(extension.length + 1))),
          code,
        },
      ];
    });
}

export const examplesByLanguage: Record<
  'python' | 'javascript' | 'c' | 'cpp' | 'rust',
  PlaygroundExample[]
> = {
  python: buildExamples(pythonFiles, 'py'),
  javascript: buildExamples(javascriptFiles, 'js'),
  c: buildExamples(cFiles, 'c'),
  cpp: buildExamples(cppFiles, 'cpp'),
  rust: buildExamples(rustFiles, 'rs'),
};
