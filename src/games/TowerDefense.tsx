import { useCallback, useEffect, useRef, useState } from 'react';
import GamePlayer from '../components/GamePlayer';

const GRID = 12;
const CELL = 30;
const SIZE = GRID * CELL; // 360
const FPS = 60;
const MS = 1000 / FPS;
const PFP_SRC = '/pfp.jpg';

const START_LIVES = 20;
const START_CASH = 150;
const KILL_REWARD = 9;
const WAVE_BONUS = 30;
const SHOT_SPEED = 7;
const SELL_RATE = 0.7;
const MAX_LEVEL = 3;

type TowerKind = 'gun' | 'sniper' | 'frost';
const KINDS: TowerKind[] = ['gun', 'sniper', 'frost'];

interface TowerDef {
  name: string;
  cost: number;
  color: string;
  barrel: string;
  range: number;
  cd: number; // frames between shots
  dmg: number;
  slow?: number; // movement multiplier applied to hit enemies
  slowFrames?: number;
}

const TOWER_DEFS: Record<TowerKind, TowerDef> = {
  gun: { name: 'Gun', cost: 50, color: '#fb923c', barrel: '#7c2d12', range: CELL * 2.4, cd: 28, dmg: 14 },
  sniper: { name: 'Sniper', cost: 100, color: '#60a5fa', barrel: '#1e3a8a', range: CELL * 4.2, cd: 72, dmg: 60 },
  frost: { name: 'Frost', cost: 75, color: '#67e8f9', barrel: '#0e7490', range: CELL * 2.2, cd: 42, dmg: 6, slow: 0.45, slowFrames: 90 },
};

// Effective stats grow with level.
const effective = (kind: TowerKind, level: number) => {
  const d = TOWER_DEFS[kind];
  return {
    range: d.range + (level - 1) * CELL * 0.4,
    cd: Math.round(d.cd * Math.pow(0.85, level - 1)),
    dmg: Math.round(d.dmg * Math.pow(1.6, level - 1)),
    slow: d.slow,
    slowFrames: d.slowFrames,
  };
};
const upgradeCost = (kind: TowerKind, level: number) => Math.round(TOWER_DEFS[kind].cost * (0.6 + 0.6 * level));

// ---- enemy classes: each restyles the headshot and rescales stats ----------
type EnemyKind = 'normal' | 'angry' | 'runner' | 'tank' | 'boss';

interface EnemyClass {
  name: string;
  hpMul: number;
  speedMul: number;
  rewardMul: number;
  radiusMul: number;
  ring: string;
  minWave: number;
  weight: number; // 0 = excluded from the random pool (boss is special)
  face?: (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => void;
}

const ENEMY_CLASSES: Record<EnemyKind, EnemyClass> = {
  normal: {
    name: 'Normal',
    hpMul: 1,
    speedMul: 1,
    rewardMul: 1,
    radiusMul: 1,
    ring: 'rgba(255,255,255,0.85)',
    minWave: 1,
    weight: 5,
  },
  angry: {
    name: 'Angry',
    hpMul: 1.4,
    speedMul: 1.25,
    rewardMul: 1.4,
    radiusMul: 1,
    ring: '#f87171',
    minWave: 2,
    weight: 3,
    face: (ctx, x, y, r) => {
      // furrowed eyebrows angled down toward the nose
      ctx.strokeStyle = '#171717';
      ctx.lineWidth = r * 0.16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 0.5 * r, y - 0.34 * r);
      ctx.lineTo(x - 0.12 * r, y - 0.12 * r);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 0.5 * r, y - 0.34 * r);
      ctx.lineTo(x + 0.12 * r, y - 0.12 * r);
      ctx.stroke();
    },
  },
  runner: {
    name: 'Runner',
    hpMul: 0.7,
    speedMul: 1.7,
    rewardMul: 1.2,
    radiusMul: 1,
    ring: '#fbbf24',
    minWave: 3,
    weight: 2,
    face: (ctx, x, y, r) => {
      // red headband with a trailing knot
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = r * 0.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 0.72 * r, y - 0.46 * r);
      ctx.lineTo(x + 0.72 * r, y - 0.36 * r);
      ctx.stroke();
      ctx.lineWidth = r * 0.11;
      ctx.beginPath();
      ctx.moveTo(x + 0.58 * r, y - 0.4 * r);
      ctx.lineTo(x + 0.96 * r, y - 0.1 * r);
      ctx.stroke();
    },
  },
  tank: {
    name: 'Tank',
    hpMul: 2.6,
    speedMul: 0.72,
    rewardMul: 1.9,
    radiusMul: 1.12,
    ring: '#9ca3af',
    minWave: 4,
    weight: 2,
    face: (ctx, x, y, r) => {
      // hard hat
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(x, y - 0.1 * r, 0.82 * r, 0.62 * r, 0, Math.PI, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    },
  },
  boss: {
    name: 'Boss',
    hpMul: 6,
    speedMul: 0.6,
    rewardMul: 5,
    radiusMul: 1.3,
    ring: '#facc15',
    minWave: 5,
    weight: 0,
    face: (ctx, x, y, r) => {
      // crown
      const cy = y - 0.5 * r;
      const cw = 0.82 * r;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(x - cw, cy + 0.2 * r);
      ctx.lineTo(x - cw, cy);
      ctx.lineTo(x - 0.6 * cw, cy - 0.4 * r);
      ctx.lineTo(x - 0.28 * cw, cy);
      ctx.lineTo(x, cy - 0.52 * r);
      ctx.lineTo(x + 0.28 * cw, cy);
      ctx.lineTo(x + 0.6 * cw, cy - 0.4 * r);
      ctx.lineTo(x + cw, cy);
      ctx.lineTo(x + cw, cy + 0.2 * r);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = r * 0.05;
      ctx.stroke();
    },
  },
};

