import { python } from '@codemirror/lang-python';
import PlaygroundShell from '../components/PlaygroundShell';
import { examplesByLanguage } from './examples';
import { useRunner } from './useRunner';

const DEFAULT_CODE = `# Hello User!
# This is a simple Python program that runs entirely in your browser using WebAssembly.
# You can edit this code, try an example above, or write your own Python code in the editor below.

import sys

print("Hello from Python running entirely in your browser!")
print(f"Python version: {sys.version.split()[0]}")
print(f"Platform: {sys.platform}")  # 'emscripten' — CPython compiled to WebAssembly

`;

const createWorker = () =>
  new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' });

export default function PythonPlayground() {
  const runner = useRunner(createWorker);
  return (
    <PlaygroundShell
      languageLabel="Python"
      cmExtension={python()}
      runner={runner}
      examples={examplesByLanguage.python}
      defaultCode={DEFAULT_CODE}
      modeLabel="browser hosted"
    />
  );
}
