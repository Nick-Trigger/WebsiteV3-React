import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MAX_CODE_CHARS,
  MAX_IMAGES_PER_RUN,
  MAX_OUTPUT_CHARS,
  MIN_RUN_INTERVAL_MS,
  PACKAGE_TIMEOUT_MS,
  RUN_TIMEOUT_MS,
  type OutputChunk,
  type RunRequest,
  type WorkerEvent,
} from './types';
import type { RunnerHandle, RunnerState } from './runnerTypes';

/**
 * Main-thread half of the in-browser (Web Worker + WASM) sandbox. Owns the
 * worker lifecycle and enforces the guardrails the worker itself cannot be
 * trusted to honor once user code is inside it:
 *  - hard wall-clock timeout: the worker is TERMINATED, not asked to stop
 *    (15s for execution; up to 60s while the Python worker downloads
 *    packages from the pinned CDN);
 *  - a Stop button doing the same on demand;
 *  - output/image caps (defense in depth. the worker also truncates);
 *  - minimum interval between runs;
 *  - program size cap.
 *
 * After a kill the worker is rebuilt lazily on the next run.
 */
export function useRunner(createWorker: () => Worker): RunnerHandle {
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const lastRunAtRef = useRef(0);
  const outputUsedRef = useRef(0);
  const imageCountRef = useRef(0);
  const execPhaseSeenRef = useRef(false);
  const createWorkerRef = useRef(createWorker);
  createWorkerRef.current = createWorker;

  const [state, setState] = useState<RunnerState>('idle');
  const [chunks, setChunks] = useState<OutputChunk[]>([]);
  const [lastRun, setLastRun] = useState<{ ok: boolean; durationMs: number } | null>(null);

  const appendChunk = useCallback((chunk: OutputChunk) => {
    if (chunk.stream === 'image') {
      imageCountRef.current += 1;
      if (imageCountRef.current > MAX_IMAGES_PER_RUN) return;
    } else if (chunk.stream !== 'system') {
      if (outputUsedRef.current >= MAX_OUTPUT_CHARS) return;
      outputUsedRef.current += chunk.text.length;
    }
    setChunks((prev) => {
      // Merge into the previous chunk when the stream matches so the array
      // stays small even for print-heavy programs. Images are never merged.
      const last = prev[prev.length - 1];
      if (last && last.stream === chunk.stream && chunk.stream !== 'image') {
        return [...prev.slice(0, -1), { stream: chunk.stream, text: last.text + chunk.text }];
      }
      return [...prev, chunk];
    });
  }, []);

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const killWorker = useCallback((reason: string) => {
    clearTimer();
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (reason) appendChunk({ stream: 'system', text: reason });
    setState('idle');
  }, [appendChunk]);

  const armTimer = useCallback(
    (ms: number) => {
      clearTimer();
      timeoutRef.current = window.setTimeout(() => {
        killWorker(
          `Execution exceeded the ${Math.round(ms / 1000)}s limit and was terminated. ` +
            `The runtime will reload on the next run.\n`,
        );
      }, ms);
    },
    [killWorker],
  );

  const handleEvent = useCallback(
    (event: MessageEvent<WorkerEvent>) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;
      switch (msg.type) {
        case 'status':
          appendChunk({ stream: 'system', text: msg.text.endsWith('\n') ? msg.text : `${msg.text}\n` });
          break;
        case 'ready':
          // Runtime finished loading; the queued run is now actually executing.
          setState((s) => (s === 'starting' ? 'running' : s));
          break;
        case 'phase':
          // Package downloads get a longer (still hard) ceiling; once
          // execution starts the strict limit is re-armed. Only honored once
          // per run and only in that order.
          if (msg.phase === 'packages' && !execPhaseSeenRef.current) {
            armTimer(PACKAGE_TIMEOUT_MS);
          } else if (msg.phase === 'exec') {
            execPhaseSeenRef.current = true;
            armTimer(RUN_TIMEOUT_MS);
          }
          break;
        case 'output':
          appendChunk({ stream: msg.stream, text: msg.text });
          break;
        case 'image':
          if (typeof msg.dataB64 === 'string') {
            appendChunk({ stream: 'image', text: msg.dataB64, mime: msg.mime });
          }
          break;
        case 'done':
          clearTimer();
          if (msg.error) appendChunk({ stream: 'stderr', text: `${msg.error}\n` });
          if (msg.id === -1) {
            // Runtime failed to load; drop the worker so a retry reloads it.
            killWorker('');
          }
          setLastRun({ ok: msg.ok, durationMs: msg.durationMs });
          setState('idle');
          break;
      }
    },
    [appendChunk, killWorker, armTimer],
  );

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
      imageCountRef.current = 0;
      execPhaseSeenRef.current = false;

      let worker = workerRef.current;
      if (!worker) {
        worker = createWorkerRef.current();
        worker.onmessage = handleEvent;
        worker.onerror = () => {
          killWorker('The sandbox crashed unexpectedly. Press Run to restart it.\n');
        };
        workerRef.current = worker;
        setState('starting');
      } else {
        setState('running');
      }

      runIdRef.current += 1;
      const request: RunRequest = { type: 'run', id: runIdRef.current, code };
      worker.postMessage(request);
      armTimer(RUN_TIMEOUT_MS);
    },
    [state, appendChunk, handleEvent, killWorker, armTimer],
  );

  const stop = useCallback(() => {
    if (state === 'idle') return;
    killWorker('Stopped. The runtime will reload on the next run.\n');
  }, [state, killWorker]);

  const clear = useCallback(() => {
    setChunks([]);
    setLastRun(null);
  }, []);

  /**
   * Discard the interpreter entirely. The worker is rebuilt on the next run,
   * so anything a previous program broke inside it is gone.
   */
  const restart = useCallback(() => {
    killWorker('Runtime restarted. The next run starts from a clean interpreter.\n');
  }, [killWorker]);

  // Tear the worker down when the page unmounts.
  useEffect(() => {
    return () => {
      clearTimer();
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return { state, chunks, lastRun, run, stop, clear, restart };
}
