import { rust } from '@codemirror/lang-rust';
import PlaygroundShell from '../components/PlaygroundShell';
import { defaultCodeFor, examplesByLanguage } from './examples';
import { useRemoteRunner } from './useRemoteRunner';

export default function RustPlayground() {
  // rustc 1.97 (compiler ids are permanent on godbolt.org)
  const runner = useRemoteRunner({
    compilerId: 'r1970',
    lang: 'rust',
    userArguments: '--edition=2021 -O',
  });
  return (
    <PlaygroundShell
      languageLabel="Rust"
      cmExtension={rust()}
      runner={runner}
      examples={examplesByLanguage.rust}
      defaultCode={defaultCodeFor('rust')}
      modeLabel="runs remotely"
    />
  );
}
