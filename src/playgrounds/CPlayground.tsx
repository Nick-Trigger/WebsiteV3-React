import { cpp } from '@codemirror/lang-cpp';
import PlaygroundShell from '../components/PlaygroundShell';
import { examplesByLanguage } from './examples';
import { useRemoteRunner } from './useRemoteRunner';

const DEFAULT_CODE = `// C, compiled and run remotely on the Compiler Explorer sandbox.
// Your code is sent to godbolt.org over HTTPS; only text output comes back.
#include <stdio.h>

int main(void) {
    printf("Hello, world!\\n");
    return 0;
}
`;

export default function CPlayground() {
  // gcc 15.3 (compiler ids are permanent on godbolt.org)
  const runner = useRemoteRunner({ compilerId: 'cg153', lang: 'c', userArguments: '-O2' });
  return (
    <PlaygroundShell
      languageLabel="C"
      cmExtension={cpp()}
      runner={runner}
      examples={examplesByLanguage.c}
      defaultCode={DEFAULT_CODE}
      modeLabel="runs remotely"
    />
  );
}
