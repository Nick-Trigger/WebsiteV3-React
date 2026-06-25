import { useCallback, useEffect, useRef, useState } from 'react';
import GamePlayer from '../components/GamePlayer';

const W = 400;
const H = 400;
const MS = 1000 / 60;
const GRAV = 0.5;
const FLAP = -7.6;
const PIPE_W = 58;
const GAP = 138;
const PIPE_SPEED = 2.4;
const PIPE_INTERVAL = 95;
const BIRD_X = 110;
const BIRD_R = 16;
const GROUND = 20;
const PFP_SRC = '/pfp.jpg';
const BEST_KEY = 'flappy-best';

type Pipe = { x: number; gapY: number; passed: boolean };

export default function Flappy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pfp = useRef<HTMLImageElement | null>(null);
  const y = useRef(H / 2);
  const vy = useRef(0);
  const pipes = useRef<Pipe[]>([]);
  const frame = useRef(0);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#16a34a';
    pipes.current.forEach((p) => {
      ctx.fillRect(p.x, 0, PIPE_W, p.gapY - GAP / 2);
      ctx.fillRect(p.x, p.gapY + GAP / 2, PIPE_W, H - (p.gapY + GAP / 2));
    });
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(0, H - GROUND, W, GROUND);

    const by = y.current;
    ctx.save();
    ctx.beginPath();
    ctx.arc(BIRD_X, by, BIRD_R, 0, Math.PI * 2);
    ctx.clip();
    const img = pfp.current;
    if (img && img.complete && img.naturalWidth) {
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, BIRD_X - BIRD_R, by - BIRD_R, BIRD_R * 2, BIRD_R * 2);
    } else {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(BIRD_X - BIRD_R, by - BIRD_R, BIRD_R * 2, BIRD_R * 2);
    }
    ctx.restore();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(BIRD_X, by, BIRD_R, 0, Math.PI * 2);
    ctx.stroke();
  }, []);

  const reset = useCallback(() => {
    y.current = H / 2;
    vy.current = 0;
    pipes.current = [];
    frame.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setOver(false);
    draw();
  }, [draw]);

  const end = useCallback(() => {
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
  }, []);

  const flap = useCallback(() => {
    if (over) return;
    if (!running) setRunning(true);
    vy.current = FLAP;
  }, [over, running]);

  const tick = useCallback(() => {
    frame.current += 1;
    vy.current += GRAV;
    y.current += vy.current;

    if (frame.current % PIPE_INTERVAL === 0) {
      pipes.current.push({ x: W, gapY: 70 + Math.random() * (H - 160), passed: false });
    }
    pipes.current.forEach((p) => (p.x -= PIPE_SPEED));
    pipes.current = pipes.current.filter((p) => p.x + PIPE_W > 0);

    for (const p of pipes.current) {
      if (!p.passed && p.x + PIPE_W < BIRD_X) {
        p.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
      if (BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W) {
        if (y.current - BIRD_R < p.gapY - GAP / 2 || y.current + BIRD_R > p.gapY + GAP / 2) end();
      }
    }
    if (y.current + BIRD_R > H - GROUND || y.current - BIRD_R < 0) end();
    draw();
  }, [draw, end]);

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  useEffect(() => {
    if (!running || over) return;
    const id = window.setInterval(tick, MS);
    return () => window.clearInterval(id);
  }, [running, over, tick]);

  return (
    <GamePlayer
      stats={[
        { label: 'Score', value: score, valueClassName: 'text-primary' },
        { label: 'Best', value: best, valueClassName: 'text-secondary' },
      ]}
      screenMaxWidth={W}
      controls={<p className="text-xs text-center text-base-100 max-w-[260px]">Tap the screen, or press Space / ↑ to flap</p>}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={() => (over ? reset() : flap())}
        className="w-full rounded-xl border border-base-300 shadow-lg touch-none cursor-pointer"
        style={{ aspectRatio: '1 / 1' }}
      />
      {(!running || over) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 rounded-xl text-white">
          {over && <p className="text-2xl font-bold">Game Over</p>}
          <button className="btn btn-primary btn-sm" onClick={() => (over ? reset() : flap())}>
            {over ? 'Play again' : 'Tap to start'}
          </button>
        </div>
      )}
    </GamePlayer>
  );
}
