import { cpp } from '@codemirror/lang-cpp';
import PlaygroundShell from '../components/PlaygroundShell';
import { defaultCodeFor, examplesByLanguage } from './examples';
import { useRemoteRunner } from './useRemoteRunner';

export default function CppPlayground() {
  // g++ 15.3 (compiler ids are permanent on godbolt.org)
  const runner = useRemoteRunner({
    compilerId: 'g153',
    lang: 'c++',
    userArguments: '-O2 -std=c++23',
  });
  return (
    <PlaygroundShell
      languageLabel="C++"
      cmExtension={cpp()}
      runner={runner}
      examples={examplesByLanguage.cpp}
      defaultCode={defaultCodeFor('cpp')}
      modeLabel="runs remotely"
    />
  );
}
