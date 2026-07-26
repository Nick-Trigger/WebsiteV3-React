/// <reference lib="webworker" />
/**
 * Python playground worker. Loads Pyodide (CPython compiled to WebAssembly)
 * from a version-pinned CDN and executes user code inside it.
 *
 * Guardrails applied here (the main thread adds a hard kill-timeout on top):
 *  - Runs in a Web Worker: no DOM, no cookies/localStorage of the page.
 *  - Code executes inside the WASM VM against a virtual in-memory filesystem.
 *  - After the runtime loads, `fetch` is replaced with a wrapper that ONLY
 *    accepts URLs under the pinned Pyodide CDN — that lets `import numpy`
 *    pull the browser-built wheel on demand while blocking every other
 *    network destination. All other network APIs are removed outright.
 *  - `postMessage` is captured and removed from the global, so Python code
 *    reaching the worker scope through the `js` bridge cannot forge protocol
 *    events to the main thread.
 *  - `_playground_guard` refuses exec/eval/compile from user code and blocks
 *    writes to the interpreter's own directories (see that module's docstring
 *    for what this does and does not protect).
 *  - Output is capped at MAX_OUTPUT_CHARS per run and truncated beyond that.
 *
 * Extra modules (src/playgrounds/pylib) are written into the virtual
 * filesystem at startup and put on sys.path, which is how `import turtle`
 * works despite Pyodide shipping no Tcl/Tk.
 *
 * matplotlib: MPLBACKEND is forced to AGG (there is no DOM here); after each
 * run any open figures are exported as PNGs, and any turtle drawing as SVG,
 * then relayed to the page to render underneath the output.
 */
import {
  MAX_IMAGE_CHARS,
  MAX_IMAGES_PER_RUN,
  MAX_OUTPUT_CHARS,
  type ImageMime,
  type RunRequest,
  type WorkerEvent,
} from './types';
import turtleSource from './pylib/turtle.py?raw';
import tkinterSource from './pylib/tkinter.py?raw';
import guardSource from './pylib/_playground_guard.py?raw';

// Pinned. Pyodide versions now track CPython: 314.x = Python 3.14.
const PYODIDE_VERSION = '314.0.3';
const PYTHON_VERSION = '3.14';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/** Where the playground's own modules live inside the virtual filesystem.
 *  Under /lib so _playground_guard's protected prefixes cover it too. */
const PYLIB_DIR = '/lib/playground';

const PYLIB_FILES: Record<string, string> = {
  'turtle.py': turtleSource,
  'tkinter.py': tkinterSource,
  '_playground_guard.py': guardSource,
};

// Captured before user code can ever run; survives the global being scrubbed.
const rawPost = self.postMessage.bind(self);
const post = (msg: WorkerEvent) => rawPost(msg);

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

let imagesThisRun = 0;

const postImage = (dataB64: string, mime: ImageMime) => {
  if (imagesThisRun >= MAX_IMAGES_PER_RUN) return;
  if (typeof dataB64 !== 'string' || !dataB64 || dataB64.length > MAX_IMAGE_CHARS) return;
  imagesThisRun += 1;
  post({ type: 'image', dataB64, mime });
};

/**
 * Lock the worker global down: fetch becomes CDN-only (so Pyodide can still
 * download packages), everything else network-capable is removed, and
 * postMessage disappears so sandboxed code can't talk to the page directly.
 */
function restrictGlobals() {
  const g = self as unknown as Record<string, unknown>;
  const realFetch = (self.fetch as typeof fetch).bind(self);
  g.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    if (typeof url === 'string' && url.startsWith(PYODIDE_INDEX_URL)) {
      return realFetch(input, init);
    }
    return Promise.reject(
      new TypeError(
        'Network access is disabled in this sandbox (only the pinned Pyodide package CDN is reachable).',
      ),
    );
  }) as typeof fetch;

  for (const name of [
    'XMLHttpRequest',
    'WebSocket',
    'EventSource',
    'importScripts',
    'RTCPeerConnection',
    'Worker',
    'SharedWorker',
    'postMessage',
  ]) {
    try {
      g[name] = undefined;
    } catch {
      /* some globals may be read-only; best effort */
    }
  }
}

// Minimal typing for the bits of Pyodide we use.
interface Pyodide {
  FS: {
    mkdirTree(path: string): void;
    writeFile(path: string, data: string, opts?: { encoding?: string }): void;
  };
  setStdout(opts: { batched: (line: string) => void }): void;
  setStderr(opts: { batched: (line: string) => void }): void;
  runPython(code: string): unknown;
  runPythonAsync(code: string): Promise<unknown>;
  loadPackagesFromImports(
    code: string,
    options?: { messageCallback?: (msg: string) => void },
  ): Promise<unknown>;
}

