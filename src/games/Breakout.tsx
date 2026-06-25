import { useCallback, useEffect, useRef, useState } from 'react';
import GamePlayer from '../components/GamePlayer';

const W = 400;
const H = 440;
const MS = 1000 / 60;
const COLS = 7;
const ROWS = 5;
const PAD = 16;
const GRID_Y = 44;
const BRICK_H = 24;
const PADDLE_W = 74;
const PADDLE_H = 12;
const PADDLE_Y = H - 26;
const BALL_R = 7;
const BASE_SPEED = 3.3;
const PFP_SRC = '/pfp.jpg';
const BEST_KEY = 'breakout-best';

const brickW = (W - PAD * 2) / COLS;
const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pfp = useRef<HTMLImageElement | null>(null);
  const bricks = useRef<boolean[]>([]);
  const ball = useRef({ x: W / 2, y: PADDLE_Y - 20, vx: BASE_SPEED, vy: -BASE_SPEED });
  const paddleX = useRef(W / 2);
  const moveDir = useRef(0);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const livesRef = useRef(3);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);

  const drawBrickSlice = (ctx: CanvasRenderingContext2D, r: number, c: number, x: number, yy: number) => {
    const img = pfp.current;
    if (img && img.complete && img.naturalWidth) {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const ox = (img.naturalWidth - side) / 2;
      const oy = (img.naturalHeight - side) / 2;
      ctx.drawImage(img, ox + (c / COLS) * side, oy + (r / ROWS) * side, side / COLS, side / ROWS, x, yy, brickW, BRICK_H);
    }
  };

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = PAD + c * brickW;
        const yy = GRID_Y + r * BRICK_H;
        if (bricks.current[r * COLS + c]) {
          ctx.fillStyle = BRICK_COLORS[r % BRICK_COLORS.length];
          ctx.fillRect(x + 1, yy + 1, brickW - 2, BRICK_H - 2);
        } else {
          drawBrickSlice(ctx, r, c, x, yy); // reveal the face beneath
        }
      }
    }

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(paddleX.current - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H);
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
  }, []);

  const resetBall = () => {
    ball.current = { x: paddleX.current, y: PADDLE_Y - 20, vx: BASE_SPEED * (Math.random() < 0.5 ? 1 : -1), vy: -BASE_SPEED };
  };

  const reset = useCallback(() => {
    bricks.current = Array(ROWS * COLS).fill(true);
    paddleX.current = W / 2;
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setOver(false);
    setWon(false);
    resetBall();
    draw();
  }, [draw]);

  const tick = useCallback(() => {
    if (moveDir.current) paddleX.current += moveDir.current * 6;
    paddleX.current = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, paddleX.current));

    const b = ball.current;
    b.x += b.vx;
    b.y += b.vy;

    if (b.x - BALL_R < 0) {
      b.x = BALL_R;
      b.vx = Math.abs(b.vx);
    }
    if (b.x + BALL_R > W) {
      b.x = W - BALL_R;
      b.vx = -Math.abs(b.vx);
    }
    if (b.y - BALL_R < 0) {
      b.y = BALL_R;
      b.vy = Math.abs(b.vy);
    }

    // paddle
    if (b.vy > 0 && b.y + BALL_R >= PADDLE_Y && b.y + BALL_R <= PADDLE_Y + PADDLE_H + 6 && Math.abs(b.x - paddleX.current) <= PADDLE_W / 2 + BALL_R) {
      const off = (b.x - paddleX.current) / (PADDLE_W / 2); // -1..1
      const speed = Math.hypot(b.vx, b.vy) * 1.02;
      const ang = off * 1.05; // up to ~60deg
      b.vx = speed * Math.sin(ang);
      b.vy = -Math.abs(speed * Math.cos(ang));
      b.y = PADDLE_Y - BALL_R;
    }

    // bricks
    if (b.y - BALL_R < GRID_Y + ROWS * BRICK_H && b.y + BALL_R > GRID_Y) {
      const c = Math.floor((b.x - PAD) / brickW);
      const r = Math.floor((b.y - GRID_Y) / BRICK_H);
      if (c >= 0 && c < COLS && r >= 0 && r < ROWS && bricks.current[r * COLS + c]) {
        bricks.current[r * COLS + c] = false;
        b.vy = -b.vy;
        scoreRef.current += 10;
        setScore(scoreRef.current);
        if (bricks.current.every((x) => !x)) {
          setRunning(false);
          setWon(true);
          setOver(true);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            setBest(bestRef.current);
            try {
              localStorage.setItem(BEST_KEY, String(bestRef.current));
            } catch {
              /* ignore */
            }
          }
        }
      }
    }

    // miss
    if (b.y - BALL_R > H) {
      livesRef.current -= 1;
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        setRunning(false);
        setOver(true);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBest(bestRef.current);
          try {
            localStorage.setItem(BEST_KEY, String(bestRef.current));
          } catch {
            /* ignore */
          }
        }
      } else {
        resetBall();
      }
    }

    draw();
  }, [draw]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      pfp.current = img;
      draw();
    };
    img.src = PFP_SRC;
    try {
      const b = Number(localStorage.getItem(BEST_KEY) || '0');
      if (!Number.isNaN(b)) {
        bestRef.current = b;
        setBest(b);
      }
    } catch {
      /* ignore */
    }
    reset();
  }, [draw, reset]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') moveDir.current = -1;
      else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') moveDir.current = 1;
    };
    const upK = (e: KeyboardEvent) => {
      if (['arrowleft', 'arrowright', 'a', 'd'].includes(e.key.toLowerCase())) moveDir.current = 0;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', upK);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', upK);
    };
  }, []);

  useEffect(() => {
    if (!running || over) return;
    const id = window.setInterval(tick, MS);
    return () => window.clearInterval(id);
  }, [running, over, tick]);

  const movePointer = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    paddleX.current = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, (clientX - rect.left) * (W / rect.width)));
    if (!running && !over) draw();
  };

  const hold = (dir: number) => ({
    onPointerDown: () => {
      moveDir.current = dir;
    },
    onPointerUp: () => {
      moveDir.current = 0;
    },
    onPointerLeave: () => {
      moveDir.current = 0;
    },
  });

  return (
    <GamePlayer
      stats={[
        { label: 'Score', value: score, valueClassName: 'text-primary' },
        { label: 'Lives', value: lives, valueClassName: 'text-error' },
        { label: 'Best', value: best, valueClassName: 'text-secondary' },
      ]}
      screenMaxWidth={W}
      controls={
        <div className="flex gap-3">
          <button type="button" className="btn btn-circle btn-xl" aria-label="Left" {...hold(-1)}>
            &larr;
          </button>
          <button type="button" className="btn btn-circle btn-xl" aria-label="Right" {...hold(1)}>
            &rarr;
          </button>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerMove={(e) => movePointer(e.clientX)}
        className="w-full rounded-xl border border-base-300 shadow-lg touch-none cursor-pointer"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      {(!running || over) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 rounded-xl text-white">
          {over && <p className="text-2xl font-bold">{won ? 'You cleared it!' : 'Game Over'}</p>}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (over) reset();
              setRunning(true);
            }}
          >
            {over ? 'Play again' : 'Start'}
          </button>
        </div>
      )}
    </GamePlayer>
  );
}
