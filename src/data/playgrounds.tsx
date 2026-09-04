import type { ComponentType } from 'react';
import {
  PythonLogo,
  JavaScriptLogo,
  CLogo,
  CppLogo,
  RustLogo,
} from '../components/LanguageLogo';
import PythonPlayground from '../playgrounds/PythonPlayground';
import JavaScriptPlayground from '../playgrounds/JavaScriptPlayground';
import CPlayground from '../playgrounds/CPlayground';
import CppPlayground from '../playgrounds/CppPlayground';
import RustPlayground from '../playgrounds/RustPlayground';

export interface Playground {
  /** URL slug; the route is /projects/playgrounds/<slug>. */
  slug: string;
  title: string;
  description: string;
  /** Short labels; the first one is used as the listing-card badge. */
  tags?: string[];
  /** Bullet points shown under the editor ("How the sandbox works"). */
  notes?: string[];
  /** The language logo, used as the listing-card icon. */
  Logo: ComponentType<{ className?: string }>;
  /** The interactive playground. Rendered client-only via PlaygroundLayout. */
  Component: ComponentType;
}

/**
 * The single source of truth for the playgrounds section. Add an entry here
 * and it shows up on the /projects/playgrounds index and gets its own route
 * automatically (see src/routes.tsx). Remember to also add its path to
 * scripts/postbuild.mjs so it lands in the sitemap.
 *
 * Security: every playground must execute code OFF the page in a Web
 * Worker wrapping a WASM VM through src/playgrounds/useRunner.ts, which
 * enforces the hard timeout, output cap, and run rate limit.
 */
export const playgrounds: Playground[] = [
  {
    slug: 'python',
    title: 'Python Playground',
    description:
      'Write and run Python code directly in your browser.',
    tags: ['Local', 'Python', 'Pyodide'],
    notes: [
      'Your code runs in CPython compiled to WebAssembly (Pyodide), inside a Web Worker; it never touches this page or any server',
      'Network access is disabled inside the sandbox.',
      'The standard library is included, and popular packages (numpy, pandas, matplotlib, …) are automatically installed on first import',
      'turtle is supported through a pure-Python implementation: drawings render as an image below the output, as do matplotlib figures',
      'exec(), eval() and compile() are disabled, and the interpreter’s own files are read-only; your working directory stays writable',
      'Runs are limited to 15 seconds (plus up to 60s for package downloads) and 64 KB of output; use Stop to end a run, or Restart runtime for a clean interpreter',
    ],
    Logo: PythonLogo,
    Component: PythonPlayground,
  },
  {
    slug: 'javascript',
    title: 'JavaScript Playground',
    description:
      'Run JavaScript inside an isolated QuickJS virtual machine compiled to WebAssembly.',
    tags: ['Local', 'JavaScript', 'QuickJS'],
    notes: [
      'Your code runs in QuickJS, a separate JS engine compiled to WebAssembly.',
      'The VM starts empty no DOM, no fetch, and no timers, just a JS interpreter.',
      'Each run gets a fresh VM with a 64 MB memory cap and an in-VM execution deadline: nothing carries over between runs',
      'eval() is disabled',
      'Runs are limited to 15 seconds and 64 KB of output; use Stop to end a run early',
    ],
    Logo: JavaScriptLogo,
    Component: JavaScriptPlayground,
  },
  {
    slug: 'c',
    title: 'C Playground',
    description:
      'Write C and run it on a remote sandbox.',
    tags: ['Remote', 'C'],
    notes: [
      'There is no practical C compiler that runs in a browser (that I know of), so your code is sent over HTTPS to the public Compiler Explorer sandbox (godbolt.org), compiled with GCC 15',
      'It compiles and runs inside an isolated container there; only the text output is returned, and nothing executes in your browser or on this site',
      'Don’t paste secrets or private data THE CODE LEAVES YOUR MACHINE',
      'The sandbox enforces its own CPU, memory, and time limits; output shown here is capped at 64 KB',
    ],
    Logo: CLogo,
    Component: CPlayground,
  },
  {
    slug: 'cpp',
    title: 'C++ Playground',
    description:
      'Write modern C++ and run it on a remote sandbox.',
    tags: ['Remote', 'C++'],
    notes: [
      'There is no practical C++ compiler that runs in a browser (that I know of), so your code is sent over HTTPS to the public Compiler Explorer sandbox (godbolt.org), compiled with G++ 15 (-std=c++23)',
      'It compiles and runs inside an isolated container there; only the text output is returned, and nothing executes in your browser or on this site',
      'Don’t paste secrets or private data THE CODE LEAVES YOUR MACHINE',
      'The sandbox enforces its own CPU, memory, and time limits; output shown here is capped at 64 KB',
    ],
    Logo: CppLogo,
    Component: CppPlayground,
  },
  {
    slug: 'rust',
    title: 'Rust Playground',
    description:
      'Write Rust and run it on a remote sandbox.',
    tags: ['Remote', 'Rust'],
    notes: [
      'There is no practical Rust compiler that runs in a browser (that I know of), so your code is sent over HTTPS to the public Compiler Explorer sandbox (godbolt.org), compiled with rustc 1.97',
      'It compiles and runs inside an isolated container there; only the text output is returned, and nothing executes in your browser or on this site',
      'Don’t paste secrets or private data THE CODE LEAVES YOUR MACHINE',
      'The sandbox enforces its own CPU, memory, and time limits; output shown here is capped at 64 KB',
    ],
    Logo: RustLogo,
    Component: RustPlayground,
  },
];
