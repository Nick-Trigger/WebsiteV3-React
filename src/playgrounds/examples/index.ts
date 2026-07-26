/**
 * Auto-discovered playground examples.
 *
 * Naming: an optional numeric prefix orders the menu and is stripped from the
 * title, e.g. `01-hello-world.py` → “Hello World”.
 * 
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

export type PlaygroundLanguage = 'python' | 'javascript' | 'c' | 'cpp' | 'rust';

export const examplesByLanguage: Record<PlaygroundLanguage, PlaygroundExample[]> = {
  python: buildExamples(pythonFiles, 'py'),
  javascript: buildExamples(javascriptFiles, 'js'),
  c: buildExamples(cFiles, 'c'),
  cpp: buildExamples(cppFiles, 'cpp'),
  rust: buildExamples(rustFiles, 'rs'),
};

/** Title of the example every playground opens with. */
const DEFAULT_EXAMPLE_TITLE = 'Hello World';

/**
 * The code a playground starts with and returns to when you press Reset.
 *
 * It is simply the "Hello World" entry from that language's examples, so the
 * starting program and the menu entry can never drift apart, and editing the
 * example file is all it takes to change what visitors first see. The example
 * stays listed in the menu as normal. Falls back to the first example if a
 * language has no Hello World.
 */
export function defaultCodeFor(language: PlaygroundLanguage): string {
  const available = examplesByLanguage[language];
  const start =
    available.find((example) => example.title === DEFAULT_EXAMPLE_TITLE) ?? available[0];
  return start?.code ?? '';
}
