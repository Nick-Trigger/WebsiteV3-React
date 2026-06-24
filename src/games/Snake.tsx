import { useCallback, useEffect, useRef, useState } from 'react';

const CELLS = 20; // grid is CELLS x CELLS
const CELL = 20; // px per cell (internal canvas resolution)
const SIZE = CELLS * CELL; // 400 x 400 internal; scaled to container via CSS
const SPEED = 110; // ms per tick
const BEST_KEY = 'snake-best';

type Pt = { x: number; y: number };
const eq = (a: Pt, b: Pt) => a.x === b.x && a.y === b.y;

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game state lives in refs so the interval reads fresh values
  // without re-subscribing on every render.
  const snake = useRef<Pt[]>([]);
  const dir = useRef<Pt>({ x: 1, y: 0 });
  const nextDir = useRef<Pt>({ x: 1, y: 0 });
  const food = useRef<Pt>({ x: 15, y: 10 });
  const scoreRef = useRef(0);
  const bestRef = useRef(0);

  // React state drives the visible HUD/overlay only.
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const spawnFood = (body: Pt[]): Pt => {
    let f: Pt;
    do {
      f = { x: Math.floor(Math.random() * CELLS), y: Math.floor(Math.random() * CELLS) };
    } while (body.some((s) => eq(s, f)));
    return f;
  };

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Board (self-contained palette so it reads the same in light/dark themes).
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < CELLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(SIZE, i * CELL);
      ctx.stroke();
    }

    const f = food.current;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(f.x * CELL + 2, f.y * CELL + 2, CELL - 4, CELL - 4);

    snake.current.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const reset = useCallback(() => {
    snake.current = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ];
    dir.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
    food.current = spawnFood(snake.current);
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    draw();
  }, [draw]);

  const turn = useCallback((x: number, y: number) => {
    // Block 180° reversals into the neck.
    const d = dir.current;
    if (d.x === -x && d.y === -y) return;
    nextDir.current = { x, y };
  }, []);

  const step = useCallback(() => {
    dir.current = nextDir.current;
    const d = dir.current;
    const head = snake.current[0];
    const nh = { x: head.x + d.x, y: head.y + d.y };

    const hitWall = nh.x < 0 || nh.y < 0 || nh.x >= CELLS || nh.y >= CELLS;
    const hitSelf = snake.current.some((s) => eq(s, nh));
    if (hitWall || hitSelf) {
      setRunning(false);
      setGameOver(true);
      if (scoreRef.current > bestRef.current) {
        bestRef.current = scoreRef.current;
        setBest(bestRef.current);
        try {
          localStorage.setItem(BEST_KEY, String(bestRef.current));
        } catch {
          /* storage unavailable — ignore */
        }
      }
      return;
    }

    const ate = eq(nh, food.current);
    const next = [nh, ...snake.current];
    if (ate) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      food.current = spawnFood(next);
    } else {
      next.pop();
    }
    snake.current = next;
    draw();
  }, [draw]);

  // Load best score and paint the initial idle board on mount.
  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(BEST_KEY) || '0');
      if (!Number.isNaN(stored)) {
        bestRef.current = stored;
        setBest(stored);
      }
    } catch {
      /* storage unavailable — ignore */
    }
    reset();
  }, [reset]);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') turn(0, -1);
      else if (k === 'arrowdown' || k === 's') turn(0, 1);
      else if (k === 'arrowleft' || k === 'a') turn(-1, 0);
      else if (k === 'arrowright' || k === 'd') turn(1, 0);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  // The game loop: runs only while `running` is true.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(step, SPEED);
    return () => window.clearInterval(id);
  }, [running, step]);

  const startOrRestart = () => {
    reset();
    setRunning(true);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-6 text-sm font-mono">
        <span>
          Score: <span className="text-primary font-bold">{score}</span>
        </span>
        <span>
          Best: <span className="text-secondary font-bold">{best}</span>
        </span>
      </div>

      <div className="relative w-full" style={{ maxWidth: SIZE }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="w-full rounded-xl border border-base-300 shadow-lg touch-none"
          style={{ imageRendering: 'pixelated', aspectRatio: '1 / 1' }}
        />
        {(!running || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 rounded-xl text-white">
            {gameOver && <p className="text-2xl font-bold">Game Over</p>}
            <button className="btn btn-primary btn-sm" onClick={startOrRestart}>
              {gameOver ? 'Play again' : 'Start'}
            </button>
          </div>
        )}
      </div>

      {/* Touch controls (mobile only). */}
      <div className="grid grid-cols-3 gap-2 w-40 sm:hidden">
        <span />
        <button className="btn btn-sm" onClick={() => turn(0, -1)} aria-label="Up">
          ▲
        </button>
        <span />
        <button className="btn btn-sm" onClick={() => turn(-1, 0)} aria-label="Left">
          ◀
        </button>
        <button className="btn btn-sm" onClick={() => turn(0, 1)} aria-label="Down">
          ▼
        </button>
        <button className="btn btn-sm" onClick={() => turn(1, 0)} aria-label="Right">
          ▶
        </button>
      </div>
    </div>
  );
}
