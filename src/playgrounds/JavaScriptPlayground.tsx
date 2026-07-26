import { javascript } from '@codemirror/lang-javascript';
import PlaygroundShell from '../components/PlaygroundShell';
import { defaultCodeFor, examplesByLanguage } from './examples';
import { useRunner } from './useRunner';

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
      defaultCode={defaultCodeFor('javascript')}
      modeLabel="browser hosted"
    />
  );
}
