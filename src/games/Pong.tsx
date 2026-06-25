import { useCallback, useEffect, useRef, useState } from 'react';
import GamePlayer from '../components/GamePlayer';

const W = 440;
const H = 300;
const MS = 1000 / 60;
const PW = 10;
const PH = 62;
const MARGIN = 16;
const BALL_R = 7;
const WIN = 7;
const PLAYER_SPEED = 6;
const AI_SPEED = 3.5;
const BASE = 4;

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerY = useRef(H / 2);
  const aiY = useRef(H / 2);
  const ball = useRef({ x: W / 2, y: H / 2, vx: BASE, vy: BASE * 0.5 });
  const moveDir = useRef(0);
  const pRef = useRef(0);
  const aRef = useRef(0);

  const [pScore, setPScore] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [youWin, setYouWin] = useState(false);

  const serve = (toLeft: boolean) => {
    ball.current = { x: W / 2, y: H / 2, vx: toLeft ? -BASE : BASE, vy: (Math.random() * 2 - 1) * BASE * 0.6 };
  };

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#4ade80';
    ctx.fillRect(MARGIN, playerY.current - PH / 2, PW, PH);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(W - MARGIN - PW, aiY.current - PH / 2, PW, PH);

    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
  }, []);

  const reset = useCallback(() => {
    pRef.current = 0;
    aRef.current = 0;
    setPScore(0);
    setAScore(0);
    setOver(false);
    setYouWin(false);
    playerY.current = H / 2;
    aiY.current = H / 2;
    serve(Math.random() < 0.5);
    draw();
  }, [draw]);

  const tick = useCallback(() => {
    if (moveDir.current) playerY.current += moveDir.current * PLAYER_SPEED;
    playerY.current = Math.max(PH / 2, Math.min(H - PH / 2, playerY.current));

    // AI tracks the ball with a capped speed
    const target = ball.current.y;
    if (Math.abs(target - aiY.current) > 6) aiY.current += Math.sign(target - aiY.current) * AI_SPEED;
    aiY.current = Math.max(PH / 2, Math.min(H - PH / 2, aiY.current));

    const b = ball.current;
    b.x += b.vx;
    b.y += b.vy;
    if (b.y - BALL_R < 0) {
      b.y = BALL_R;
      b.vy = Math.abs(b.vy);
    }
    if (b.y + BALL_R > H) {
      b.y = H - BALL_R;
      b.vy = -Math.abs(b.vy);
    }

    // player paddle
    if (b.vx < 0 && b.x - BALL_R <= MARGIN + PW && b.x - BALL_R >= MARGIN - 4 && Math.abs(b.y - playerY.current) <= PH / 2 + BALL_R) {
      const off = (b.y - playerY.current) / (PH / 2);
      const speed = Math.hypot(b.vx, b.vy) * 1.05;
      b.vx = Math.abs(speed * Math.cos(off * 0.9));
      b.vy = speed * Math.sin(off * 0.9);
      b.x = MARGIN + PW + BALL_R;
    }
    // ai paddle
    if (b.vx > 0 && b.x + BALL_R >= W - MARGIN - PW && b.x + BALL_R <= W - MARGIN + 4 && Math.abs(b.y - aiY.current) <= PH / 2 + BALL_R) {
      const off = (b.y - aiY.current) / (PH / 2);
      const speed = Math.hypot(b.vx, b.vy) * 1.05;
      b.vx = -Math.abs(speed * Math.cos(off * 0.9));
      b.vy = speed * Math.sin(off * 0.9);
      b.x = W - MARGIN - PW - BALL_R;
    }

    const finish = (youWon: boolean) => {
      setRunning(false);
      setOver(true);
      setYouWin(youWon);
    };

    if (b.x < -BALL_R) {
      aRef.current += 1;
      setAScore(aRef.current);
      if (aRef.current >= WIN) finish(false);
      else serve(false);
    } else if (b.x > W + BALL_R) {
      pRef.current += 1;
      setPScore(pRef.current);
      if (pRef.current >= WIN) finish(true);
      else serve(true);
    }

    draw();
  }, [draw]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') moveDir.current = -1;
      else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') moveDir.current = 1;
    };
    const up = (e: KeyboardEvent) => {
      if (['arrowup', 'arrowdown', 'w', 's'].includes(e.key.toLowerCase())) moveDir.current = 0;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    if (!running || over) return;
    const id = window.setInterval(tick, MS);
    return () => window.clearInterval(id);
  }, [running, over, tick]);

  const movePointer = (clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    playerY.current = Math.max(PH / 2, Math.min(H - PH / 2, (clientY - rect.top) * (H / rect.height)));
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
        { label: 'You', value: pScore, valueClassName: 'text-success' },
        { label: 'CPU', value: aScore, valueClassName: 'text-error' },
      ]}
      screenMaxWidth={W}
      controls={
        <div className="flex gap-3">
          <button type="button" className="btn btn-circle" aria-label="Up" {...hold(-1)}>
            ⮝
          </button>
          <button type="button" className="btn btn-circle" aria-label="Down" {...hold(1)}>
            ⮟
          </button>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerMove={(e) => movePointer(e.clientY)}
        className="w-full rounded-xl border border-base-300 shadow-lg touch-none cursor-pointer"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      {(!running || over) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 rounded-xl text-white">
          {over && <p className="text-2xl font-bold">{youWin ? 'You win!' : 'CPU wins'}</p>}
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