// Weighted pick among classes unlocked by the current wave (boss excluded).
const pickKind = (wave: number): EnemyKind => {
  const pool = (Object.keys(ENEMY_CLASSES) as EnemyKind[]).filter(
    (k) => ENEMY_CLASSES[k].weight > 0 && ENEMY_CLASSES[k].minWave <= wave,
  );
  const total = pool.reduce((s, k) => s + ENEMY_CLASSES[k].weight, 0);
  let roll = Math.random() * total;
  for (const k of pool) {
    roll -= ENEMY_CLASSES[k].weight;
    if (roll <= 0) return k;
  }
  return 'normal';
};

type V = { x: number; y: number };
type Enemy = {
  id: number;
  x: number;
  y: number;
  wp: number;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  kind: EnemyKind;
  slow: number;
  slowFactor: number;
};
type Tower = { x: number; y: number; cell: number; kind: TowerKind; level: number; angle: number; timer: number; invested: number };
type Shot = { x: number; y: number; target: number; dmg: number; color: string; slow?: number; slowFrames?: number };

const PATH_CELLS: [number, number][] = [
  [0, 2],
  [9, 2],
  [9, 5],
  [2, 5],
  [2, 8],
  [11, 8],
];
const cellCenter = (col: number, row: number): V => ({ x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 });

const WAYPOINTS: V[] = [
  { x: -CELL, y: cellCenter(0, 2).y },
  ...PATH_CELLS.map(([col, row]) => cellCenter(col, row)),
  { x: SIZE + CELL, y: cellCenter(11, 8).y },
];

const PATH_SET = (() => {
  const s = new Set<number>();
  for (let i = 0; i < PATH_CELLS.length - 1; i++) {
    let [c, r] = PATH_CELLS[i];
    const [c1, r1] = PATH_CELLS[i + 1];
    const dc = Math.sign(c1 - c);
    const dr = Math.sign(r1 - r);
    s.add(r * GRID + c);
    while (c !== c1 || r !== r1) {
      c += dc;
      r += dr;
      s.add(r * GRID + c);
    }
  }
  return s;
})();