/** Install the bundled Python modules and turn on the guard. */
function bootstrapRuntime(pyodide: Pyodide) {
  pyodide.FS.mkdirTree(PYLIB_DIR);
  for (const [name, source] of Object.entries(PYLIB_FILES)) {
    pyodide.FS.writeFile(`${PYLIB_DIR}/${name}`, source, { encoding: 'utf8' });
  }
  pyodide.runPython(`
import sys, os
if ${JSON.stringify(PYLIB_DIR)} not in sys.path:
    sys.path.insert(0, ${JSON.stringify(PYLIB_DIR)})
os.environ.setdefault('MPLBACKEND', 'AGG')  # no DOM in a worker
import _playground_guard
_playground_guard.install()
`);
}

const pyodideReady: Promise<Pyodide> = (async () => {
  post({
    type: 'status',
    text: `Loading Python ${PYTHON_VERSION} runtime (~10 MB, cached after the first visit)…`,
  });
  // Remote, version-pinned module; intentionally not bundled.
  const mod = await import(/* @vite-ignore */ `${PYODIDE_INDEX_URL}pyodide.mjs`);
  const pyodide: Pyodide = await mod.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
  pyodide.setStdout({ batched: (line) => emit('stdout', line + '\n') });
  pyodide.setStderr({ batched: (line) => emit('stderr', line + '\n') });
  bootstrapRuntime(pyodide);
  // The runtime is up — lock the global down before any user code runs.
  restrictGlobals();
  post({ type: 'ready' });
  return pyodide;
})();

pyodideReady.catch((err) => {
  post({
    type: 'done',
    id: -1,
    ok: false,
    error: `Failed to load the Python runtime: ${err instanceof Error ? err.message : String(err)}`,
    durationMs: 0,
  });
});

/** Reset per-run drawing state and re-assert the guard. */
const PREPARE_RUN_PY = `
import sys as _sys
_sys.modules['_playground_guard'].refresh()
_t = _sys.modules.get('turtle')
if _t is not None:
    _t._playground_reset()
_plt = _sys.modules.get('matplotlib.pyplot')
if _plt is not None:
    _plt.close('all')
del _t, _plt, _sys
`;

/** Export any open matplotlib figures as base64 PNGs (JSON list). */
const CAPTURE_FIGURES_PY = `
def __playground_capture_figs():
    import sys
    if 'matplotlib.pyplot' not in sys.modules:
        return '[]'
    import json, io, base64
    plt = sys.modules['matplotlib.pyplot']
    out = []
    for num in plt.get_fignums()[:${MAX_IMAGES_PER_RUN}]:
        buf = io.BytesIO()
        plt.figure(num).savefig(buf, format='png', dpi=110, bbox_inches='tight')
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close('all')
    return json.dumps(out)
__playground_capture_figs()
`;

/** Export the turtle drawing, if any, as a base64 SVG document. */
const CAPTURE_TURTLE_PY = `
def __playground_capture_turtle():
    import sys
    turtle = sys.modules.get('turtle')
    if turtle is None or not turtle._playground_has_drawing():
        return ''
    import base64
    return base64.b64encode(turtle._playground_render().encode('utf8')).decode()
__playground_capture_turtle()
`;

/** Relay whatever the program drew. Never lets a capture failure fail a run. */
function relayImages(pyodide: Pyodide) {
  try {
    const raw = pyodide.runPython(CAPTURE_TURTLE_PY);
    const svg = String(raw ?? '');
    if (svg) postImage(svg, 'image/svg+xml');
  } catch {
    /* best effort */
  }
  try {
    const raw = pyodide.runPython(CAPTURE_FIGURES_PY);
    const figures: unknown = JSON.parse(String(raw));
    if (Array.isArray(figures)) {
      for (const dataB64 of figures) postImage(dataB64, 'image/png');
    }
  } catch {
    /* best effort */
  }
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const msg = event.data;
  if (!msg || msg.type !== 'run' || typeof msg.code !== 'string') return;

  let pyodide: Pyodide;
  try {
    pyodide = await pyodideReady;
  } catch {
    return; // load failure already reported above
  }

  outputUsed = 0;
  truncated = false;
  imagesThisRun = 0;
  const started = performance.now();
  try {
    pyodide.runPython(PREPARE_RUN_PY);

    // Fetch any Pyodide-built packages the code imports (numpy, pandas,
    // matplotlib, …) from the pinned CDN. Unknown imports are simply skipped
    // and fail later with a normal ImportError.
    post({ type: 'phase', phase: 'packages' });
    await pyodide.loadPackagesFromImports(msg.code, {
      messageCallback: (m) => post({ type: 'status', text: `${m}\n` }),
    });
    post({ type: 'phase', phase: 'exec' });

    const result = await pyodide.runPythonAsync(msg.code);
    relayImages(pyodide);
    // REPL nicety: echo the value of a trailing expression.
    if (result !== undefined) {
      emit('stdout', `${result}\n`);
      const proxy = result as { destroy?: () => void };
      if (proxy && typeof proxy.destroy === 'function') proxy.destroy();
    }
    post({ type: 'done', id: msg.id, ok: true, durationMs: performance.now() - started });
  } catch (err) {
    relayImages(pyodide);
    post({
      type: 'done',
      id: msg.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: performance.now() - started,
    });
  }
};
