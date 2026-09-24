import { flipperTip, SKILL_BAND, type Ball, type PinballEngine } from './engine';
import {
  BALL_R,
  BUMPERS,
  DOME,
  FLIPPER_R,
  H,
  KICKERS,
  LANE_GUIDES_X,
  LANE_GUIDE_Y,
  LANE_L,
  LANE_LETTERS,
  LANE_R,
  LANE_TOP,
  OUTLANE_GUARDS,
  OUTLANE_POSTS,
  MID,
  ORBIT_WALL,
  LOCK_ARROW,
  PLUNGER_Y,
  RAMP_APEX,
  RAMP_PATH,
  RAMP_PLASTIC_END,
  RAMP_POSTS,
  SAUCER,
  SLINGS,
  SPINNER,
  TARGETS,
  TARGET_LETTERS,
  TOP_LANES,
  W,
  WALLS,
  type Vec,
} from './table';

type Ctx = CanvasRenderingContext2D;

const makeLayer = (res: number, paint: (ctx: Ctx) => void) => {
  const c = document.createElement('canvas');
  c.width = W * res;
  c.height = H * res;
  const ctx = c.getContext('2d')!;
  ctx.setTransform(res, 0, 0, res, 0, 0);
  paint(ctx);
  return c;
};

// deterministic pseudo-random so the starfield is the same every load
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

const poly = (ctx: Ctx, pts: Vec[]) => {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
};

/** Offset a polyline sideways by d, fixed or per point (wire rails / ramp edges). */
const offsetPath = (pts: Vec[], d: number | ((i: number) => number)): Vec[] =>
  pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const off = typeof d === 'number' ? d : d(i);
    return { x: p.x - (dy / l) * off, y: p.y + (dx / l) * off };
  });

const chrome = (ctx: Ctx, pts: Vec[], width: number) => {
  poly(ctx, pts);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = width + 2.5;
  ctx.stroke();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(0.8, width * 0.35);
  ctx.stroke();
};

const roundRect = (ctx: Ctx, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** A little printed keyboard key, for the control tips on the apron. */
const keycap = (ctx: Ctx, cx: number, cy: number, label: string) => {
  const s = 17;
  ctx.save();
  roundRect(ctx, cx - s / 2, cy - s / 2 + 2, s, s, 3);
  ctx.fillStyle = '#0b0f19';
  ctx.fill();
  roundRect(ctx, cx - s / 2, cy - s / 2, s, s, 3);
  const g = ctx.createLinearGradient(0, cy - s / 2, 0, cy + s / 2);
  g.addColorStop(0, '#f8fafc');
  g.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 0.5);
  ctx.restore();
};

/**
 * Everything below the flippers: metal apron wedges under each inlane (with
 * the flipper key tips printed on them), a hazard-striped drain chute between
 * the flippers, and red "danger" outlanes running down to the drain.
 */