export default function TowerDefense() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pfp = useRef<HTMLImageElement | null>(null);

  const enemies = useRef<Enemy[]>([]);
  const towers = useRef<Tower[]>([]);
  const shots = useRef<Shot[]>([]);
  const eid = useRef(0);

  const livesRef = useRef(START_LIVES);
  const cashRef = useRef(START_CASH);
  const waveRef = useRef(0);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const toSpawn = useRef(0);
  const spawnTimer = useRef(0);
  const activeRef = useRef(false);
  const overRef = useRef(false);
  const selectedRef = useRef<number | null>(null);

  const [lives, setLives] = useState(START_LIVES);
  const [cash, setCash] = useState(START_CASH);
  const [wave, setWave] = useState(0);
  const [score, setScore] = useState(0);
  const [active, setActive] = useState(false);
  const [over, setOver] = useState(false);
  const [buildKind, setBuildKind] = useState<TowerKind>('gun');
  const [selected, setSelected] = useState<number | null>(null);

  const select = (cell: number | null) => {
    selectedRef.current = cell;
    setSelected(cell);
  };

  // ---- drawing -------------------------------------------------------------
  const drawHeadshot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    const img = pfp.current;
    if (img && img.complete && img.naturalWidth) {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, x - r, y - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
  };

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = CELL * 0.82;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
    for (let i = 1; i < WAYPOINTS.length; i++) ctx.lineTo(WAYPOINTS[i].x, WAYPOINTS[i].y);
    ctx.stroke();

    towers.current.forEach((t) => {
      const def = TOWER_DEFS[t.kind];
      const eff = effective(t.kind, t.level);
      const isSel = t.cell === selectedRef.current;

      ctx.beginPath();
      ctx.arc(t.x, t.y, eff.range, 0, Math.PI * 2);
      ctx.fillStyle = isSel ? 'rgba(147,197,253,0.12)' : 'rgba(251,146,60,0.05)';
      ctx.fill();
      if (isSel) {
        ctx.strokeStyle = 'rgba(147,197,253,0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(t.x, t.y, CELL * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      if (isSel) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      }

      ctx.strokeStyle = def.barrel;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(t.x + Math.cos(t.angle) * CELL * 0.42, t.y + Math.sin(t.angle) * CELL * 0.42);
      ctx.stroke();

      // level pips
      ctx.fillStyle = '#fff';
      for (let i = 0; i < t.level; i++) {
        ctx.beginPath();
        ctx.arc(t.x - 5 + i * 5, t.y + CELL * 0.32, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    enemies.current.forEach((e) => {
      const cls = ENEMY_CLASSES[e.kind];
      const r = CELL * 0.42 * cls.radiusMul;
      drawHeadshot(ctx, e.x, e.y, r);
      cls.face?.(ctx, e.x, e.y, r);

      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
      ctx.lineWidth = e.slow > 0 ? 2.5 : 1.8;
      ctx.strokeStyle = e.slow > 0 ? '#22d3ee' : cls.ring;
      ctx.stroke();

      const bw = CELL * 0.84 * cls.radiusMul;
      const frac = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(e.x - bw / 2, e.y - r - 7, bw, 4);
      ctx.fillStyle = frac > 0.5 ? '#22c55e' : frac > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(e.x - bw / 2, e.y - r - 7, bw * frac, 4);
    });

    shots.current.forEach((s) => {
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  // ---- simulation ----------------------------------------------------------
  const tick = useCallback(() => {
    if (activeRef.current && toSpawn.current > 0) {
      spawnTimer.current -= 1;
      if (spawnTimer.current <= 0) {
        const isBoss = waveRef.current % 5 === 0 && toSpawn.current === 1;
        const kind: EnemyKind = isBoss ? 'boss' : pickKind(waveRef.current);
        const cls = ENEMY_CLASSES[kind];
        const baseHp = 26 + waveRef.current * 16;
        const hp = Math.round(baseHp * cls.hpMul);
        enemies.current.push({
          id: eid.current++,
          x: WAYPOINTS[0].x,
          y: WAYPOINTS[0].y,
          wp: 1,
          hp,
          maxHp: hp,
          speed: (1.05 + Math.min(waveRef.current * 0.05, 1.3)) * cls.speedMul,
          reward: Math.round(KILL_REWARD * cls.rewardMul),
          kind,
          slow: 0,
          slowFactor: 1,
        });
        toSpawn.current -= 1;
        spawnTimer.current = 40;
      }
    }

    let leaked = 0;
    enemies.current = enemies.current.filter((e) => {
      const f = e.slow > 0 ? e.slowFactor : 1;
      if (e.slow > 0) e.slow -= 1;
      const step = e.speed * f;
      const tgt = WAYPOINTS[e.wp];
      const dx = tgt.x - e.x;
      const dy = tgt.y - e.y;
      const d = Math.hypot(dx, dy);
      if (d <= step) {
        e.x = tgt.x;
        e.y = tgt.y;
        e.wp += 1;
        if (e.wp >= WAYPOINTS.length) {
          leaked += 1;
          return false;
        }
      } else {
        e.x += (dx / d) * step;
        e.y += (dy / d) * step;
      }
      return true;
    });
    if (leaked) {
      livesRef.current = Math.max(0, livesRef.current - leaked);
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        overRef.current = true;
        setOver(true);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          try {
            localStorage.setItem('td-best', String(bestRef.current));
          } catch {
            /* ignore */
          }
        }
      }
    }

    towers.current.forEach((t) => {
      const eff = effective(t.kind, t.level);
      if (t.timer > 0) t.timer -= 1;
      let best: Enemy | null = null;
      enemies.current.forEach((e) => {
        if (Math.hypot(e.x - t.x, e.y - t.y) <= eff.range && (!best || e.wp > best.wp)) best = e;
      });
      if (best) {
        const target = best as Enemy;
        t.angle = Math.atan2(target.y - t.y, target.x - t.x);
        if (t.timer <= 0) {
          shots.current.push({
            x: t.x,
            y: t.y,
            target: target.id,
            dmg: eff.dmg,
            color: TOWER_DEFS[t.kind].color,
            slow: eff.slow,
            slowFrames: eff.slowFrames,
          });
          t.timer = eff.cd;
        }
      }
    });

    let killCash = 0;
    let kills = 0;
    shots.current = shots.current.filter((s) => {
      const e = enemies.current.find((en) => en.id === s.target);
      if (!e) return false;
      const dx = e.x - s.x;
      const dy = e.y - s.y;
      const d = Math.hypot(dx, dy);
      if (d <= SHOT_SPEED + 4) {
        e.hp -= s.dmg;
        if (s.slow) {
          e.slow = s.slowFrames ?? 0;
          e.slowFactor = s.slow;
        }
        if (e.hp <= 0) {
          enemies.current = enemies.current.filter((en) => en.id !== e.id);
          killCash += e.reward;
          kills += 1;
        }
        return false;
      }
      s.x += (dx / d) * SHOT_SPEED;
      s.y += (dy / d) * SHOT_SPEED;
      return true;
    });
    if (killCash) {
      cashRef.current += killCash;
      setCash(cashRef.current);
      scoreRef.current += kills;
      setScore(scoreRef.current);
    }

    if (activeRef.current && toSpawn.current === 0 && enemies.current.length === 0) {
      activeRef.current = false;
      setActive(false);
      cashRef.current += WAVE_BONUS;
      setCash(cashRef.current);
    }

    draw();
  }, [draw]);

  const startWave = useCallback(() => {
    if (activeRef.current || overRef.current) return;
    waveRef.current += 1;
    setWave(waveRef.current);
    toSpawn.current = 5 + waveRef.current * 2;
    spawnTimer.current = 0;
    activeRef.current = true;
    setActive(true);
  }, []);

  const reset = useCallback(() => {
    enemies.current = [];
    towers.current = [];
    shots.current = [];
    livesRef.current = START_LIVES;
    cashRef.current = START_CASH;
    waveRef.current = 0;
    scoreRef.current = 0;
    toSpawn.current = 0;
    activeRef.current = false;
    overRef.current = false;
    selectedRef.current = null;
    setLives(START_LIVES);
    setCash(START_CASH);
    setWave(0);
    setScore(0);
    setActive(false);
    setOver(false);
    setSelected(null);
    draw();
  }, [draw]);

  // Tap: select a tower if one is there, otherwise build the active type.
  const onTap = (clientX: number, clientY: number) => {
    if (overRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (SIZE / rect.width);
    const y = (clientY - rect.top) * (SIZE / rect.height);
    const col = Math.floor(x / CELL);
    const row = Math.floor(y / CELL);
    if (col < 0 || row < 0 || col >= GRID || row >= GRID) return;
    const cell = row * GRID + col;

    const existing = towers.current.find((t) => t.cell === cell);
    if (existing) {
      select(cell);
      return;
    }
    select(null);
    if (PATH_SET.has(cell)) return;

    const def = TOWER_DEFS[buildKind];
    if (cashRef.current < def.cost) return;
    towers.current.push({ ...cellCenter(col, row), cell, kind: buildKind, level: 1, angle: -Math.PI / 2, timer: 0, invested: def.cost });
    cashRef.current -= def.cost;
    setCash(cashRef.current);
  };

  const upgradeSelected = () => {
    const t = towers.current.find((x) => x.cell === selectedRef.current);
    if (!t || t.level >= MAX_LEVEL) return;
    const cost = upgradeCost(t.kind, t.level);
    if (cashRef.current < cost) return;
    t.level += 1;
    t.invested += cost;
    cashRef.current -= cost;
    setCash(cashRef.current);
  };

  const sellSelected = () => {
    const t = towers.current.find((x) => x.cell === selectedRef.current);
    if (!t) return;
    towers.current = towers.current.filter((x) => x.cell !== t.cell);
    cashRef.current += Math.floor(t.invested * SELL_RATE);
    setCash(cashRef.current);
    select(null);
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      pfp.current = img;
      draw();
    };
    img.src = PFP_SRC;
    try {
      const b = Number(localStorage.getItem('td-best') || '0');
      if (!Number.isNaN(b)) bestRef.current = b;
    } catch {
      /* ignore */
    }
    draw();
  }, [draw]);

  useEffect(() => {
    if (over) return;
    const id = window.setInterval(tick, MS);
    return () => window.clearInterval(id);
  }, [over, tick]);

  const sel = selected !== null ? towers.current.find((t) => t.cell === selected) ?? null : null;
  const selEff = sel ? effective(sel.kind, sel.level) : null;
  const upCost = sel && sel.level < MAX_LEVEL ? upgradeCost(sel.kind, sel.level) : 0;

  return (
    <GamePlayer
      stats={[
        { label: 'Lives', value: lives, valueClassName: 'text-error' },
        { label: '$', value: cash, valueClassName: 'text-success' },
        { label: 'Wave', value: wave, valueClassName: 'text-primary' },
      ]}
      controls={
        <div className="flex flex-col items-center gap-2 w-full max-w-[420px]">
          {/* tower palette */}
          <div className="flex gap-1.5">
            {KINDS.map((k) => {
              const d = TOWER_DEFS[k];
              const isActive = buildKind === k;
              const afford = cash >= d.cost;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setBuildKind(k);
                    select(null);
                  }}
                  className={`btn btn-sm flex-col gap-0 h-auto py-1.5 ${isActive ? 'btn-primary' : 'btn-outline'} ${afford ? '' : 'opacity-50'}`}
                >
                  <span className="font-bold leading-none">{d.name}</span>
                  <span className="text-[10px] leading-none opacity-80">${d.cost}</span>
                </button>
              );
            })}
          </div>

          {/* selected-tower panel */}
          {sel && selEff && (
            <div className="flex flex-col items-center gap-1 rounded-lg bg-base-100/15 px-3 py-2">
              <span className="text-xs font-bold">
                {TOWER_DEFS[sel.kind].name} · Lv {sel.level}
              </span>
              <span className="text-[11px] opacity-90">
                DMG {selEff.dmg} · RNG {Math.round(selEff.range / CELL)}
                {TOWER_DEFS[sel.kind].slow ? ' · slows' : ''}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="btn btn-xs btn-success"
                  disabled={sel.level >= MAX_LEVEL || cash < upCost}
                  onClick={upgradeSelected}
                >
                  {sel.level >= MAX_LEVEL ? 'Max level' : `Upgrade $${upCost}`}
                </button>
                <button type="button" className="btn btn-xs btn-warning" onClick={sellSelected}>
                  Sell ${Math.floor(sel.invested * SELL_RATE)}
                </button>
                <button type="button" className="btn btn-xs" onClick={() => select(null)}>
                  Done
                </button>
              </div>
            </div>
          )}

          <button type="button" className="btn btn-primary btn-sm" disabled={active || over} onClick={startWave}>
            {active ? `Wave ${wave} in progress…` : `Start wave ${wave + 1}`}
          </button>

          <p className="text-[11px] text-center text-base-100">
            Tap ground to build · tap a tower to upgrade · Score {score}
          </p>
        </div>
      }
      screenMaxWidth={SIZE}
    >
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        onClick={(e) => onTap(e.clientX, e.clientY)}
        className="w-full rounded-xl border border-base-300 shadow-lg touch-none cursor-pointer"
        style={{ aspectRatio: '1 / 1' }}
      />
      {over && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 rounded-xl text-white">
          <p className="text-2xl font-bold">Game Over</p>
          <p className="text-sm">
            Reached wave {wave} · score {score}
          </p>
          <button className="btn btn-primary btn-sm" onClick={reset}>
            Play again
          </button>
        </div>
      )}
    </GamePlayer>
  );
}
