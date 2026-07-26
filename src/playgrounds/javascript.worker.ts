/// <reference lib="webworker" />
/**
 * JavaScript playground worker. User code does NOT run in this worker's own
 * JS engine — it runs inside QuickJS compiled to WebAssembly, a completely
 * separate VM with its own heap. The VM starts empty: no fetch, no DOM, no
 * timers, no host objects at all except the console shim defined below.
 *
 * Guardrails applied here (the main thread adds a hard kill-timeout on top):
 *  - Fresh runtime + context per run; disposed afterwards.
 *  - Memory limit and stack limit on the VM heap.
 *  - Instruction-level interrupt handler enforces an in-VM deadline, so
 *    `while (true) {}` dies inside the sandbox without killing the worker.
 *  - Output is capped at MAX_OUTPUT_CHARS per run and truncated beyond that.
 */
import variant from '@jitl/quickjs-singlefile-browser-release-sync';
import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core';
import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core';
import {
  JS_MAX_STACK_BYTES,
  JS_MEMORY_LIMIT_BYTES,
  MAX_OUTPUT_CHARS,
  VM_DEADLINE_MS,
  type RunRequest,
  type WorkerEvent,
} from './types';

const post = (msg: WorkerEvent) => self.postMessage(msg);

let outputUsed = 0;
let truncated = false;

const emit = (stream: 'stdout' | 'stderr', text: string) => {
  if (truncated) return;
  outputUsed += text.length;
  if (outputUsed > MAX_OUTPUT_CHARS) {
    truncated = true;
    const keep = text.length - (outputUsed - MAX_OUTPUT_CHARS);
    if (keep > 0) post({ type: 'output', stream, text: text.slice(0, keep) });
    post({
      type: 'output',
      stream: 'stderr',
      text: `\n[output truncated after ${MAX_OUTPUT_CHARS.toLocaleString()} characters]\n`,
    });
    return;
  }
  post({ type: 'output', stream, text });
};

const quickJSReady = (async () => {
  post({ type: 'status', text: 'Loading JavaScript sandbox (QuickJS/WASM)…' });
  const mod = await newQuickJSWASMModuleFromVariant(variant);
  post({ type: 'ready' });
  return mod;
})();

quickJSReady.catch((err) => {
  post({
    type: 'done',
    id: -1,
    ok: false,
    error: `Failed to load the JavaScript sandbox: ${err instanceof Error ? err.message : String(err)}`,
    durationMs: 0,
  });
});

/** Render one console argument the way devtools roughly would. */
function formatValue(ctx: QuickJSContext, handle: QuickJSHandle): string {
  try {
    const value = ctx.dump(handle);
    if (typeof value === 'string') return value;
    if (value === undefined) return 'undefined';
    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  } catch {
    return '[unprintable value]';
  }
}

/**
 * Disable `eval` inside the VM.
 *
 * Like the Python guard, this is hygiene rather than a boundary: the VM is
 * built fresh for every run, has no host bindings beyond `console`, and
 * cannot reach the page or the network, so `eval` could not have escaped
 * anything either way.
 *
 * The `Function` constructor is deliberately left alone. It is the same
 * capability as `eval`, but blocking it buys nothing — `(() => {}).constructor`
 * hands it straight back — while shadowing a builtin that ordinary code
 * legitimately touches.
 */
const HARDEN_PRELUDE = `
(function () {
  Object.defineProperty(globalThis, 'eval', {
    value: function () {
      throw new Error('eval is disabled in this playground.');
    },
    writable: false, configurable: false,
  });
})();
`;

function harden(ctx: QuickJSContext) {
  const result = ctx.evalCode(HARDEN_PRELUDE, 'playground-internal.js');
  if (result.error) result.error.dispose();
  else result.value.dispose();
}

/** Install console.log/info/warn/error/debug and print() into the VM. */
function installConsole(ctx: QuickJSContext) {
  const consoleHandle = ctx.newObject();
  const streams: Array<[string, 'stdout' | 'stderr']> = [
    ['log', 'stdout'],
    ['info', 'stdout'],
    ['debug', 'stdout'],
    ['warn', 'stderr'],
    ['error', 'stderr'],
  ];
  for (const [method, stream] of streams) {
    const fn = ctx.newFunction(method, (...args) => {
      emit(stream, args.map((a) => formatValue(ctx, a)).join(' ') + '\n');
    });
    ctx.setProp(consoleHandle, method, fn);
    fn.dispose();
  }
  ctx.setProp(ctx.global, 'console', consoleHandle);
  consoleHandle.dispose();

  const printFn = ctx.newFunction('print', (...args) => {
    emit('stdout', args.map((a) => formatValue(ctx, a)).join(' ') + '\n');
  });
  ctx.setProp(ctx.global, 'print', printFn);
  printFn.dispose();
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const msg = event.data;
  if (!msg || msg.type !== 'run' || typeof msg.code !== 'string') return;

  let QuickJS;
  try {
    QuickJS = await quickJSReady;
  } catch {
    return; // load failure already reported above
  }

  outputUsed = 0;
  truncated = false;
  const started = performance.now();

  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(JS_MEMORY_LIMIT_BYTES);
  runtime.setMaxStackSize(JS_MAX_STACK_BYTES);
  const deadline = Date.now() + VM_DEADLINE_MS;
  runtime.setInterruptHandler(() => Date.now() > deadline);

  const ctx = runtime.newContext();
  try {
    installConsole(ctx);
    harden(ctx);
    const result = ctx.evalCode(msg.code, 'playground.js');
    if (result.error) {
      const errValue = ctx.dump(result.error) as
        | { name?: string; message?: string; stack?: string }
        | string;
      result.error.dispose();
      const text =
        typeof errValue === 'string'
          ? errValue
          : `${errValue?.name ?? 'Error'}: ${errValue?.message ?? 'unknown error'}` +
            (errValue?.stack ? `\n${errValue.stack}` : '');
      post({ type: 'done', id: msg.id, ok: false, error: text, durationMs: performance.now() - started });
    } else {
      // Flush microtasks so resolved promises / .then chains run.
      runtime.executePendingJobs();
      const value = ctx.dump(result.value);
      result.value.dispose();
      if (value !== undefined) emit('stdout', `${formatPlain(value)}\n`);
      post({ type: 'done', id: msg.id, ok: true, durationMs: performance.now() - started });
    }
  } catch (err) {
    post({
      type: 'done',
      id: msg.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: performance.now() - started,
    });
  } finally {
    try {
      ctx.dispose();
    } catch {
      /* already disposed */
    }
    try {
      runtime.dispose();
    } catch {
      /* already disposed */
    }
  }
};

function formatPlain(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
