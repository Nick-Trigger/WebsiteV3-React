import { useEffect, useRef } from 'react';

const W = 416;
const H = 288; // 13:9, matches the card media box

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// rounded-rect path via arcTo (universally supported/typed)
const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// ---- Snake: random walk + food ---------------------------------------------
const snake: Draw = (ctx, w, h) => {
  const cols = 13;
  const rows = 9;
  const cw = w / cols;
  const ch = h / rows;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cw, 0);
    ctx.lineTo(i * cw, h);
    ctx.stroke();
  }
  for (let j = 1; j < rows; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * ch);
    ctx.lineTo(w, j * ch);
    ctx.stroke();
  }

  const key = (x: number, y: number) => y * cols + x;
  const occ = new Set<number>();
  const dirs: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  let x = ri(3, cols - 4);
  let y = ri(2, rows - 3);
  const body: [number, number][] = [[x, y]];
  occ.add(key(x, y));
  let d = pick(dirs);
  const len = ri(5, 9);
  for (let s = 0; s < len; s++) {
    const valid = dirs.filter(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !occ.has(key(nx, ny));
    });
    if (!valid.length) break;
    if (Math.random() < 0.35 || !valid.some(([dx, dy]) => dx === d[0] && dy === d[1])) d = pick(valid);
    x += d[0];
    y += d[1];
    body.push([x, y]);
    occ.add(key(x, y));
  }
  body.forEach(([bx, by], i) => {
    ctx.fillStyle = i === body.length - 1 ? '#4ade80' : '#22c55e';
    ctx.fillRect(bx * cw + 2, by * ch + 2, cw - 4, ch - 4);
  });

  let placed = 0;
  let tries = 0;
  const fr = Math.min(cw, ch) / 2 - 2;
  while (placed < ri(2, 3) && tries < 60) {
    tries++;
    const fx = ri(0, cols - 1);
    const fy = ri(0, rows - 1);
    if (occ.has(key(fx, fy))) continue;
    occ.add(key(fx, fy));
    placed++;
    const cx = fx * cw + cw / 2;
    const cy = fy * ch + ch / 2;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, cy, fr, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();
  }
};

// ---- 2048: random tiles ----------------------------------------------------
const TILE: Record<number, [string, string]> = {
  2: ['#fde68a', '#78350f'],
  4: ['#fcd34d', '#78350f'],
  8: ['#fdba74', '#7c2d12'],
  16: ['#fb923c', '#7c2d12'],
  32: ['#f97316', '#ffffff'],
  64: ['#ea580c', '#ffffff'],
  128: ['#facc15', '#713f12'],
  256: ['#eab308', '#ffffff'],
};
const VALUES = [2, 2, 4, 4, 8, 8, 16, 32, 64, 128, 256];

const g2048: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, w, h);
  const n = 4;
  const size = Math.min(w, h) - 24;
  const ox = (w - size) / 2;
  const oy = (h - size) / 2;
  const gap = 8;
  const cs = (size - gap * (n + 1)) / n;

  rr(ctx, ox, oy, size, size, 12);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = ox + gap + c * (cs + gap);
      const y = oy + gap + r * (cs + gap);
      if (Math.random() < 0.45) {
        rr(ctx, x, y, cs, cs, 6);
        ctx.fillStyle = 'rgba(148,163,184,0.18)';
        ctx.fill();
        continue;
      }
      const v = pick(VALUES);
      const [bg, fg] = TILE[v] ?? ['#ef4444', '#ffffff'];
      rr(ctx, x, y, cs, cs, 6);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.fillStyle = fg;
      ctx.font = `bold ${v < 100 ? cs * 0.42 : cs * 0.32}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(v), x + cs / 2, y + cs / 2 + 1);
    }
  }
};

// ---- Tower Defense: path + towers + face-enemies ---------------------------
const td: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, w, h);

  const pts: [number, number][] = (
    [
      [0, 0.25],
      [0.8, 0.25],
      [0.8, 0.55],
      [0.2, 0.55],
      [0.2, 0.82],
      [1, 0.82],
    ] as [number, number][]
  ).map(([fx, fy]) => [fx * w, fy * h]);

  const unit = Math.min(w, h);
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = unit * 0.09;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();

  const tcols = ['#fb923c', '#60a5fa', '#67e8f9'];
  const barrels = ['#7c2d12', '#1e3a8a', '#0e7490'];
  for (let i = 0; i < ri(2, 4); i++) {
    const tx = ri(w * 0.12, w * 0.88);
    const ty = pick([h * 0.12, h * 0.4, h * 0.68]);
    const k = ri(0, 2);
    ctx.beginPath();
    ctx.arc(tx, ty, unit * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = tcols[k];
    ctx.fill();
    const a = Math.random() * Math.PI * 2;
    ctx.strokeStyle = barrels[k];
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + Math.cos(a) * unit * 0.055, ty + Math.sin(a) * unit * 0.055);
    ctx.stroke();
  }

  const rings = ['#f87171', '#fbbf24', '#9ca3af', '#facc15', 'rgba(255,255,255,0.85)'];
  for (let i = 0; i < ri(2, 4); i++) {
    const seg = ri(0, pts.length - 2);
    const t = Math.random();
    const ex = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * t;
    const ey = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * t;
    const r = unit * 0.045;
    ctx.beginPath();
    ctx.arc(ex, ey, r, 0, Math.PI * 2);
    ctx.fillStyle = '#e8b48a';
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(ex - r * 0.35, ey - r * 0.1, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + r * 0.35, ey - r * 0.1, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = pick(rings);
    ctx.beginPath();
    ctx.arc(ex, ey, r, 0, Math.PI * 2);
    ctx.stroke();
  }
};

const fallback: Draw = (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#fb923c');
  g.addColorStop(1, '#7c2d12');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `bold ${h * 0.3}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', w / 2, h / 2);
};

const THUMBS: Record<string, Draw> = {
  snake,
  '2048': g2048,
  'tower-defense': td,
};

/**
 * A small canvas that paints a randomized scene from the given game. Drawing
 * runs in an effect (client-only), so it's safe under SSG and re-rolls a fresh
 * scene on each load.
 */
export default function GameThumbnail({ slug }: { slug: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    (THUMBS[slug] ?? fallback)(ctx, W, H);
  }, [slug]);

  return <canvas ref={ref} width={W} height={H} className="block w-full h-full" />;
}
