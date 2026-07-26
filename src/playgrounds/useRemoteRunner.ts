import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MAX_CODE_CHARS,
  MAX_OUTPUT_CHARS,
  MIN_RUN_INTERVAL_MS,
  type OutputChunk,
} from './types';
import type { RunnerHandle, RunnerState } from './runnerTypes';

/**
 * Remote execution backend for compiled languages (C, C++, Rust) that have no
 * practical in-browser toolchain. Code is POSTed over HTTPS to the public
 * Compiler Explorer API (godbolt.org), compiled and executed inside its
 * sandbox, and ONLY text output comes back — nothing executes in the
 * visitor's browser or on this site.
 *
 * (The Piston public API would have been the alternative, but it went
 * whitelist-only in Feb 2026; Compiler Explorer's API is public and sends
 * `Access-Control-Allow-Origin: *`.)
 *
 * Guardrails:
 *  - responses are rendered as plain text only (React text nodes), with ANSI
 *    escape sequences stripped;
 *  - client-side timeout via AbortController (the service also enforces its
 *    own CPU/memory/time limits server-side);
 *  - output cap identical to the local sandboxes;
 *  - minimum interval between runs, and friendly handling of rate limiting.
 */
const GODBOLT_API_BASE = 'https://godbolt.org/api/compiler';

/** Client-side ceiling for the whole round trip (queue + compile + run). */
const REMOTE_TIMEOUT_MS = 30_000;

export interface RemoteRunnerConfig {
  /**
   * Compiler Explorer compiler id, e.g. 'cg153' (gcc 15.3 for C), 'g153'
   * (g++ 15.3), 'r1970' (rustc 1.97). Ids are permanent on godbolt.org.
   */
  compilerId: string;
  /** Compiler Explorer language id: 'c', 'c++', 'rust', … */
  lang: string;
  /** Extra compiler flags, e.g. '-O2 -std=c++23'. */
  userArguments?: string;
}

interface TextLine {
  text?: string;
}

interface GodboltResult {
  code?: number | null;
  didExecute?: boolean;
  timedOut?: boolean;
  truncated?: boolean;
  stdout?: TextLine[];
  stderr?: TextLine[];
  buildResult?: {
    code?: number | null;
    stdout?: TextLine[];
    stderr?: TextLine[];
  };
}

/** The API colorizes diagnostics; strip ANSI escapes for plain-text display. */
// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\x1b\[[0-9;]*[A-Za-z]/g;

const joinLines = (lines: TextLine[] | undefined): string =>
  (lines ?? [])
    .map((l) => (l.text ?? '').replace(ANSI_PATTERN, ''))
    .join('\n');

export function useRemoteRunner(config: RemoteRunnerConfig): RunnerHandle {
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const lastRunAtRef = useRef(0);
  const outputUsedRef = useRef(0);
  const configRef = useRef(config);
  configRef.current = config;

  const [state, setState] = useState<RunnerState>('idle');
  const [chunks, setChunks] = useState<OutputChunk[]>([]);
  const [lastRun, setLastRun] = useState<{ ok: boolean; durationMs: number } | null>(null);

  const appendChunk = useCallback((chunk: OutputChunk) => {
    if (chunk.text.length === 0) return;
    if (chunk.stream !== 'system') {
      if (outputUsedRef.current >= MAX_OUTPUT_CHARS) return;
      const room = MAX_OUTPUT_CHARS - outputUsedRef.current;
      if (chunk.text.length > room) {
        chunk = {
          stream: chunk.stream,
          text:
            chunk.text.slice(0, room) +
            `\n[output truncated after ${MAX_OUTPUT_CHARS.toLocaleString()} characters]\n`,
        };
        outputUsedRef.current = MAX_OUTPUT_CHARS;
      } else {
        outputUsedRef.current += chunk.text.length;
      }
    }
    setChunks((prev) => [...prev, chunk]);
  }, []);

  const cleanup = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    abortRef.current = null;
  };

  const run = useCallback(
    (code: string) => {
      const now = Date.now();
      if (state !== 'idle') return;
      if (now - lastRunAtRef.current < MIN_RUN_INTERVAL_MS) return;
      lastRunAtRef.current = now;

      if (code.length > MAX_CODE_CHARS) {
        appendChunk({
          stream: 'system',
          text: `Program too large (max ${MAX_CODE_CHARS.toLocaleString()} characters).\n`,
        });
        return;
      }

      setChunks([]);
      setLastRun(null);
      outputUsedRef.current = 0;
      setState('running');

      const controller = new AbortController();
      abortRef.current = controller;
      timeoutRef.current = window.setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);

      const { compilerId, lang, userArguments = '' } = configRef.current;
      appendChunk({
        stream: 'system',
        text: 'Compiling and running on the Compiler Explorer sandbox (godbolt.org)…\n',
      });
      const started = performance.now();

      (async () => {
        const res = await fetch(`${GODBOLT_API_BASE}/${encodeURIComponent(compilerId)}/compile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            source: code,
            lang,
            allowStoreCodeDebug: false,
            options: {
              userArguments,
              compilerOptions: { executorRequest: true, skipAsm: true },
              filters: { execute: true },
              executeParameters: { args: [], stdin: '' },
            },
          }),
        });

        if (res.status === 429) {
          throw new Error(
            'The public execution service is rate-limiting requests. Wait a few seconds and try again.',
          );
        }
        if (!res.ok) {
          throw new Error(`Execution service error (HTTP ${res.status}).`);
        }

        const data = (await res.json()) as GodboltResult;
        const durationMs = performance.now() - started;

        const build = data.buildResult;
        const compileFailed =
          data.didExecute !== true && typeof build?.code === 'number' && build.code !== 0;
        const buildStderr = joinLines(build?.stderr);
        if (buildStderr) appendChunk({ stream: 'stderr', text: buildStderr + '\n' });
        if (compileFailed) {
          appendChunk({ stream: 'system', text: 'Compilation failed.\n' });
          setLastRun({ ok: false, durationMs });
          return;
        }

        const stdout = joinLines(data.stdout);
        const stderr = joinLines(data.stderr);
        if (stdout) appendChunk({ stream: 'stdout', text: stdout + '\n' });
        if (stderr) appendChunk({ stream: 'stderr', text: stderr + '\n' });
        if (data.timedOut) {
          appendChunk({
            stream: 'system',
            text: 'The program exceeded the sandbox time limit and was stopped.\n',
          });
        }
        if (typeof data.code === 'number' && data.code !== 0) {
          appendChunk({ stream: 'system', text: `Process exited with code ${data.code}.\n` });
        }
        setLastRun({ ok: data.code === 0, durationMs });
      })()
        .catch((err: unknown) => {
          const aborted = controller.signal.aborted;
          appendChunk({
            stream: aborted ? 'system' : 'stderr',
            text: aborted
              ? 'Request cancelled.\n'
              : `${err instanceof Error ? err.message : String(err)}\n`,
          });
          setLastRun({ ok: false, durationMs: performance.now() - started });
        })
        .finally(() => {
          cleanup();
          setState('idle');
        });
    },
    [state, appendChunk],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    setChunks([]);
    setLastRun(null);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      cleanup();
    };
  }, []);

  return { state, chunks, lastRun, run, stop, clear };
}
