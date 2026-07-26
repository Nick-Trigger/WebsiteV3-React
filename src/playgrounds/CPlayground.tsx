import { cpp } from '@codemirror/lang-cpp';
import PlaygroundShell from '../components/PlaygroundShell';
import { defaultCodeFor, examplesByLanguage } from './examples';
import { useRemoteRunner } from './useRemoteRunner';

export default function CPlayground() {
  // gcc 15.3 (compiler ids are permanent on godbolt.org)
  const runner = useRemoteRunner({ compilerId: 'cg153', lang: 'c', userArguments: '-O2' });
  return (
    <PlaygroundShell
      languageLabel="C"
      cmExtension={cpp()}
      runner={runner}
      examples={examplesByLanguage.c}
      defaultCode={defaultCodeFor('c')}
      modeLabel="runs remotely"
    />
  );
}
