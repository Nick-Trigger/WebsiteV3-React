import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import GamePlayer from '../components/GamePlayer';

const PFP_SRC = '/pfp.jpg';
const SIZES = [3, 4, 5, 6] as const;
const GAP_PX = 4; // matches the `gap-1` (0.25rem) grid gap
const bestKey = (n: number) => `puzzle-best-${n}`;

const solved = (n: number) => Array.from({ length: n * n }, (_, i) => i);
const isSolved = (b: number[]) => b.every((v, i) => v === i);
const rc = (p: number, n: number) => [Math.floor(p / n), p % n] as const;
const adjacent = (a: number, b: number, n: number) => {
  const [ar, ac] = rc(a, n);
  const [br, bc] = rc(b, n);
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
};

// background-position for slice value v, given backgroundSize n*100%
const slicePos = (v: number, n: number) => {
  const [r, c] = rc(v, n);
  return `${(c / (n - 1)) * 100}% ${(r / (n - 1)) * 100}%`;
};

const scramble = (n: number): number[] => {
  const count = n * n;
  const blankTile = count - 1;
  const b = solved(n);
  let blank = blankTile;
  let prev = -1;
  const steps = count * 12;
  for (let i = 0; i < steps; i++) {
    const opts = Array.from({ length: count }, (_, p) => p).filter(
      (p) => adjacent(p, blank, n) && p !== prev,
    );
    const p = opts[Math.floor(Math.random() * opts.length)];
    [b[p], b[blank]] = [b[blank], b[p]];
    prev = blank;
    blank = p;
  }
  return isSolved(b) ? scramble(n) : b;
};

interface Drag {
  pos: number;
  axis: 'x' | 'y';
  dir: number;
  step: number;
  startX: number;
  startY: number;
  moved: boolean;
  offset: number;
}

export default function SlidingPuzzle() {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState<number[]>(() => solved(3));
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const bestRef = useRef(0);

  // Live drag state used for logic (ref) and rendering (state).
  const dragRef = useRef<Drag | null>(null);
  const [dragView, setDragView] = useState<Drag | null>(null);

  const count = size * size;
  const blankTile = count - 1;

  const loadBest = useCallback((n: number) => {
    let value = 0;
    try {
      const b = Number(localStorage.getItem(bestKey(n)) || '0');
      if (!Number.isNaN(b) && b > 0) value = b;
    } catch {
      /* ignore */
    }
    bestRef.current = value;
    setBest(value);
  }, []);

  const start = useCallback((n: number) => {
    dragRef.current = null;
    setDragView(null);
    setBoard(scramble(n));
    setMoves(0);
    setWon(false);
    setStarted(true);
  }, []);

  const newGame = useCallback(() => start(size), [start, size]);

  const changeSize = useCallback(
    (n: number) => {
      if (n === size && started) return;
      setSize(n);
      loadBest(n);
      start(n);
    },
    [size, started, loadBest, start],
  );

  // Swap the tile at `pos` into the blank slot (assumes it is adjacent).
  const applyMove = useCallback(
    (pos: number) => {
      setBoard((prev) => {
        const blank = prev.indexOf(blankTile);
        if (!adjacent(pos, blank, size)) return prev;
        const next = prev.slice();
        [next[pos], next[blank]] = [next[blank], next[pos]];
        setMoves((m) => {
          const nm = m + 1;
          if (isSolved(next)) {
            setWon(true);
            if (bestRef.current === 0 || nm < bestRef.current) {
              bestRef.current = nm;
              setBest(nm);
              try {
                localStorage.setItem(bestKey(size), String(nm));
              } catch {
                /* ignore */
              }
            }
          }
          return nm;
        });
        return next;
      });
    },
    [size, blankTile],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>, pos: number) => {
    if (won || !started) return;
    if (board[pos] === blankTile) return;
    const blank = board.indexOf(blankTile);
    if (!adjacent(pos, blank, size)) return;

    const [pr, pc] = rc(pos, size);
    const [br, bc] = rc(blank, size);
    const axis: 'x' | 'y' = pr === br ? 'x' : 'y';
    const dir = axis === 'x' ? Math.sign(bc - pc) : Math.sign(br - pr);
    const rect = e.currentTarget.getBoundingClientRect();
    const step = (axis === 'x' ? rect.width : rect.height) + GAP_PX;

    e.currentTarget.setPointerCapture(e.pointerId);
    const d: Drag = {
      pos,
      axis,
      dir,
      step,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      offset: 0,
    };
    dragRef.current = d;
    setDragView(d);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const delta = d.axis === 'x' ? e.clientX - d.startX : e.clientY - d.startY;
    if (Math.abs(delta) > 4) d.moved = true;
    d.offset = Math.max(0, Math.min(delta * d.dir, d.step));
    setDragView({ ...d });
  };

  const endDrag = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDragView(null);
    if (!d) return;
    // A tap (no meaningful movement) or a drag past the halfway point commits.
    if (!d.moved || d.offset >= d.step / 2) applyMove(d.pos);
  };

  useEffect(() => {
    loadBest(3);
    start(3);
  }, [loadBest, start]);

  return (
    <GamePlayer
      stats={[
        { label: 'Moves', value: moves, valueClassName: 'text-primary' },
        { label: 'Best', value: best || '—', valueClassName: 'text-secondary' },
      ]}
      screenMaxWidth={400}
      controls={
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1">
            {SIZES.map((n) => (
              <button
                key={n}
                type="button"
                className={`btn btn-xs ${n === size ? 'btn-primary' : 'btn-ghost bg-orange-400 text-black'}`}
                onClick={() => changeSize(n)}
              >
                {n}×{n}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={newGame}>
            New game
          </button>
        </div>
      }
    >
      <div className="relative w-full aspect-square rounded-xl bg-slate-900 border border-base-300 shadow-lg p-2">
        <div
          className="grid gap-1 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {board.map((v, pos) => {
            const dragging = dragView && dragView.pos === pos;
            const transform = dragging
              ? dragView.axis === 'x'
                ? `translateX(${dragView.dir * dragView.offset}px)`
                : `translateY(${dragView.dir * dragView.offset}px)`
              : undefined;
            return (
              <button
                key={pos}
                type="button"
                onPointerDown={(e) => onPointerDown(e, pos)}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={`relative rounded-md overflow-hidden ${
                  v === blankTile ? 'bg-slate-800/40' : 'cursor-pointer'
                }`}
                aria-label={v === blankTile ? 'empty' : `tile ${v + 1}`}
                style={{
                  touchAction: 'none',
                  transform,
                  zIndex: dragging ? 5 : undefined,
                  transition: dragging ? 'none' : 'transform 120ms ease-out',
                  ...(v === blankTile
                    ? {}
                    : {
                        backgroundImage: `url(${PFP_SRC})`,
                        backgroundSize: `${size * 100}% ${size * 100}%`,
                        backgroundPosition: slicePos(v, size),
                      }),
                }}
              >
                {v !== blankTile && (
                  <span className="absolute top-0.5 left-1 text-[11px] font-bold text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                    {v + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {won && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 rounded-xl text-white">
            <p className="text-2xl font-bold">Solved in {moves}!</p>
            <button className="btn btn-primary btn-sm" onClick={newGame}>
              Play again
            </button>
          </div>
        )}
      </div>
    </GamePlayer>
  );
}
