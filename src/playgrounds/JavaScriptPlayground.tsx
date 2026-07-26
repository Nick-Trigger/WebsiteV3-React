import { javascript } from '@codemirror/lang-javascript';
import PlaygroundShell from '../components/PlaygroundShell';
import { examplesByLanguage } from './examples';
import { useRunner } from './useRunner';

const DEFAULT_CODE = `// JavaScript running in a QuickJS VM (WebAssembly) — fully isolated
// from this page. Try an example from the menu above, or write your own.

console.log("Hello, world!");
`;

const createWorker = () =>
  new Worker(new URL('./javascript.worker.ts', import.meta.url), { type: 'module' });

export default function JavaScriptPlayground() {
  const runner = useRunner(createWorker);
  return (
    <PlaygroundShell
      languageLabel="JavaScript"
      cmExtension={javascript()}
      runner={runner}
      examples={examplesByLanguage.javascript}
      defaultCode={DEFAULT_CODE}
      modeLabel="runs in your browser"
    />
  );
}
