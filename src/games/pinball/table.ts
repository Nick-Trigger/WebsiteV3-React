// Table geometry for "UFO Invasion". All units are logical canvas px.

export const W = 440;
export const H = 760;
export const BALL_R = 10;
export const GRAVITY = 800; // px/s^2 down the (tilted) table

/** Playfield centre line (the plunger lane eats the right edge). */
export const MID = 204;
const mx = (x: number) => 2 * MID - x;

// plunger lane
export const LANE_L = 398;
export const LANE_R = 430;
export const LANE_X = (LANE_L + LANE_R) / 2;
export const LANE_TOP = 240; // top of the lane separator / one-way gate
export const PLUNGER_Y = 720;
export const PLUNGER_PULL = 34;

export type Vec = { x: number; y: number };
export interface Seg {
  a: Vec;
  b: Vec;
  bounce: number;
  /** Solid only when the ball is on this side (one-way gate). */
  oneWay?: Vec;
}
export interface Circle {
  x: number;
  y: number;
  r: number;
}
export interface Kicker {
  a: Vec;
  b: Vec;
  /** Direction the slingshot fires. */
  n: Vec;
}

const v = (x: number, y: number): Vec => ({ x, y });

export const DOME = { x: 220, y: 215, r: 210 };

// flippers
export const FLIPPER_LEN = 50;
export const FLIPPER_R = 7;
export const FLIPPER_REST = 0.5;
export const FLIPPER_PIVOTS: [Vec, Vec] = [v(134, 680), v(mx(134), 680)];

// slingshot triangles (A top, B bottom-outer, C bottom-inner); right side mirrors the left
const SLING_L = { A: v(78, 530), B: v(78, 588), C: v(118, 622) };
const SLING_R = { A: v(mx(78), 530), B: v(mx(78), 588), C: v(mx(118), 622) };
export const SLINGS = [SLING_L, SLING_R];

const unit = (x: number, y: number) => {
  const l = Math.hypot(x, y);
  return v(x / l, y / l);
};

export const KICKERS: Kicker[] = [
  { a: SLING_L.C, b: SLING_L.A, n: unit(-(SLING_L.A.y - SLING_L.C.y), SLING_L.A.x - SLING_L.C.x) },
  { a: SLING_R.C, b: SLING_R.A, n: unit(SLING_R.A.y - SLING_R.C.y, -(SLING_R.A.x - SLING_R.C.x)) },
];

// pop bumpers: a tight triangle right under the U-F-O lanes
export const BUMPERS: Circle[] = [
  { x: MID - 28, y: 158, r: 15 },
  { x: MID + 28, y: 158, r: 15 },
  { x: MID, y: 202, r: 15 },
];

// top rollover lanes (U-F-O), separated by guides, centred on the playfield
export const LANE_GUIDES_X = [MID - 63, MID - 21, MID + 21, MID + 63];
export const LANE_GUIDE_Y: [number, number] = [88, 122];
export const TOP_LANES = [0, 1, 2].map((i) => ({
  x1: LANE_GUIDES_X[i] + 3,
  x2: LANE_GUIDES_X[i + 1] - 3,
  y: 105,
  cx: (LANE_GUIDES_X[i] + LANE_GUIDES_X[i + 1]) / 2,
}));
export const LANE_LETTERS = ['U', 'F', 'O'];

// outlane guards: a short rubber ramp off each side wall ending in a rubber
// post, so a ball sliding down the wall is kicked back toward the inlane
// instead of dropping straight into the outlane
const GUARD_L = { a: v(11, 480), b: v(32, 510) };
export const OUTLANE_GUARDS = [GUARD_L, { a: v(mx(GUARD_L.a.x), GUARD_L.a.y), b: v(mx(GUARD_L.b.x), GUARD_L.b.y) }];
export const OUTLANE_POSTS: Circle[] = OUTLANE_GUARDS.map((g) => ({ x: g.b.x, y: g.b.y, r: 5 }));

// drop targets (Z-A-P)
export const TARGETS = [180, 204, 228].map((x) => ({ x, y: 318, hw: 10 }));
export const TARGET_LETTERS = ['Z', 'A', 'P'];

// the "black hole" saucer (upper left): holds the ball, or locks it for multiball
export const SAUCER = { x: 100, y: 200, r: 18 };
/** Direction the saucer kicks the ball back out: down-right, toward the flippers. */
export const SAUCER_EJECT = unit(0.36, 0.73);
/** LOCK insert: just below the hole, pointing at it. */
export const LOCK_ARROW = {
  x: SAUCER.x + SAUCER_EJECT.x * 48,
  y: SAUCER.y + SAUCER_EJECT.y * 48,
  angle: Math.atan2(-SAUCER_EJECT.x, SAUCER_EJECT.y),
};

