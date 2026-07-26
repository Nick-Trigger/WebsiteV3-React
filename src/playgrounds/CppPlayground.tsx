import { cpp } from '@codemirror/lang-cpp';
import PlaygroundShell from '../components/PlaygroundShell';
import { examplesByLanguage } from './examples';
import { useRemoteRunner } from './useRemoteRunner';

const DEFAULT_CODE = `// C++, compiled and run remotely on the Compiler Explorer sandbox.
// Your code is sent to godbolt.org over HTTPS; only text output comes back.
#include <iostream>

int main() {
    std::cout << "Hello, world!" << std::endl;
    return 0;
}
`;

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
      defaultCode={DEFAULT_CODE}
      modeLabel="runs remotely"
    />
  );
}
