import { useCallback, useEffect, useRef, useState } from 'react';
import type { Extension } from '@codemirror/state';
import CodeEditor from './CodeEditor';
import type { RunnerHandle } from '../playgrounds/runnerTypes';
import type { PlaygroundExample } from '../playgrounds/examples';

interface PlaygroundShellProps {
  /** Display name of the language, e.g. "Python". */
  languageLabel: string;
  /** CodeMirror language extension. */
  cmExtension: Extension;
  /** Execution backend (useRunner for in-browser, usePistonRunner for remote). */
  runner: RunnerHandle;
  examples: PlaygroundExample[];
  defaultCode: string;
  /** Shown next to the toolbar while idle, e.g. "sandboxed" / "runs remotely". */
  modeLabel?: string;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const StopIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
);

/**
 * The interactive part of every playground page: editor, controls, and
 * output. Output is rendered exclusively as React text nodes inside a <pre>
 * — never as HTML — so nothing a program prints can inject markup into the
 * page.
 */
export default function PlaygroundShell({
  languageLabel,
  cmExtension,
  runner,
  examples,
  defaultCode,
  modeLabel = 'sandboxed',
}: PlaygroundShellProps) {
  const [code, setCode] = useState(defaultCode);
  const { state, chunks, lastRun, run, stop, clear, restart } = runner;
  const busy = state !== 'idle';
  const outputRef = useRef<HTMLPreElement | null>(null);

  const handleRun = useCallback(() => run(code), [run, code]);

  const loadExample = (example: PlaygroundExample) => {
    setCode(example.code);
    clear();
    // Close the DaisyUI dropdown (it stays open while focus remains inside).
    (document.activeElement as HTMLElement | null)?.blur();
  };

  // Keep the newest output in view while a program is printing.
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chunks]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn btn-primary btn-sm gap-1"
          onClick={handleRun}
          disabled={busy}
          title="Ctrl/Cmd+Enter"
        >
          <PlayIcon />
          {state === 'starting' ? 'Starting…' : state === 'running' ? 'Running…' : 'Run'}
        </button>
        {busy && (
          <button className="btn btn-error btn-outline btn-sm gap-1" onClick={stop}>
            <StopIcon />
            Stop
          </button>
        )}

        {examples.length > 0 && (
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-sm">
              Examples
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor" aria-hidden="true">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 rounded-box z-20 w-56 p-2 shadow-lg"
            >
              {examples.map((example) => (
                <li key={example.id}>
                  <button onClick={() => loadExample(example)}>{example.title}</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setCode(defaultCode);
            clear();
          }}
        >
          Reset
        </button>

        {restart && !busy && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={restart}
            title="Throw away the current interpreter and start a clean one"
          >
            Restart runtime
          </button>
        )}

        <span className="ml-auto text-xs text-base-content/50">
          {lastRun
            ? lastRun.ok
              ? `Finished in ${(lastRun.durationMs / 1000).toFixed(2)}s`
              : 'Finished with errors'
            : `${languageLabel} · ${modeLabel}`}
        </span>
      </div>

      <CodeEditor
        value={code}
        onChange={setCode}
        language={cmExtension}
        onRun={handleRun}
        ariaLabel={`${languageLabel} code editor`}
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-base-content/70">Output</span>
          {chunks.length > 0 && !busy && (
            <button className="btn btn-ghost btn-xs" onClick={clear}>
              Clear
            </button>
          )}
        </div>
        <pre
          ref={outputRef}
          className="rounded-lg bg-base-300 p-3 min-h-24 max-h-[36rem] overflow-auto text-sm font-mono whitespace-pre-wrap break-words"
          aria-live="polite"
        >
          {chunks.length === 0 ? (
            <span className="text-base-content/40">
              {busy ? 'Working…' : 'Press Run (or Ctrl/Cmd+Enter) to execute your code.'}
            </span>
          ) : (
            chunks.map((chunk, i) =>
              chunk.stream === 'image' ? (
                // Always an <img>, never inline markup: browsers load SVG
                // through <img> in secure static mode, so nothing inside the
                // document can script or fetch.
                <img
                  key={i}
                  src={`data:${chunk.mime ?? 'image/png'};base64,${chunk.text}`}
                  alt={`Figure ${i + 1} produced by the program`}
                  className="block my-2 max-w-full rounded bg-white"
                />
              ) : (
                <span
                  key={i}
                  className={
                    chunk.stream === 'stderr'
                      ? 'text-error'
                      : chunk.stream === 'system'
                        ? 'text-info italic'
                        : undefined
                  }
                >
                  {chunk.text}
                </span>
              ),
            )
          )}
        </pre>
      </div>
    </div>
  );
}
