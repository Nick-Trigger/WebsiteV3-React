import { rust } from '@codemirror/lang-rust';
import PlaygroundShell from '../components/PlaygroundShell';
import { examplesByLanguage } from './examples';
import { useRemoteRunner } from './useRemoteRunner';

const DEFAULT_CODE = `// Rust, compiled and run remotely on the Compiler Explorer sandbox.
// Your code is sent to godbolt.org over HTTPS; only text output comes back.

fn main() {
    println!("Hello, world!");
}
`;

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
      defaultCode={DEFAULT_CODE}
      modeLabel="runs remotely"
    />
  );
}