const paintApron = (ctx: Ctx) => {
  const m = (p: Vec): Vec => ({ x: 2 * MID - p.x, y: p.y });
  const left: Vec[] = [
    { x: 44, y: 600 },
    { x: 130, y: 666 },
    { x: 124, y: 690 },
    { x: 180, y: 722 },
    { x: 186, y: H },
    { x: 44, y: H },
  ];
  const right = left.map(m);

  // outlanes: red danger channels with chevrons pointing at the drain
  for (const x0 of [10, 2 * MID - 44]) {
    const g = ctx.createLinearGradient(0, 560, 0, H);
    g.addColorStop(0, 'rgba(220,38,38,0)');
    g.addColorStop(1, 'rgba(220,38,38,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, 560, 34, H - 560);
    ctx.strokeStyle = 'rgba(254,202,202,0.55)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let y = 612; y < H - 10; y += 26) {
      ctx.beginPath();
      ctx.moveTo(x0 + 9, y);
      ctx.lineTo(x0 + 17, y + 7);
      ctx.lineTo(x0 + 25, y);
      ctx.stroke();
    }
  }

  // drain chute between the flippers: hazard stripes
  const chute: Vec[] = [left[3], right[3], right[4], left[4]];
  ctx.save();
  poly(ctx, chute);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(170, 715, 70, 50);
  ctx.fillStyle = 'rgba(250,204,21,0.55)';
  for (let x = 150; x < 260; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 7, H);
    ctx.lineTo(x + 7 + 40, 715);
    ctx.lineTo(x + 40, 715);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // apron wedges
  for (const shape of [left, right]) {
    poly(ctx, shape);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 600, 0, H);
    g.addColorStop(0, '#334155');
    g.addColorStop(0.35, '#1e293b');
    g.addColorStop(1, '#0b1220');
    ctx.fillStyle = g;
    ctx.fill();
    // chrome trim along the edge that faces the ball
    poly(ctx, shape.slice(0, 5));
    ctx.strokeStyle = 'rgba(226,232,240,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // rivets
  for (const p of [
    { x: 56, y: 626 },
    { x: 56, y: 748 },
    { x: 170, y: 748 },
  ]) {
    for (const q of [p, m(p)]) {
      ctx.beginPath();
      ctx.arc(q.x, q.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
    }
  }

  // key tips next to each flipper
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  keycap(ctx, 88, 700, 'A');
  ctx.font = 'bold 7px sans-serif';
  ctx.fillStyle = '#fde68a';
  ctx.fillText('◀ LEFT FLIP', 88, 720);
  keycap(ctx, 2 * MID - 101, 700, 'D');
  keycap(ctx, 2 * MID - 75, 700, 'L');
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('/', 2 * MID - 88, 701);
  ctx.font = 'bold 7px sans-serif';
  ctx.fillStyle = '#fde68a';
  ctx.fillText('RIGHT FLIP ▶', 2 * MID - 88, 720);
  ctx.font = 'bold 6px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('UFO INVASION', 88, 737);
  ctx.fillText('HOLD SPACE: LAUNCH', 2 * MID - 88, 737);
  ctx.restore();
};

/**
 * The top of the table under the dome: an orbit track around the arch with
 * direction chevrons, a mothership beaming down onto the U-F-O lanes, nebula
 * glows in the corners and a glow around the black hole.
 */
const paintTop = (ctx: Ctx) => {
  // nebula glows in the upper corners
  for (const [x, y, c] of [
    [70, 130, '168,85,247'],
    [330, 120, '45,212,191'],
  ] as const) {
    const g = ctx.createRadialGradient(x, y, 5, x, y, 110);
    g.addColorStop(0, `rgba(${c},0.22)`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - 110, y - 110, 220, 220);
  }

  // orbit track band just inside the dome
  const a0 = Math.PI + 0.12;
  const a1 = Math.PI * 2 - 0.22;
  const rOut = DOME.r - 3;
  const rIn = DOME.r - 26;
  ctx.beginPath();
  ctx.arc(DOME.x, DOME.y, rOut, a0, a1);
  ctx.arc(DOME.x, DOME.y, rIn, a1, a0, true);
  ctx.closePath();
  ctx.fillStyle = 'rgba(56,189,248,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(125,211,252,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(DOME.x, DOME.y, rIn, a0, a1);
  ctx.stroke();
  // chevrons point the way a plunged ball travels: up the right, over, down the left
  const rMid = (rOut + rIn) / 2;
  for (let a = a1 - 0.08; a > a0 + 0.05; a -= 0.16) {
    const cx = DOME.x + Math.cos(a) * rMid;
    const cy = DOME.y + Math.sin(a) * rMid;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a - Math.PI / 2); // tip points along decreasing angle
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(3, 0);
    ctx.lineTo(-4, 6);
    ctx.strokeStyle = 'rgba(125,211,252,0.35)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  // mothership + tractor beam onto the lanes
  const gx0 = LANE_GUIDES_X[0];
  const gx1 = LANE_GUIDES_X[LANE_GUIDES_X.length - 1];
  const beam = ctx.createLinearGradient(0, 56, 0, LANE_GUIDE_Y[1]);
  beam.addColorStop(0, 'rgba(163,230,53,0.28)');
  beam.addColorStop(1, 'rgba(163,230,53,0.04)');
  ctx.beginPath();
  ctx.moveTo(MID - 16, 56);
  ctx.lineTo(MID + 16, 56);
  ctx.lineTo(gx1 + 4, LANE_GUIDE_Y[1]);
  ctx.lineTo(gx0 - 4, LANE_GUIDE_Y[1]);
  ctx.closePath();
  ctx.fillStyle = beam;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(MID, 52, 30, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(148,163,184,0.55)';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(MID, 48, 12, 8, 0, Math.PI, 0);
  ctx.fillStyle = 'rgba(103,232,249,0.5)';
  ctx.fill();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(MID + i * 11, 53, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(253,224,71,0.7)';
    ctx.fill();
  }

  // glow around the black hole
  const hole = ctx.createRadialGradient(SAUCER.x, SAUCER.y, 4, SAUCER.x, SAUCER.y, 46);
  hole.addColorStop(0, 'rgba(88,28,135,0.7)');
  hole.addColorStop(1, 'rgba(88,28,135,0)');
  ctx.fillStyle = hole;
  ctx.beginPath();
  ctx.arc(SAUCER.x, SAUCER.y, 46, 0, Math.PI * 2);
  ctx.fill();

  paintCabinetCorners(ctx);
};

/**
 * Everything outside the playfield: the top corners around the dome and the
 * thin side strips, dressed as cabinet panels with pinstripes, a neon trim
 * hugging the dome, rivets and a couple of decals.
 */
const paintCabinetCorners = (ctx: Ctx) => {
  const outside = new Path2D();
  outside.rect(0, 0, W, DOME.y);
  outside.moveTo(DOME.x - DOME.r, DOME.y);
  outside.arc(DOME.x, DOME.y, DOME.r, Math.PI, Math.PI * 2);
  outside.closePath();
  outside.rect(0, DOME.y, DOME.x - DOME.r, H - DOME.y); // left strip
  outside.rect(DOME.x + DOME.r, DOME.y, W - DOME.x - DOME.r, H - DOME.y); // right strip

  ctx.save();
  ctx.clip(outside, 'evenodd');
  const g = ctx.createLinearGradient(0, 0, 0, DOME.y);
  g.addColorStop(0, '#1e1033');
  g.addColorStop(1, '#0b0f1f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // diagonal pinstripes
  ctx.strokeStyle = 'rgba(236,72,153,0.13)';
  ctx.lineWidth = 2;
  for (let d = -H; d < W + H; d += 12) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + H, H);
    ctx.stroke();
  }
  // rivets along the corners
  for (const [x, y] of [
    [8, 8],
    [W - 8, 8],
    [60, 8],
    [W - 60, 8],
    [8, 60],
    [W - 8, 60],
    [8, 130],
    [W - 5, 130],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
  }
  // decal: alien head (top left)
  ctx.save();
  ctx.translate(34, 34);
  ctx.shadowColor = '#4ade80';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#052e16';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 5.5, 1, 4, 6.5, side * -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // decal: a cow being beamed up (top right)
  const bx = W - 34;
  const beam = ctx.createLinearGradient(0, 4, 0, 60);
  beam.addColorStop(0, 'rgba(163,230,53,0.45)');
  beam.addColorStop(1, 'rgba(163,230,53,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(bx - 6, 4);
  ctx.lineTo(bx + 6, 4);
  ctx.lineTo(bx + 20, 60);
  ctx.lineTo(bx - 20, 60);
  ctx.closePath();
  ctx.fill();
  drawCow(ctx, bx, 36, 13, -0.35, false);
  ctx.restore();

  // neon trim just outside the dome rail
  ctx.save();
  ctx.beginPath();
  ctx.arc(DOME.x, DOME.y, DOME.r + 4, Math.PI, Math.PI * 2);
  ctx.strokeStyle = 'rgba(236,72,153,0.8)';
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
};

const paintBase = (ctx: Ctx) => {
  // playfield backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1a0f3a');
  bg.addColorStop(0.55, '#0d1b3d');
  bg.addColorStop(1, '#07122a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const r = rng(7);
  for (let i = 0; i < 140; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.5})`;
    const s = r() < 0.9 ? 1 : 2;
    ctx.fillRect(r() * W, r() * H, s, s);
  }

  // big ringed planet art
  const px = MID;
  const py = 455;
  const glow = ctx.createRadialGradient(px, py, 10, px, py, 140);
  glow.addColorStop(0, 'rgba(168,85,247,0.28)');
  glow.addColorStop(1, 'rgba(168,85,247,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(px - 150, py - 150, 300, 300);
  const planet = ctx.createRadialGradient(px - 18, py - 18, 4, px, py, 52);
  planet.addColorStop(0, 'rgba(244,114,182,0.55)');
  planet.addColorStop(1, 'rgba(76,29,149,0.45)');
  ctx.fillStyle = planet;
  ctx.beginPath();
  ctx.arc(px, py, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(250,204,21,0.35)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(px, py, 92, 20, -0.25, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillText('UFO', px, 395);
  ctx.fillText('INVASION', px, 535);
  ctx.restore();

  // plunger lane: only below the one-way gate (above it is playfield)
  poly(ctx, [
    { x: LANE_L, y: LANE_TOP },
    { x: LANE_R, y: LANE_TOP - 24 },
    { x: LANE_R, y: H },
    { x: LANE_L, y: H },
  ]);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();

  // orbit lane floor
  ctx.fillStyle = 'rgba(56,189,248,0.07)';
  ctx.fillRect(10, ORBIT_WALL[0].y, ORBIT_WALL[0].x - 10, ORBIT_WALL[1].y - ORBIT_WALL[0].y);

  // outlane labels
  ctx.save();
  ctx.font = 'bold 8px sans-serif';
  ctx.fillStyle = 'rgba(248,113,113,0.6)';
  ctx.textAlign = 'center';
  ctx.fillText('OUT', 27, 580);
  ctx.fillText('OUT', 2 * MID - 27, 580);
  ctx.fillStyle = 'rgba(125,211,252,0.6)';
  ctx.fillText('IN', 61, 575);
  ctx.fillText('IN', 2 * MID - 61, 575);
  ctx.restore();

  paintTop(ctx);
  paintApron(ctx);

  // slingshot plastics
  for (const s of SLINGS) {
    poly(ctx, [s.A, s.B, s.C]);
    ctx.closePath();
    const g = ctx.createLinearGradient(s.A.x, s.A.y, s.C.x, s.C.y);
    g.addColorStop(0, '#be123c');
    g.addColorStop(1, '#7c3aed');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  // walls: chrome guide rails
  for (const s of WALLS) {
    if (s.oneWay) continue;
    chrome(ctx, [s.a, s.b], 3);
  }

  // outlane guards: white rubber over a red post
  for (const g of OUTLANE_GUARDS) {
    poly(ctx, [g.a, g.b]);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  for (const p of OUTLANE_POSTS) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // lane guide caps (rubber posts)
  for (const x of LANE_GUIDES_X) {
    for (const y of LANE_GUIDE_Y) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
    }
  }

  // ramp mouth posts
  for (const p of RAMP_POSTS) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // bumper bases
  for (const b of BUMPERS) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fill();
  }

  // label text for shots
  ctx.save();
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('ORBIT', 86, 452);
  ctx.fillStyle = 'rgba(233,213,255,0.6)';
  ctx.fillText('BLACK HOLE', SAUCER.x, SAUCER.y - 22);
  ctx.restore();
};

const paintRamp = (ctx: Ctx) => {
  const plastic = RAMP_PATH.slice(0, RAMP_PLASTIC_END + 1);
  const wire = RAMP_PATH.slice(RAMP_PLASTIC_END);

  // plastic entry ramp: wide flat-cut mouth, tapering smoothly so its edges
  // land exactly on the two wire rails where the habitrail takes over
  const MOUTH_HALF = 20;
  const RAIL_HALF = 6;
  const last = plastic.length - 1;
  const half = (i: number) => {
    const t = i / last;
    return RAIL_HALF + (MOUTH_HALF - RAIL_HALF) * (1 - t * t * (3 - 2 * t));
  };
  const left = offsetPath(plastic, (i) => -half(i));
  const right = offsetPath(plastic, half);
  const outline = [...left, ...right.reverse()];
  right.reverse();

  ctx.lineJoin = 'round';
  poly(ctx, outline.map((p) => ({ x: p.x + 3, y: p.y + 4 })));
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();
  const g = ctx.createLinearGradient(0, RAMP_PATH[0].y, 0, RAMP_PATH[RAMP_APEX].y);
  g.addColorStop(0, 'rgba(56,189,248,0.35)');
  g.addColorStop(1, 'rgba(129,140,248,0.45)');
  poly(ctx, outline);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineCap = 'round';
  for (const edge of [left, right]) {
    poly(ctx, edge);
    ctx.strokeStyle = 'rgba(186,230,253,0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // entry lip
  ctx.fillStyle = 'rgba(186,230,253,0.5)';
  ctx.fillRect(RAMP_POSTS[0].x + 4, RAMP_POSTS[0].y - 3, RAMP_POSTS[1].x - RAMP_POSTS[0].x - 8, 3);

  // wire habitrail: two chrome rails with cross ties
  const railA = offsetPath(wire, -6);
  const railB = offsetPath(wire, 6);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 16;
  poly(ctx, wire.map((p) => ({ x: p.x + 3, y: p.y + 4 })));
  ctx.stroke();
  let acc = 0;
  for (let i = 1; i < wire.length; i++) {
    const a = wire[i - 1];
    const b = wire[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    for (let d = (18 - acc) % 18; d < len; d += 18) {
      const t = d / len;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const nx = -(b.y - a.y) / len;
      const ny = (b.x - a.x) / len;
      ctx.beginPath();
      ctx.moveTo(x - nx * 8, y - ny * 8);
      ctx.lineTo(x + nx * 8, y + ny * 8);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    acc = (acc + len) % 18;
  }
  chrome(ctx, railA, 2.2);
  chrome(ctx, railB, 2.2);
};

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** Unlit inserts still show their coloured plastic, like a real playfield. */
const GHOST = 0.2;

/** A round insert. `level` is 0..1 lamp brightness (already faded). */
const insert = (ctx: Ctx, x: number, y: number, r: number, color: string, level: number, label?: string) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(color, GHOST);
  ctx.fill();
  if (level > 0.01) {
    ctx.shadowColor = rgba(color, level);
    ctx.shadowBlur = 14 * level;
    ctx.fillStyle = rgba(color, level);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.65 * level})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  if (label) {
    ctx.fillStyle = level > 0.5 ? `rgba(17,24,39,${level})` : `rgba(255,255,255,${0.45 - 0.3 * level})`;
    ctx.font = `bold ${Math.round(r * 1.05)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 0.5);
  }
  ctx.restore();
};

const arrow = (ctx: Ctx, x: number, y: number, angle: number, color: string, level: number, label?: string) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.lineTo(9, 6);
  ctx.lineTo(-9, 6);
  ctx.closePath();
  ctx.fillStyle = rgba(color, GHOST);
  ctx.fill();
  if (level > 0.01) {
    ctx.shadowColor = rgba(color, level);
    ctx.shadowBlur = 16 * level;
    ctx.fillStyle = rgba(color, level);
    ctx.fill();
  }
  ctx.restore();
  if (label) {
    ctx.save();
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = rgba(color, 0.4 + 0.6 * level);
    ctx.fillText(label, x, y + 18);
    ctx.restore();
  }
};

/**
 * A whole cow (side view) for the pop bumper caps, tumbling at `angle` like
 * it's being beamed up. Drawn in units of the bumper radius `s`.
 */
const drawCow = (ctx: Ctx, x: number, y: number, s: number, angle: number, startled: boolean) => {
  const u = s / 10; // cow units: the cow is ~19u long, fits inside the bumper
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.translate(-1.5 * u, 0.6 * u); // centre the body+head in the cap
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // tail with a tuft
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 0.8 * u;
  ctx.beginPath();
  ctx.moveTo(-6 * u, -1.5 * u);
  ctx.quadraticCurveTo(-8.5 * u, -0.5 * u, -8 * u, 2.5 * u);
  ctx.stroke();
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(-8 * u, 3 * u, 0.8 * u, 1.1 * u, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs (kicking out when startled) with dark hooves
  const legs = [-4.4, -2.6, 2.4, 4.2];
  legs.forEach((lx, i) => {
    const kick = startled ? (i % 2 ? 0.5 : -0.5) : 0;
    ctx.save();
    ctx.translate(lx * u, 2 * u);
    ctx.rotate(kick);
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(-0.7 * u, 0, 1.4 * u, 3.4 * u);
    ctx.fillStyle = '#292524';
    ctx.fillRect(-0.7 * u, 2.6 * u, 1.4 * u, 0.9 * u);
    ctx.restore();
  });

  // udder
  ctx.fillStyle = '#f9a8d4';
  ctx.beginPath();
  ctx.ellipse(0.8 * u, 2.9 * u, 1.3 * u, 0.9 * u, 0, 0, Math.PI * 2);
  ctx.fill();

  // body with black patches
  ctx.beginPath();
  ctx.ellipse(0, 0, 6.2 * u, 3.6 * u, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fafaf9';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(-2.8 * u, -1.6 * u, 2.2 * u, 1.6 * u, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(2.2 * u, 1.2 * u, 1.6 * u, 1.3 * u, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-5.6 * u, 1.8 * u, 1.2 * u, 1.4 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // head: ear, horn, face, muzzle, eye
  const hx = 6.8 * u;
  const hy = -2 * u;
  ctx.fillStyle = '#44403c';
  ctx.beginPath();
  ctx.ellipse(hx - 1.6 * u, hy - 1.6 * u, 1.3 * u, 0.6 * u, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.ellipse(hx - 0.2 * u, hy - 2.4 * u, 0.45 * u, 1 * u, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fafaf9';
  ctx.beginPath();
  ctx.ellipse(hx, hy, 2.4 * u, 2.1 * u, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f9a8d4';
  ctx.beginPath();
  ctx.ellipse(hx + 1.6 * u, hy + 0.9 * u, 1.4 * u, 1.1 * u, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9d174d';
  ctx.beginPath();
  ctx.arc(hx + 2.2 * u, hy + 0.7 * u, 0.3 * u, 0, Math.PI * 2);
  ctx.fill();
  if (startled) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(hx + 0.2 * u, hy - 0.7 * u, 0.9 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 0.3 * u;
    ctx.stroke();
  }
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(hx + 0.2 * u, hy - 0.7 * u, (startled ? 0.4 : 0.5) * u, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const drawBall = (ctx: Ctx, b: Ball, scale = 1) => {
  const r = BALL_R * scale;
  ctx.beginPath();
  ctx.arc(b.x + 2 * scale, b.y + 3 * scale, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();
  const g = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.4, r * 0.1, b.x, b.y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, '#d1d5db');
  g.addColorStop(0.8, '#6b7280');
  g.addColorStop(1, '#374151');
  ctx.beginPath();
  ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
};

// lamp fade rates (per second): quick incandescent warm-up, slower afterglow
const LAMP_ON = 16;
const LAMP_OFF = 5;

export class PinballRenderer {
  private base: HTMLCanvasElement;
  private ramp: HTMLCanvasElement;
  private lamps = new Map<string, number>();
  /** Each bumper's cow tumbles at its own random angle (picked per table load). */
  private cowAngles = BUMPERS.map(() => Math.random() * Math.PI * 2);
  private lastTime = 0;
  private dt = 0;

  /** Fade lamp `id` toward on/off and return its current brightness (0..1). */
  private lamp(id: string, on: boolean) {
    const cur = this.lamps.get(id) ?? 0;
    const next = on ? Math.min(1, cur + LAMP_ON * this.dt) : Math.max(0, cur - LAMP_OFF * this.dt);
    this.lamps.set(id, next);
    return next;
  }

  constructor(private res: number) {
    this.base = makeLayer(res, paintBase);
    this.ramp = makeLayer(res, paintRamp);
  }

  draw(ctx: Ctx, e: PinballEngine, time: number) {
    ctx.setTransform(this.res, 0, 0, this.res, 0, 0);
    ctx.drawImage(this.base, 0, 0, W, H);
    this.dt = this.lastTime ? Math.min(0.1, Math.max(0, time - this.lastTime)) : 0;
    this.lastTime = time;
    const L = (id: string, on: boolean) => this.lamp(id, on);
    const blink = Math.floor(time * 4) % 2 === 0;
    const fastBlink = Math.floor(time * 8) % 2 === 0;

    // ---- inserts ----
    TOP_LANES.forEach((ln, i) => {
      const lit = e.lanes[i] || (e.laneFlash > 0 && fastBlink);
      insert(ctx, ln.cx, ln.y, 9, '#facc15', L(`lane${i}`, lit), LANE_LETTERS[i]);
      const skill = e.skillActive && e.skillLane === i && (blink || e.skillLaunched);
      arrow(ctx, ln.cx, ln.y - 30, Math.PI, '#22d3ee', L(`skill${i}`, skill));
    });

    const multLabels = ['2X', '3X', '4X', '5X'];
    const multPos = [
      [150, 590],
      [184, 578],
      [224, 578],
      [258, 590],
    ];
    multLabels.forEach((l, i) => insert(ctx, multPos[i][0], multPos[i][1], 9, '#fb923c', L(`mult${i}`, e.mult >= i + 2), l));

    const saveLeft = e.ballSaveUntil - e.t;
    const save = L('save', (e.ballSaveActive() && (saveLeft > 2 || fastBlink)) || (e.extraBalls > 0 && blink));
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(MID, 622, 30, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba('#f43f5e', GHOST);
    ctx.fill();
    if (save > 0.01) {
      ctx.shadowColor = rgba('#f43f5e', save);
      ctx.shadowBlur = 16 * save;
      ctx.fillStyle = rgba('#f43f5e', save);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(255,255,255,${0.45 + 0.55 * save})`;
    ctx.fillText('SHOOT AGAIN', MID, 622.5);
    ctx.restore();

    const rampOn = e.multiball ? fastBlink : e.t - e.lastRampT < 5 ? blink : e.rampFlash > 0;
    arrow(ctx, 285, 386, 0, e.multiball ? '#4ade80' : '#38bdf8', L('ramp', rampOn), e.multiball ? 'JACKPOT' : 'WARP');
    arrow(ctx, LOCK_ARROW.x, LOCK_ARROW.y, LOCK_ARROW.angle, '#e879f9', L('lock', e.lockLit && blink), 'LOCK');
    insert(ctx, 318, 400, 7, '#a3e635', L('eb', e.rampCount === 4 && !e.extraBallAwarded && blink), 'EB');
    arrow(ctx, 76, 432, -0.75, '#38bdf8', L('orbit', e.spinner.speed > 0.5));

    // drop targets
    TARGETS.forEach((tg, i) => {
      insert(ctx, tg.x, tg.y + 16, 6, '#f97316', L(`target${i}`, !e.targets[i]), TARGET_LETTERS[i]);
      if (e.targets[i]) {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(tg.x - tg.hw, tg.y - 4, tg.hw * 2, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(tg.x - tg.hw, tg.y - 4, tg.hw * 2, 2);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(tg.x - tg.hw, tg.y - 1, tg.hw * 2, 2);
      }
    });

    // black hole saucer
    ctx.save();
    const holeLamp = L('hole', e.saucerFlash > 0 || (e.lockLit && Math.sin(time * 6) > 0));
    const glowA = 0.25 + 0.75 * holeLamp;
    const hole = ctx.createRadialGradient(SAUCER.x, SAUCER.y, 2, SAUCER.x, SAUCER.y, SAUCER.r + 8);
    hole.addColorStop(0, '#000');
    hole.addColorStop(0.55, '#000');
    hole.addColorStop(0.75, `rgba(217,70,239,${glowA})`);
    hole.addColorStop(1, 'rgba(217,70,239,0)');
    ctx.fillStyle = hole;
    ctx.beginPath();
    ctx.arc(SAUCER.x, SAUCER.y, SAUCER.r + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(SAUCER.x, SAUCER.y);
    ctx.rotate(time * (e.saucerFlash > 0 ? 9 : 2));
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.arc(0, 0, SAUCER.r + 1, 0, 1.2);
      ctx.strokeStyle = i === 0 ? '#fb923c' : '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    // spinner (a flat plate seen edge-on as it turns)
    const sh = Math.abs(Math.cos(e.spinner.angle)) * 7 + 1;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(SPINNER.x1 + 3, SPINNER.y - sh / 2, SPINNER.x2 - SPINNER.x1 - 6, sh);
    chrome(ctx, [{ x: SPINNER.x1, y: SPINNER.y }, { x: SPINNER.x2, y: SPINNER.y }], 1.2);

    // slingshot rubber flash
    KICKERS.forEach((k, i) => {
      const lv = L(`sling${i}`, e.slingFlash[i] > 0);
      if (lv <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = lv;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 14;
      poly(ctx, [k.a, k.b]);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    });

    // pop bumpers
    BUMPERS.forEach((b, i) => {
      const lv = L(`bumper${i}`, e.bumperFlash[i] > 0);
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = '#16a34a';
      ctx.fill();
      if (lv > 0.01) {
        ctx.shadowColor = rgba('#fde047', lv);
        ctx.shadowBlur = 24 * lv;
        ctx.fillStyle = rgba('#fde047', lv);
        ctx.fill();
      }
      ctx.restore();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.stroke();
      drawCow(ctx, b.x, b.y, b.r, this.cowAngles[i], lv > 0.4);
    });

    // flippers
    for (const f of e.flippers) {
      const tip = flipperTip(f);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(f.pivot.x, f.pivot.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = FLIPPER_R * 2 + 2;
      ctx.stroke();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = FLIPPER_R * 2 - 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(f.pivot.x, f.pivot.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
    }

    // gate flap
    chrome(ctx, [WALLS.find((s) => s.oneWay)!.a, WALLS.find((s) => s.oneWay)!.b], 1.5);

    // shooter-lane chevrons: chase upward while a ball waits on the plunger,
    // and fill to the plunger power while it's being pulled back
    const waiting = e.ballWaiting();
    const CHEVRONS = 8;
    const step = Math.floor(time * 11) % (CHEVRONS + 3); // a short pause at the top
    const lx = (LANE_L + LANE_R) / 2;
    for (let i = 0; i < CHEVRONS; i++) {
      const on = waiting && (e.charge > 0 ? i < Math.ceil(e.charge * CHEVRONS) : i === step);
      const lv = L(`chevron${i}`, on);
      const y = 668 - i * 40;
      const color = e.charge > 0 ? '#f97316' : '#22d3ee';
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lx - 10, y + 5);
      ctx.lineTo(lx, y - 5);
      ctx.lineTo(lx + 10, y + 5);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = rgba(color, GHOST);
      ctx.stroke();
      if (lv > 0.01) {
        ctx.shadowColor = rgba(color, lv);
        ctx.shadowBlur = 12 * lv;
        ctx.strokeStyle = rgba(color, lv);
        ctx.stroke();
      }
      ctx.restore();
    }

    // plunger
    const top = e.plungerTop();
    const cx = (LANE_L + LANE_R) / 2;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const coils = 7;
    const springTop = top + 8;
    const springBot = H - 4;
    for (let i = 0; i <= coils * 2; i++) {
      const y = springTop + ((springBot - springTop) * i) / (coils * 2);
      const x = cx + (i % 2 ? 7 : -7);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(LANE_L + 5, top, LANE_R - LANE_L - 10, 8);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(LANE_L + 5, top, LANE_R - LANE_L - 10, 2);

    if (e.charge > 0) {
      const mh = 130;
      const mx = LANE_L - 12;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(mx, PLUNGER_Y - mh, 6, mh);
      ctx.fillStyle = `hsl(${120 - e.charge * 120}, 85%, 55%)`;
      ctx.fillRect(mx, PLUNGER_Y - mh * e.charge, 6, mh * e.charge);
      if (e.skillActive && !e.skillLaunched) {
        // sweet zone that drops the ball into the U-F-O lanes
        const y0 = PLUNGER_Y - mh * SKILL_BAND[1];
        const y1 = PLUNGER_Y - mh * SKILL_BAND[0];
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(mx - 3, y0);
        ctx.lineTo(mx - 5, y0);
        ctx.lineTo(mx - 5, y1);
        ctx.lineTo(mx - 3, y1);
        ctx.stroke();
      }
    }

    // balls under the ramp, then the ramp, then balls riding it
    for (const b of e.balls) {
      if (b.mode === 'rail') continue;
      if (b.mode === 'held') {
        ctx.save();
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(time * 10);
        drawBall(ctx, b, 0.8);
        ctx.restore();
      } else drawBall(ctx, b);
    }
    ctx.drawImage(this.ramp, 0, 0, W, H);
    const rampGlow = L('rampGlow', e.rampFlash > 0 || e.jackpotFlash > 0);
    if (rampGlow > 0.01) {
      ctx.save();
      ctx.globalAlpha = rampGlow;
      ctx.shadowColor = e.jackpotFlash > 0 ? '#4ade80' : '#38bdf8';
      ctx.shadowBlur = 20;
      poly(ctx, RAMP_PATH);
      ctx.strokeStyle = e.jackpotFlash > 0 ? '#4ade80' : '#7dd3fc';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    for (const b of e.balls) if (b.mode === 'rail') drawBall(ctx, b, 1.12);

    // dome sheen
    ctx.save();
    ctx.beginPath();
    ctx.arc(DOME.x, DOME.y, DOME.r - 4, Math.PI * 1.08, Math.PI * 1.35);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // multiball "invasion" strobe
    if (e.multiball && e.jackpotFlash <= 0) {
      ctx.fillStyle = `rgba(74,222,128,${0.04 + 0.04 * Math.sin(time * 8)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}

// ---- dot-matrix display ------------------------------------------------------
const DW = 160;
const DH = 40;
const DOT = 4;
// Text layout below was tuned for a 32-row panel; scale it to DH.
const TS = DH / 32;

export class DotMatrix {
  private src: HTMLCanvasElement;
  private sctx: Ctx;
  private key = '';

  constructor() {
    this.src = document.createElement('canvas');
    this.src.width = DW;
    this.src.height = DH;
    this.sctx = this.src.getContext('2d', { willReadFrequently: true })!;
  }

  static readonly width = DW * DOT;
  static readonly height = DH * DOT;

  private fit(text: string, size: number, maxW: number) {
    const s = this.sctx;
    let px = size;
    do {
      s.font = `bold ${px}px Arial, sans-serif`;
      px--;
    } while (s.measureText(text).width > maxW && px > 6);
  }

  draw(canvas: HTMLCanvasElement, top: string, bottom?: string) {
    const key = `${top}|${bottom ?? ''}`;
    if (key === this.key) return;
    this.key = key;

    const s = this.sctx;
    s.fillStyle = '#000';
    s.fillRect(0, 0, DW, DH);
    s.fillStyle = '#fff';
    s.textAlign = 'center';
    s.textBaseline = 'middle';
    if (bottom) {
      this.fit(top, Math.round(15 * TS), DW - 4);
      s.fillText(top, DW / 2, 10 * TS);
      this.fit(bottom, Math.round(10 * TS), DW - 4);
      s.fillText(bottom, DW / 2, 25 * TS);
    } else {
      this.fit(top, Math.round(22 * TS), DW - 4);
      s.fillText(top, DW / 2, DH / 2 + 1);
    }
    const data = s.getImageData(0, 0, DW, DH).data;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0c0603';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const on = new Path2D();
    const off = new Path2D();
    const r = DOT * 0.4;
    for (let y = 0; y < DH; y++) {
      for (let x = 0; x < DW; x++) {
        const p = x * DOT + DOT / 2;
        const q = y * DOT + DOT / 2;
        const path = data[(y * DW + x) * 4] > 110 ? on : off;
        path.moveTo(p + r, q);
        path.arc(p, q, r, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = '#2a1407';
    ctx.fill(off);
    ctx.save();
    ctx.shadowColor = '#ff7a1a';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ff8c2a';
    ctx.fill(on);
    ctx.restore();
  }
}