// left orbit lane + spinner
export const ORBIT_WALL: [Vec, Vec] = [v(50, 262), v(50, 420)];
export const SPINNER = { x1: 10, x2: 50, y: 370 };
// Curved wall after exit that stops orbit exit balls from falling into the outlane
export const ORBIT_EXIT: Vec[] = [v(10, 395), v(16, 425), v(28, 447), v(46, 462), v(70, 470)];

// warp ramp: mouth between two posts, then an elevated path to the right inlane
export const RAMP_POSTS: Circle[] = [
  { x: 258, y: 350, r: 5 },
  { x: 312, y: 350, r: 5 },
];
export const RAMP_MOUTH = { x1: 264, x2: 306, y: 350 };
/** Shape of the ramp; the actual path is a smooth curve through these. */
const RAMP_CTRL: Vec[] = [
  v(285, 350),
  v(287, 300),
  v(292, 250),
  v(302, 210),
  v(318, 185),
  v(340, 176),
  v(360, 188),
  v(370, 215),
  v(372, 280),
  v(371, 380),
  v(366, 450),
  v(357, 500),
  v(348, 538),
];

/** Catmull-Rom curve through the points, `steps` samples per span. */
const smooth = (pts: Vec[], steps: number): Vec[] => {
  const out: Vec[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push(v(f(p0.x, p1.x, p2.x, p3.x), f(p0.y, p1.y, p2.y, p3.y)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

const RAMP_STEPS = 8;
export const RAMP_PATH: Vec[] = smooth(RAMP_CTRL, RAMP_STEPS);
export const RAMP_APEX = 5 * RAMP_STEPS; // uphill before this point, downhill after
/** Plastic ramp up to here, wire habitrail after. */
export const RAMP_PLASTIC_END = 6 * RAMP_STEPS;

const seg = (a: Vec, b: Vec, bounce = 0.45): Seg => ({ a, b, bounce });

export const WALLS: Seg[] = (() => {
  const walls: Seg[] = [];
  const n = 36;
  for (let i = 0; i < n; i++) {
    const t0 = Math.PI + (i / n) * Math.PI;
    const t1 = Math.PI + ((i + 1) / n) * Math.PI;
    walls.push(
      seg(
        v(DOME.x + Math.cos(t0) * DOME.r, DOME.y + Math.sin(t0) * DOME.r),
        v(DOME.x + Math.cos(t1) * DOME.r, DOME.y + Math.sin(t1) * DOME.r),
      ),
    );
  }
  walls.push(seg(v(10, DOME.y), v(10, H + 40))); // left wall
  walls.push(seg(v(LANE_R, DOME.y), v(LANE_R, H))); // cabinet right wall
  walls.push(seg(v(LANE_L, LANE_TOP), v(LANE_L, H))); // lane separator

  // one-way gate: the ball can leave the plunger lane but not fall back in
  const ga = v(LANE_L, LANE_TOP);
  const gb = v(LANE_R, LANE_TOP - 24);
  walls.push({ ...seg(ga, gb), oneWay: unit(gb.y - ga.y, -(gb.x - ga.x)) });

  walls.push(seg(ORBIT_WALL[0], ORBIT_WALL[1]));
  // for (let i = 1; i < ORBIT_EXIT.length; i++) walls.push(seg(ORBIT_EXIT[i - 1], ORBIT_EXIT[i], 0.3));
  for (const x of LANE_GUIDES_X) walls.push(seg(v(x, LANE_GUIDE_Y[0]), v(x, LANE_GUIDE_Y[1]), 0.6));

  for (const g of OUTLANE_GUARDS) walls.push(seg(g.a, g.b, 1));

  // outlane dividers + inlane guides
  walls.push(seg(v(44, 548), v(44, 600)));
  walls.push(seg(v(44, 600), v(130, 666)));
  walls.push(seg(v(mx(44), 548), v(mx(44), 600)));
  walls.push(seg(v(mx(44), 600), v(mx(130), 666)));

  // passive slingshot edges (the kicking face is in KICKERS)
  for (const s of SLINGS) {
    walls.push(seg(s.A, s.B, 0.6));
    walls.push(seg(s.B, s.C, 0.6));
  }
  return walls;
})();

// sensors
export const LANE_EXIT_Y = LANE_TOP - 4;
