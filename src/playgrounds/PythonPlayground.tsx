import { python } from '@codemirror/lang-python';
import PlaygroundShell from '../components/PlaygroundShell';
import { defaultCodeFor, examplesByLanguage } from './examples';
import { useRunner } from './useRunner';

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
      defaultCode={defaultCodeFor('python')}
      modeLabel="browser hosted"
    />
  );
}
