/**
 * Shared message protocol and hard limits for every code playground.
 *
 * Security model: user code NEVER runs on the page. Each language runs inside
 * a dedicated Web Worker (no DOM, no cookies, no page state), and inside that
 * worker the code is further confined to a WASM interpreter (CPython via
 * Pyodide, or QuickJS for JavaScript). The main thread enforces a hard
 * wall-clock timeout by terminating the worker outright, so nothing user code
 * does can keep it alive.
 */

/** Hard wall-clock limit per run; the worker is terminated when it expires. */
export const RUN_TIMEOUT_MS = 15_000;

/**
 * Extended ceiling while the Python worker is downloading packages from the
 * pinned CDN (numpy, pandas, … can be tens of MB). Still a hard kill limit.
 */
export const PACKAGE_TIMEOUT_MS = 60_000;

/** Max images (matplotlib figures, turtle drawings) relayed per run. */
export const MAX_IMAGES_PER_RUN = 6;

/** Max size of one relayed image (base64 characters). */
export const MAX_IMAGE_CHARS = 4_000_000;

/**
 * Image formats the worker may relay. SVG is rendered through an <img> data
 * URI, which browsers load in "secure static mode" — scripts and external
 * references inside the document never run.
 */
export type ImageMime = 'image/png' | 'image/svg+xml';

/**
 * In-VM interrupt deadline for the QuickJS sandbox. Slightly under the main
 * thread timeout so well-behaved overruns die inside the VM (cheap) before
 * the worker has to be killed (expensive: runtime must reload).
 */
export const VM_DEADLINE_MS = 14_000;

/** Total output cap per run, enforced in the worker AND on the main thread. */
export const MAX_OUTPUT_CHARS = 64_000;

/** Minimum delay between two Run clicks (simple client-side rate limit). */
export const MIN_RUN_INTERVAL_MS = 1_000;

/** Largest program we accept from the editor. */
export const MAX_CODE_CHARS = 100_000;

/** QuickJS per-runtime memory ceiling (bytes). */
export const JS_MEMORY_LIMIT_BYTES = 64 * 1024 * 1024;

/** QuickJS max stack size (bytes). */
export const JS_MAX_STACK_BYTES = 1024 * 1024;

export type OutputStream = 'stdout' | 'stderr' | 'system' | 'image';

/** Main thread -> worker. */
export interface RunRequest {
  type: 'run';
  id: number;
  code: string;
}

/** Worker -> main thread. */
export type WorkerEvent =
  | { type: 'status'; text: string }
  | { type: 'ready' }
  | { type: 'output'; stream: 'stdout' | 'stderr'; text: string }
  /** Loading packages ('packages', longer timeout) vs executing code ('exec'). */
  | { type: 'phase'; phase: 'packages' | 'exec' }
  /** A rendered image (matplotlib figure or turtle drawing) as base64. */
  | { type: 'image'; dataB64: string; mime: ImageMime }
  | { type: 'done'; id: number; ok: boolean; error?: string; durationMs: number };

export interface OutputChunk {
  stream: OutputStream;
  /** Text for stdout/stderr/system; base64 image data for 'image'. */
  text: string;
  /** Set only on 'image' chunks. */
  mime?: ImageMime;
}
