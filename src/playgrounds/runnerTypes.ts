import type { OutputChunk } from './types';

export type RunnerState = 'idle' | 'starting' | 'running';

/**
 * What PlaygroundShell needs from any execution backend. Implemented by
 * useRunner (in-browser Web Worker + WASM sandboxes) and usePistonRunner
 * (remote Piston execution service).
 */
export interface RunnerHandle {
  state: RunnerState;
  chunks: OutputChunk[];
  lastRun: { ok: boolean; durationMs: number } | null;
  run: (code: string) => void;
  stop: () => void;
  clear: () => void;
  /**
   * Throw away the current interpreter and start a clean one. Only backends
   * that keep state between runs provide this feature. Remote runners are stateless,
   * so the control is hidden for them.
   */
  restart?: () => void;
}
