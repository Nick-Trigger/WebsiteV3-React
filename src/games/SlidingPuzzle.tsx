import { useCallback, useEffect, useRef, useState } from 'react';
import GamePlayer from '../components/GamePlayer';

const N = 3;
const COUNT = N * N;
const BLANK = COUNT - 1;
const PFP_SRC = '/pfp.jpg';
const BEST_KEY = 'puzzle-best';

const solved = () => Array.from({ length: COUNT }, (_, i) => i);
const isSolved = (b: number[]) => b.every((v, i) => v === i);
const rc = (p: number) => [Math.floor(p / N), p % N] as const;
const adjacent = (a: number, b: number) => {
  const [ar, ac] = rc(a);
  const [br, bc] = rc(b);
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
};

// background-position for slice value v, given backgroundSize N*100%
const slicePos = (v: number) => {
  const [r, c] = rc(v);
  return `${(c / (N - 1)) * 100}% ${(r / (N - 1)) * 100}%`;
};

const scramble = (): number[] => {
  const b = solved();
  let blank = BLANK;
  let prev = -1;
  for (let i = 0; i < 80; i++) {
    const opts = Array.from({ length: COUNT }, (_, p) => p).filter((p) => adjacent(p, blank) && p !== prev);
    const p = opts[Math.floor(Math.random() * opts.length)];
    [b[p], b[blank]] = [b[blank], b[p]];
    prev = blank;
    blank = p;
  }
  return isSolved(b) ? scramble() : b;
};

export default function SlidingPuzzle() {
  const [board, setBoard] = useState<number[]>(solved);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const bestRef = useRef(0);

  const newGame = useCallback(() => {
    setBoard(scramble());
    setMoves(0);
    setWon(false);
    setStarted(true);
  }, []);

  const tap = (pos: number) => {
    if (won || !started) return;
    const blank = board.indexOf(BLANK);
    if (!adjacent(pos, blank)) return;
    const next = board.slice();
    [next[pos], next[blank]] = [next[blank], next[pos]];
    setBoard(next);
    const m = moves + 1;
    setMoves(m);
    if (isSolved(next)) {
      setWon(true);
      if (bestRef.current === 0 || m < bestRef.current) {
        bestRef.current = m;
        setBest(m);
        try {
          localStorage.setItem(BEST_KEY, String(m));
        } catch {
          /* ignore */
        }
      }
    }
  };

  useEffect(() => {
    try {
      const b = Number(localStorage.getItem(BEST_KEY) || '0');
      if (!Number.isNaN(b) && b > 0) {
        bestRef.current = b;
        setBest(b);
      }
    } catch {
      /* ignore */
    }
    newGame();
  }, [newGame]);

  return (
    <GamePlayer
      stats={[
        { label: 'Moves', value: moves, valueClassName: 'text-primary' },
        { label: 'Best', value: best || '—', valueClassName: 'text-secondary' },
      ]}
      screenMaxWidth={400}
      controls={
        <button type="button" className="btn btn-primary btn-sm" onClick={newGame}>
          New game
        </button>
      }
    >
      <div className="relative w-full aspect-square rounded-xl bg-slate-900 border border-base-300 shadow-lg p-2">
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
          {board.map((v, pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => tap(pos)}
              className={`relative rounded-md overflow-hidden ${v === BLANK ? 'bg-slate-800/40' : 'cursor-pointer'}`}
              aria-label={v === BLANK ? 'empty' : `tile ${v + 1}`}
              style={
                v === BLANK
                  ? undefined
                  : {
                      backgroundImage: `url(${PFP_SRC})`,
                      backgroundSize: `${N * 100}% ${N * 100}%`,
                      backgroundPosition: slicePos(v),
                    }
              }
            >
              {v !== BLANK && (
                <span className="absolute top-0.5 left-1 text-[11px] font-bold text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                  {v + 1}
                </span>
              )}
            </button>
          ))}
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
