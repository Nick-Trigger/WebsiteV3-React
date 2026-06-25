import { useCallback, useEffect, useRef, useState } from 'react';
import GamePlayer from '../components/GamePlayer';
import DPad from '../components/DPad';

const N = 4;
const BEST_KEY = '2048-best';
const ANIM_MS = 110; // slide duration; phase-2 commit waits this long

type Grid = number[][];
type Dir = 'left' | 'right' | 'up' | 'down';

type Tile = {
  id: number;
  r: number;
  c: number;
  value: number;
  isNew?: boolean; // just spawned -> appear pop
  merged?: boolean; // absorbed a merge this commit -> bump pop
  consumed?: boolean; // transient: slides into the survivor, then removed
  doubled?: boolean; // transient: survivor that doubles at commit
};

let tileId = 0;
const nextId = () => ++tileId;

const empty = (): Grid => Array.from({ length: N }, () => Array<number>(N).fill(0));
const toGrid = (tiles: Tile[]): Grid => {
  const g = empty();
  tiles.forEach((t) => {
    g[t.r][t.c] = t.value;
  });
  return g;
};

const hasMoves = (g: Grid): boolean => {
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (g[r][c] === 0) return true;
      if (c < N - 1 && g[r][c] === g[r][c + 1]) return true;
      if (r < N - 1 && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
};

// Cells of line `i`, ordered from the edge the tiles move toward (index 0 = front).
const lineCoords = (dir: Dir, i: number): [number, number][] => {
  const coords: [number, number][] = [];
  for (let k = 0; k < N; k++) {
    if (dir === 'left') coords.push([i, k]);
    else if (dir === 'right') coords.push([i, N - 1 - k]);
    else if (dir === 'up') coords.push([k, i]);
    else coords.push([N - 1 - k, i]);
  }
  return coords;
};

const spawnTile = (tiles: Tile[]): Tile | null => {
  const occupied = new Set(tiles.map((t) => t.r * N + t.c));
  const free: number[] = [];
  for (let i = 0; i < N * N; i++) if (!occupied.has(i)) free.push(i);
  if (!free.length) return null;
  const cell = free[Math.floor(Math.random() * free.length)];
  return {
    id: nextId(),
    r: Math.floor(cell / N),
    c: cell % N,
    value: Math.random() < 0.9 ? 2 : 4,
    isNew: true,
  };
};

// Repositions every tile to its post-slide cell (keeping ids + pre-merge values
// so the slide reads correctly). Survivors that absorb a merge are flagged
// `doubled`; absorbed tiles are flagged `consumed`. Returns whether anything
// moved and the points the merges are worth.
const computeMove = (tiles: Tile[], dir: Dir) => {
  const at = new Map<number, Tile>();
  tiles.forEach((t) => at.set(t.r * N + t.c, t));

  const slid: Tile[] = [];
  let moved = false;
  let gained = 0;

  for (let i = 0; i < N; i++) {
    const coords = lineCoords(dir, i);
    const line = coords
      .map(([r, c]) => at.get(r * N + c))
      .filter((t): t is Tile => Boolean(t));

    let target = 0;
    let survivor: Tile | null = null;
    let canMerge = false;

    for (const tile of line) {
      if (survivor && canMerge && survivor.value === tile.value) {
        const [sr, sc] = coords[target - 1];
        slid.push({ ...tile, r: sr, c: sc, consumed: true });
        survivor.doubled = true;
        gained += survivor.value * 2;
        canMerge = false; // one merge per slot
        moved = true;
      } else {
        const [tr, tc] = coords[target];
        if (tr !== tile.r || tc !== tile.c) moved = true;
        const placed: Tile = { ...tile, r: tr, c: tc };
        slid.push(placed);
        survivor = placed;
        canMerge = true;
        target++;
      }
    }
  }
  return { slid, moved, gained };
};

const TILE: Record<number, string> = {
  2: 'bg-amber-100 text-amber-900',
  4: 'bg-amber-200 text-amber-900',
  8: 'bg-orange-300 text-orange-950',
  16: 'bg-orange-400 text-orange-950',
  32: 'bg-orange-500 text-white',
  64: 'bg-orange-600 text-white',
  128: 'bg-yellow-400 text-yellow-950',
  256: 'bg-yellow-500 text-yellow-950',
  512: 'bg-yellow-600 text-white',
  1024: 'bg-red-500 text-white',
  2048: 'bg-red-600 text-white',
};
const tileClass = (v: number) => TILE[v] ?? 'bg-red-700 text-white';
const fontFor = (v: number) => (v < 100 ? 'text-3xl' : v < 1000 ? 'text-2xl' : 'text-xl');
const xform = (r: number, c: number) => `translate(${c * 100}%, ${r * 100}%)`;

export default function Game2048() {
  const tilesRef = useRef<Tile[]>([]);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const overRef = useRef(false);
  const wonRef = useRef(false);
  const animatingRef = useRef(false);
  const elById = useRef<Map<number, HTMLDivElement>>(new Map());

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [moveSeq, setMoveSeq] = useState(0); // bumps on every commit -> drives pops

  const setEl = (id: number) => (el: HTMLDivElement | null) => {
    if (el) elById.current.set(id, el);
    else elById.current.delete(id);
  };

  const start = useCallback(() => {
    const a = spawnTile([]);
    const b = a ? spawnTile([a]) : null;
    const init = [a, b].filter((t): t is Tile => Boolean(t));
    tilesRef.current = init;
    setTiles(init);
    scoreRef.current = 0;
    setScore(0);
    overRef.current = false;
    setOver(false);
    wonRef.current = false;
    setWon(false);
    animatingRef.current = false;
    setMoveSeq((s) => s + 1);
  }, []);

  const apply = useCallback((dir: Dir) => {
    if (animatingRef.current || overRef.current) return;
    const { slid, moved, gained } = computeMove(tilesRef.current, dir);
    if (!moved) return;

    animatingRef.current = true;
    setTiles(slid); // phase 1: animate the slide

    window.setTimeout(() => {
      // phase 2: drop consumed tiles, apply doubles, spawn, score/win/over.
      const survivors: Tile[] = slid
        .filter((t) => !t.consumed)
        .map((t) => ({
          id: t.id,
          r: t.r,
          c: t.c,
          value: t.doubled ? t.value * 2 : t.value,
          merged: t.doubled ? true : undefined,
        }));
      const spawn = spawnTile(survivors);
      const next = spawn ? [...survivors, spawn] : survivors;

      tilesRef.current = next;
      setTiles(next);
      setMoveSeq((s) => s + 1);

      if (gained) {
        scoreRef.current += gained;
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBest(bestRef.current);
          try {
            localStorage.setItem(BEST_KEY, String(bestRef.current));
          } catch {
            /* storage unavailable — ignore */
          }
        }
      }

      if (!wonRef.current && next.some((t) => t.value >= 2048)) {
        wonRef.current = true;
        setWon(true);
      }
      if (!hasMoves(toGrid(next))) {
        overRef.current = true;
        setOver(true);
      }

      animatingRef.current = false;
    }, ANIM_MS);
  }, []);

  // Load best and deal the opening tiles.
  useEffect(() => {
    try {
      const b = Number(localStorage.getItem(BEST_KEY) || '0');
      if (!Number.isNaN(b)) {
        bestRef.current = b;
        setBest(b);
      }
    } catch {
      /* storage unavailable — ignore */
    }
    start();
  }, [start]);

  // Pop newly spawned and freshly merged tiles after each commit.
  useEffect(() => {
    tilesRef.current.forEach((t) => {
      const el = elById.current.get(t.id);
      if (!el) return;
      if (t.isNew) {
        el.animate(
          [
            { transform: 'scale(0.3)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 },
          ],
          { duration: 120, easing: 'ease-out' },
        );
      } else if (t.merged) {
        el.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
          { duration: 160, easing: 'ease-out' },
        );
      }
    });
  }, [moveSeq]);

  // Keyboard controls (R starts a new game).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') apply('up');
      else if (k === 'arrowdown' || k === 's') apply('down');
      else if (k === 'arrowleft' || k === 'a') apply('left');
      else if (k === 'arrowright' || k === 'd') apply('right');
      else if (k === 'r') start();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [apply, start]);

  return (
    <GamePlayer
      stats={[
        { label: 'Score', value: score, valueClassName: 'text-primary' },
        { label: 'Best', value: best, valueClassName: 'text-secondary' },
      ]}
      controls={
        <DPad
          onUp={() => apply('up')}
          onDown={() => apply('down')}
          onLeft={() => apply('left')}
          onRight={() => apply('right')}
        />
      }
    >
      <div className="relative w-full aspect-square rounded-xl bg-slate-900 border border-base-300 shadow-lg p-2 touch-none select-none">
        <div className="relative w-full h-full">
          {/* static background slots */}
          {Array.from({ length: N * N }).map((_, k) => (
            <div
              key={`slot-${k}`}
              className="absolute top-0 left-0 w-1/4 h-1/4 p-1"
              style={{ transform: xform(Math.floor(k / N), k % N) }}
            >
              <div className="w-full h-full rounded-md bg-slate-800/60" />
            </div>
          ))}

          {/* moving tiles */}
          {tiles.map((t) => (
            <div
              key={t.id}
              className="absolute top-0 left-0 w-1/4 h-1/4 p-1"
              style={{ transform: xform(t.r, t.c), transition: `transform ${ANIM_MS}ms ease-in-out` }}
            >
              <div
                ref={setEl(t.id)}
                className={`w-full h-full rounded-md flex items-center justify-center font-bold tabular-nums ${fontFor(t.value)} ${tileClass(t.value)}`}
              >
                {t.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {(over || won) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 rounded-xl text-white">
          <p className="text-2xl font-bold">{over ? 'Game Over' : 'You win!'}</p>
          <button className="btn btn-primary btn-sm" onClick={start}>
            {over ? 'Play again' : 'New game'}
          </button>
          {won && !over && (
            <button className="btn btn-ghost btn-sm" onClick={() => setWon(false)}>
              Keep going
            </button>
          )}
        </div>
      )}
    </GamePlayer>
  );
}
