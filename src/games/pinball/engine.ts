import {
  BALL_R,
  BUMPERS,
  FLIPPER_LEN,
  FLIPPER_PIVOTS,
  FLIPPER_R,
  FLIPPER_REST,
  GRAVITY,
  H,
  KICKERS,
  LANE_EXIT_Y,
  LANE_L,
  LANE_TOP,
  LANE_X,
  OUTLANE_POSTS,
  PLUNGER_PULL,
  PLUNGER_Y,
  RAMP_APEX,
  RAMP_MOUTH,
  RAMP_PATH,
  RAMP_POSTS,
  SAUCER,
  SAUCER_EJECT,
  SPINNER,
  TARGETS,
  TOP_LANES,
  WALLS,
  type Vec,
} from './table';

export type SfxName =
  | 'flip'
  | 'flipDown'
  | 'bumper'
  | 'sling'
  | 'rollover'
  | 'laneComplete'
  | 'target'
  | 'targetBank'
  | 'targetReset'
  | 'spinner'
  | 'launch'
  | 'rampEnter'
  | 'ramp'
  | 'rampFail'
  | 'saucer'
  | 'kick'
  | 'lock'
  | 'multiball'
  | 'jackpot'
  | 'skill'
  | 'drain'
  | 'ballSave'
  | 'bonus'
  | 'extraBall'
  | 'wall'
  | 'start'
  | 'gameOver'
  | 'ready';

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  px: number;
  py: number;
  mode: 'free' | 'rail' | 'held';
  railS: number;
  railV: number;
  /** Time before the saucer may grab this ball again (just ejected). */
  noCapture: number;
  lastWallSfx: number;
}

export interface Flipper {
  pivot: Vec;
  rest: number;
  up: number;
  angle: number;
  omega: number;
}

interface Message {
  top: string;
  bottom?: string;
  until: number;
}

export const BALLS_PER_GAME = 3;
const SUBSTEPS = 12;
const MAX_SPEED = 1850;
const CHARGE_TIME = 2.5;
const LAUNCH_MIN = 895;
const LAUNCH_MAX = 1300;
const AUTO_LAUNCH = 1250;
const FLIPPER_UP_SPEED = 22;
const FLIPPER_DOWN_SPEED = 14;
const FLIPPER_BOUNCE = 0.25;
const BUMPER_KICK = 540;
const SLING_KICK = 490;
const RAIL_UP_ACC = 1050;
const RAIL_DOWN_ACC = 400;
const BALL_SAVE_TIME = 8;
const SKILL_SHOT = 10000;
const READY_REMINDER = 4; // seconds between "ball ready" reminder chimes
const SAUCER_MAX_FALL = 800; // px/s downward: falling faster than this skims over the black hole
/** Plunger charge range that drops the ball into the U-F-O lanes (marked on the meter). */
export const SKILL_BAND: [number, number] = [0.32, 0.45];

export const fmt = (n: number) => n.toLocaleString('en-US');

const closest = (p: Vec, a: Vec, b: Vec): Vec => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return { x: a.x + dx * t, y: a.y + dy * t };
};

// cumulative arc length along the ramp path
const RAMP_CUM = RAMP_PATH.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(p.x - RAMP_PATH[i - 1].x, p.y - RAMP_PATH[i - 1].y));
  return acc;
}, []);
const RAMP_LEN = RAMP_CUM[RAMP_CUM.length - 1];
const RAMP_APEX_S = RAMP_CUM[RAMP_APEX];

export const rampPoint = (s: number): Vec => {
  let i = 1;
  while (i < RAMP_CUM.length - 1 && RAMP_CUM[i] < s) i++;
  const a = RAMP_PATH[i - 1];
  const b = RAMP_PATH[i];
  const t = Math.max(0, Math.min(1, (s - RAMP_CUM[i - 1]) / (RAMP_CUM[i] - RAMP_CUM[i - 1])));
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

const newFlippers = (): [Flipper, Flipper] => [
  { pivot: FLIPPER_PIVOTS[0], rest: FLIPPER_REST, up: -FLIPPER_REST, angle: FLIPPER_REST, omega: 0 },
  {
    pivot: FLIPPER_PIVOTS[1],
    rest: Math.PI - FLIPPER_REST,
    up: Math.PI + FLIPPER_REST,
    angle: Math.PI - FLIPPER_REST,
    omega: 0,
  },
];

export const flipperTip = (f: Flipper): Vec => ({
  x: f.pivot.x + Math.cos(f.angle) * FLIPPER_LEN,
  y: f.pivot.y + Math.sin(f.angle) * FLIPPER_LEN,
});

/**
 * Physics + rules for the table. Pure logic: no DOM, no audio. The component
 * drives it with frame(dt) and hooks sound up through onSfx.
 */
export class PinballEngine {
  t = 0;
  state: 'idle' | 'play' | 'bonus' | 'over' = 'idle';
  balls: Ball[] = [];
  flippers = newFlippers();
  input = { left: false, right: false, launch: false };
  charge = 0;

  score = 0;
  ballNum = 1;
  bonus = 0;
  mult = 1;
  lanes = [false, false, false];
  laneFlash = 0;
  skillLane = 0;
  skillActive = false;
  skillLaunched = false;
  skillDeadline = 0;
  targets = [true, true, true];
  lockLit = false;
  locked = 0;
  multiball = false;
  jackpot = 25000;
  rampCount = 0;
  lastRampT = -99;
  extraBalls = 0;
  extraBallAwarded = false;
  ballSaveUntil = 0;
  saveArmed = false;
  spinner = { angle: 0, speed: 0, halfTurns: 0 };
  bumperFlash = [0, 0, 0];
  slingFlash = [0, 0];
  rampFlash = 0;
  saucerFlash = 0;
  jackpotFlash = 0;

  onSfx: (name: SfxName, amt?: number) => void = () => {};

  private pending = 0;
  private timers: { at: number; fn: () => void }[] = [];
  private nextId = 1;
  private message: Message | null = null;
  private skillTick = 0;
  private wasReady = false;
  private readyCueT = 0;

  // ---- lifecycle -----------------------------------------------------------
  start() {
    Object.assign(this, new PinballEngine(), { onSfx: this.onSfx });
    this.state = 'play';
    this.saveArmed = true;
    this.msg('BALL 1', 'GOOD LUCK', 2);
    this.sfx('start');
    this.queueServe(0.4, false);
  }

  private after(sec: number, fn: () => void) {
    this.timers.push({ at: this.t + sec, fn });
  }

  private msg(top: string, bottom?: string, sec = 2) {
    this.message = { top, bottom, until: this.t + sec };
  }

  private sfx(name: SfxName, amt = 1) {
    this.onSfx(name, amt);
  }

  private award(points: number, bonus = 0) {
    this.score += points;
    this.bonus += bonus;
  }

  // ---- input ---------------------------------------------------------------
  setFlipper(side: 0 | 1, down: boolean) {
    const key = side === 0 ? 'left' : 'right';
    if (this.input[key] === down) return;
    this.input[key] = down;
    if (this.state !== 'play') return;
    this.sfx(down ? 'flip' : 'flipDown');
    // lane change: rotate the lit U-F-O lanes
    if (down) {
      const l = this.lanes;
      this.lanes = side === 0 ? [l[1], l[2], l[0]] : [l[2], l[0], l[1]];
    }
  }

  setLaunch(down: boolean) {
    if (this.input.launch === down) return;
    this.input.launch = down;
    if (!down) this.launch();
  }

  releaseAll() {
    this.input.left = false;
    this.input.right = false;
    this.input.launch = false;
    this.charge = 0;
  }

  private laneBall() {
    return this.balls.find((b) => b.mode === 'free' && b.x > LANE_L && b.y > LANE_TOP);
  }

  /** A ball is sitting on the plunger, ready to be launched. */
  ballWaiting() {
    const b = this.laneBall();
    return this.state === 'play' && !!b && b.y >= this.plungerTop() - BALL_R - 3 && Math.abs(b.vy) < 60;
  }

  plungerTop() {
    return PLUNGER_Y + this.charge * PLUNGER_PULL;
  }

  private launch() {
    const b = this.laneBall();
    if (b && this.state === 'play' && b.y >= this.plungerTop() - BALL_R - 3) {
      b.vy = -(LAUNCH_MIN + this.charge * (LAUNCH_MAX - LAUNCH_MIN));
      this.sfx('launch', this.charge);
    }
    this.charge = 0;
  }

  // ---- ball supply -----------------------------------------------------------
  private addBall(x: number, y: number, vx = 0, vy = 0): Ball {
    const b: Ball = {
      id: this.nextId++,
      x,
      y,
      vx,
      vy,
      px: x,
      py: y,
      mode: 'free',
      railS: 0,
      railV: 0,
      noCapture: 0,
      lastWallSfx: 0,
    };
    this.balls.push(b);
    return b;
  }

  private queueServe(delay: number, auto: boolean) {
    this.pending++;
    this.after(delay, () => {
      this.pending--;
      const b = this.addBall(LANE_X, PLUNGER_Y - BALL_R);
      if (auto) {
        this.after(0.5, () => {
          if (this.balls.includes(b) && b.x > LANE_L && b.y > LANE_TOP) {
            b.vy = -AUTO_LAUNCH;
            this.sfx('launch', 0.7);
          }
        });
      } else {
        this.skillActive = true;
        this.skillLaunched = false;
      }
    });
  }

  private queueEject(delay: number) {
    this.pending++;
    this.after(delay, () => {
      this.pending--;
      const b = this.addBall(SAUCER.x, SAUCER.y);
      this.eject(b);
    });
  }

  private eject(b: Ball) {
    b.mode = 'free';
    // kicked back out toward the flippers
    const speed = 380 + Math.random() * 60;
    b.x = SAUCER.x + SAUCER_EJECT.x * 4;
    b.y = SAUCER.y + SAUCER_EJECT.y * 4;
    b.vx = SAUCER_EJECT.x * speed;
    b.vy = SAUCER_EJECT.y * speed;
    b.noCapture = this.t + 0.6;
    this.saucerFlash = 0.3;
    this.sfx('kick');
  }

  // ---- rules ---------------------------------------------------------------
  private onLeaveLane() {
    if (this.saveArmed) {
      this.saveArmed = false;
      this.ballSaveUntil = this.t + BALL_SAVE_TIME;
    }
    if (this.skillActive && !this.skillLaunched) {
      this.skillLaunched = true;
      this.skillDeadline = this.t + 4;
    }
  }

  private endSkill() {
    if (this.skillActive && this.skillLaunched) this.skillActive = false;
  }

  private onTopLane(i: number) {
    this.sfx('rollover');
    this.award(500, 50);
    if (this.skillActive && this.skillLaunched) {
      this.skillActive = false;
      if (i === this.skillLane) {
        this.award(SKILL_SHOT, 1000);
        this.msg('SKILL SHOT!', fmt(SKILL_SHOT), 2.5);
        this.sfx('skill');
      } else {
        this.award(2500, 250);
        this.msg('NICE PLUNGE', fmt(2500), 1.5);
      }
    }
    if (this.lanes[i]) return;
    this.lanes[i] = true;
    if (this.lanes.every(Boolean)) {
      this.lanes = [false, false, false];
      this.laneFlash = 1.2;
      this.mult = Math.min(5, this.mult + 1);
      this.award(2000, 200);
      this.msg('U.F.O. COMPLETE', `BONUS ${this.mult}X`, 2);
      this.sfx('laneComplete');
    }
  }

  private onTarget(i: number) {
    this.targets[i] = false;
    this.award(750, 75);
    this.sfx('target');
    if (this.targets.some(Boolean)) return;
    this.award(5000, 500);
    this.sfx('targetBank');
    if (!this.multiball && this.locked < 2) {
      this.lockLit = true;
      this.msg('LOCK IS LIT', 'SHOOT THE BLACK HOLE', 2.5);
    } else {
      this.msg('ZAP!', fmt(5000), 2);
    }
    this.after(1.5, () => {
      this.targets = [true, true, true];
      this.sfx('targetReset');
    });
  }

  private onSaucer(b: Ball) {
    b.mode = 'held';
    b.x = SAUCER.x;
    b.y = SAUCER.y;
    b.vx = 0;
    b.vy = 0;
    this.saucerFlash = 1;
    this.sfx('saucer');
    this.endSkill();

    if (this.lockLit && !this.multiball) {
      this.lockLit = false;
      this.locked++;
      this.balls = this.balls.filter((x) => x !== b);
      this.award(5000, 500);
      this.sfx('lock');
      if (this.locked >= 2) {
        this.startMultiball();
      } else {
        this.msg(`BALL ${this.locked} LOCKED`, 'LOST IN THE BLACK HOLE', 2.5);
        this.queueServe(1.4, false);
      }
      return;
    }

    this.award(1000, 100);
    this.msg('BLACK HOLE', fmt(1000), 1.2);
    this.after(1.1, () => {
      if (this.balls.includes(b)) this.eject(b);
    });
  }

  private startMultiball() {
    this.locked = 0;
    this.multiball = true;
    this.ballSaveUntil = this.t + 12;
    this.msg('INVASION', 'MULTIBALL!', 3);
    this.sfx('multiball');
    this.queueServe(0.8, true);
    this.queueEject(1.6);
    this.queueEject(2.5);
  }

  private onRampComplete() {
    this.rampCount++;
    this.rampFlash = 1;
    if (this.multiball) {
      this.award(this.jackpot, 1000);
      this.msg('JACKPOT!', fmt(this.jackpot), 2.5);
      this.sfx('jackpot');
      this.jackpotFlash = 1.5;
      this.jackpot += 10000;
    } else {
      const combo = this.t - this.lastRampT < 5;
      const pts = combo ? 7500 : 2500;
      this.award(pts, 250);
      this.msg(combo ? 'WARP COMBO!' : 'WARP RAMP', fmt(pts), 1.6);
      this.sfx('ramp');
    }
    this.lastRampT = this.t;
    if (this.rampCount === 5 && !this.extraBallAwarded) {
      this.extraBallAwarded = true;
      this.extraBalls++;
      this.after(1.2, () => {
        this.msg('EXTRA BALL!', 'SHOOT AGAIN', 2.5);
        this.sfx('extraBall');
      });
    }
  }

  private onDrain() {
    if (this.t < this.ballSaveUntil) {
      this.msg('BALL SAVED', "DON'T MOVE", 1.5);
      this.sfx('ballSave');
      this.queueServe(0.6, true);
      return;
    }
    const live = this.balls.length + this.pending;
    if (this.multiball && live <= 1) {
      this.multiball = false;
      this.msg('MULTIBALL OVER', `JACKPOT ${fmt(this.jackpot)}`, 2);
    }
    if (live > 0) return;
    this.sfx('drain');
    this.endBall();
  }

  private endBall() {
    this.state = 'bonus';
    this.releaseAll();
    this.skillActive = false;
    const bonus = this.bonus;
    const mult = this.mult;
    this.after(0.9, () => {
      this.msg('BONUS', `${fmt(bonus)} X ${mult}`, 1.6);
      this.sfx('bonus');
    });
    this.after(2.5, () => {
      this.score += bonus * mult;
      this.msg('TOTAL BONUS', fmt(bonus * mult), 1.4);
      this.sfx('bonus');
    });
    this.after(4, () => this.nextBall());
  }

  private nextBall() {
    this.bonus = 0;
    this.mult = 1;
    this.lanes = [false, false, false];
    if (this.extraBalls > 0) {
      this.extraBalls--;
      this.msg('SHOOT AGAIN', `BALL ${this.ballNum}`, 2);
      this.sfx('extraBall');
    } else {
      this.ballNum++;
      if (this.ballNum > BALLS_PER_GAME) {
        this.ballNum = BALLS_PER_GAME;
        this.state = 'over';
        this.message = null;
        this.sfx('gameOver');
        return;
      }
      this.msg(`BALL ${this.ballNum}`, undefined, 1.5);
    }
    this.state = 'play';
    this.saveArmed = true;
    this.queueServe(0.3, false);
  }

  // ---- per-frame -------------------------------------------------------------
  frame(dtRaw: number) {
    if (this.state === 'idle' || this.state === 'over') return;
    const dt = Math.min(dtRaw, 1 / 30);
    this.t += dt;

    if (this.input.launch && this.laneBall()) this.charge = Math.min(1, this.charge + dt / CHARGE_TIME);

    // skill-shot lane cycles until the ball is plunged
    const waiting = this.skillActive && !this.skillLaunched && this.laneBall();
    if (waiting) {
      this.skillTick += dt;
      if (this.skillTick > 0.45) {
        this.skillTick = 0;
        this.skillLane = (this.skillLane + 1) % 3;
      }
    }
    if (this.skillActive && this.skillLaunched && this.t > this.skillDeadline) this.skillActive = false;

    // audio cue when a ball settles on the plunger for the player to shoot
    // (not for auto-launched balls), with a gentle reminder while it waits
    const ready = this.ballWaiting() && this.skillActive && !this.skillLaunched && this.charge === 0;
    if (ready && (!this.wasReady || this.t - this.readyCueT > READY_REMINDER)) {
      this.readyCueT = this.t;
      this.sfx('ready', this.wasReady ? 0.5 : 1);
    }
    this.wasReady = ready;

    const h = dt / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) this.step(h);

    // spinner: every half turn scores
    const sp = this.spinner;
    if (sp.speed > 0) {
      sp.angle += sp.speed * Math.PI * 2 * dt;
      sp.speed = Math.max(0, sp.speed - 2.5 * dt);
      const half = Math.floor(sp.angle / Math.PI);
      while (sp.halfTurns < half) {
        sp.halfTurns++;
        this.award(100, 10);
        this.sfx('spinner');
      }
    }

    const decay = (x: number) => Math.max(0, x - dt);
    this.bumperFlash = this.bumperFlash.map(decay);
    this.slingFlash = this.slingFlash.map(decay);
    this.rampFlash = decay(this.rampFlash);
    this.saucerFlash = decay(this.saucerFlash);
    this.laneFlash = decay(this.laneFlash);
    this.jackpotFlash = decay(this.jackpotFlash);

    const drained = this.balls.filter((b) => b.mode === 'free' && b.y - BALL_R > H + 10);
    if (drained.length) {
      this.balls = this.balls.filter((b) => !drained.includes(b));
      for (let i = 0; i < drained.length; i++) this.onDrain();
    }

    const due = this.timers.filter((tm) => tm.at <= this.t);
    if (due.length) {
      this.timers = this.timers.filter((tm) => tm.at > this.t);
      for (const tm of due) tm.fn();
    }
    if (this.message && this.t > this.message.until) this.message = null;
  }

  private step(dt: number) {
    const active = this.state === 'play';
    this.flippers.forEach((f, i) => {
      const pressed = active && (i === 0 ? this.input.left : this.input.right);
      const target = pressed ? f.up : f.rest;
      const speed = (pressed ? FLIPPER_UP_SPEED : FLIPPER_DOWN_SPEED) * dt;
      const prev = f.angle;
      const diff = target - f.angle;
      f.angle += Math.abs(diff) <= speed ? diff : Math.sign(diff) * speed;
      f.omega = (f.angle - prev) / dt;
    });

    for (const b of this.balls) {
      if (b.mode === 'rail') this.stepRail(b, dt);
      else if (b.mode === 'free') this.stepBall(b, dt);
    }

    // ball-to-ball
    const free = this.balls.filter((b) => b.mode === 'free');
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        const a = free[i];
        const c = free[j];
        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d >= BALL_R * 2 || d === 0) continue;
        const nx = dx / d;
        const ny = dy / d;
        const push = (BALL_R * 2 - d) / 2;
        a.x -= nx * push;
        a.y -= ny * push;
        c.x += nx * push;
        c.y += ny * push;
        const vn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
        if (vn < 0) {
          const j2 = (-(1 + 0.9) * vn) / 2;
          a.vx -= j2 * nx;
          a.vy -= j2 * ny;
          c.vx += j2 * nx;
          c.vy += j2 * ny;
        }
      }
    }
  }

  private stepRail(b: Ball, dt: number) {
    b.railV += (b.railS < RAMP_APEX_S ? -RAIL_UP_ACC : RAIL_DOWN_ACC) * dt;
    b.railS += b.railV * dt;
    if (b.railS <= 0 && b.railV < 0) {
      // not enough speed: rolls back down out of the mouth
      b.mode = 'free';
      b.x = RAMP_PATH[0].x + (Math.random() - 0.5) * 6;
      b.y = RAMP_MOUTH.y + BALL_R + 2;
      b.vx = (Math.random() - 0.5) * 60;
      b.vy = Math.min(600, -b.railV * 0.8);
      b.px = b.x;
      b.py = b.y;
      this.sfx('rampFail');
      return;
    }
    if (b.railS >= RAMP_LEN) {
      const n = RAMP_PATH.length;
      const end = RAMP_PATH[n - 1];
      const prev = RAMP_PATH[n - 2];
      const len = Math.hypot(end.x - prev.x, end.y - prev.y);
      const speed = Math.min(b.railV, 420);
      b.mode = 'free';
      b.x = end.x;
      b.y = end.y;
      b.px = b.x;
      b.py = b.y;
      b.vx = ((end.x - prev.x) / len) * speed;
      b.vy = ((end.y - prev.y) / len) * speed;
      this.onRampComplete();
      return;
    }
    const p = rampPoint(b.railS);
    b.x = p.x;
    b.y = p.y;
  }

  private hitSeg(b: Ball, a: Vec, c: Vec, bounce: number, radius = BALL_R) {
    const p = closest(b, a, c);
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    const d2 = dx * dx + dy * dy;
    if (d2 >= radius * radius || d2 === 0) return null;
    const d = Math.sqrt(d2);
    const nx = dx / d;
    const ny = dy / d;
    b.x = p.x + nx * radius;
    b.y = p.y + ny * radius;
    const vn = b.vx * nx + b.vy * ny;
    if (vn < 0) {
      b.vx -= (1 + bounce) * vn * nx;
      b.vy -= (1 + bounce) * vn * ny;
    }
    return { nx, ny, impact: Math.max(0, -vn), px: p.x, py: p.y };
  }

  private stepBall(b: Ball, dt: number) {
    b.px = b.x;
    b.py = b.y;
    b.vy += GRAVITY * dt;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > MAX_SPEED) {
      b.vx *= MAX_SPEED / sp;
      b.vy *= MAX_SPEED / sp;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // walls
    for (const s of WALLS) {
      if (s.oneWay && (b.x - s.a.x) * s.oneWay.x + (b.y - s.a.y) * s.oneWay.y < 0) continue;
      const hit = this.hitSeg(b, s.a, s.b, s.bounce);
      if (hit && hit.impact > 280 && this.t - b.lastWallSfx > 0.06) {
        b.lastWallSfx = this.t;
        this.sfx('wall', Math.min(1, hit.impact / 1200));
      }
    }

    // posts at the ramp mouth
    for (const p of RAMP_POSTS) this.hitCircle(b, p.x, p.y, p.r, 0.6);

    // outlane guard posts: lively rubber
    for (const p of OUTLANE_POSTS) {
      const hit = this.hitCircle(b, p.x, p.y, p.r, 0.85);
      if (hit) this.sfx('wall', 0.6);
    }

    // pop bumpers
    BUMPERS.forEach((bp, i) => {
      const hit = this.hitCircle(b, bp.x, bp.y, bp.r, 0);
      if (!hit) return;
      b.vx += hit.nx * BUMPER_KICK;
      b.vy += hit.ny * BUMPER_KICK;
      this.bumperFlash[i] = 0.15;
      this.award(100, 10);
      this.sfx('bumper');
      this.endSkill();
    });

    // slingshots
    KICKERS.forEach((k, i) => {
      if ((b.x - k.a.x) * k.n.x + (b.y - k.a.y) * k.n.y < 0) return;
      const hit = this.hitSeg(b, k.a, k.b, 0.5);
      if (!hit) return;
      if (hit.impact > 40 && this.slingFlash[i] <= 0) {
        b.vx += k.n.x * SLING_KICK * (1 + Math.random() * 0.1);
        b.vy += k.n.y * SLING_KICK * (1 + Math.random() * 0.1);
        this.slingFlash[i] = 0.12;
        this.award(50, 5);
        this.sfx('sling');
      }
    });

    // drop targets
    TARGETS.forEach((tg, i) => {
      if (!this.targets[i]) return;
      const hit = this.hitSeg(b, { x: tg.x - tg.hw, y: tg.y }, { x: tg.x + tg.hw, y: tg.y }, 0.5);
      if (hit) this.onTarget(i);
    });

    // flippers: a moving capsule, surface velocity transfers to the ball
    for (const f of this.flippers) {
      const tip = flipperTip(f);
      const c = closest(b, f.pivot, tip);
      const dx = b.x - c.x;
      const dy = b.y - c.y;
      const d = Math.hypot(dx, dy);
      const minD = BALL_R + FLIPPER_R;
      if (d >= minD || d === 0) continue;
      const nx = dx / d;
      const ny = dy / d;
      b.x = c.x + nx * minD;
      b.y = c.y + ny * minD;
      const svx = -f.omega * (c.y - f.pivot.y);
      const svy = f.omega * (c.x - f.pivot.x);
      const vn = (b.vx - svx) * nx + (b.vy - svy) * ny;
      if (vn < 0) {
        b.vx -= (1 + FLIPPER_BOUNCE) * vn * nx;
        b.vy -= (1 + FLIPPER_BOUNCE) * vn * ny;
      }
      if (f.omega !== 0) this.endSkill();
    }

    // plunger is the lane floor
    if (b.x > LANE_L && b.y > LANE_TOP) {
      const top = this.plungerTop();
      if (b.y + BALL_R > top) {
        b.y = top - BALL_R;
        if (b.vy > 0) b.vy = -b.vy * 0.15;
        b.vx = 0;
      }
    }

    // ---- sensors (line crossings between previous and current position) ----
    const crossed = (y: number) => (b.py - y) * (b.y - y) <= 0 && b.py !== b.y;

    if (b.x > LANE_L && crossed(LANE_EXIT_Y) && b.vy < 0) this.onLeaveLane();

    TOP_LANES.forEach((ln, i) => {
      if (b.x > ln.x1 && b.x < ln.x2 && crossed(ln.y)) this.onTopLane(i);
    });

    if (b.x > SPINNER.x1 && b.x < SPINNER.x2 && crossed(SPINNER.y)) {
      this.spinner.speed = Math.max(this.spinner.speed, Math.min(9, Math.abs(b.vy) / 90));
    }

    if (b.x > RAMP_MOUTH.x1 && b.x < RAMP_MOUTH.x2 && b.py > RAMP_MOUTH.y && b.y <= RAMP_MOUTH.y && b.vy < -120) {
      b.mode = 'rail';
      b.railS = 0;
      b.railV = Math.min(1700, -b.vy);
      this.sfx('rampEnter');
      this.endSkill();
      return;
    }

    // the black hole only grabs balls shot up into it (or rolling slowly); a ball
    // dropping onto it from above, e.g. a plunge falling off the dome, skims over
    const intoHole = b.vy < SAUCER_MAX_FALL && sp < 1100; // nickhere
    if (this.t > b.noCapture && intoHole && Math.hypot(b.x - SAUCER.x, b.y - SAUCER.y) < SAUCER.r - 2) {
      this.onSaucer(b);
    }
  }

  private hitCircle(b: Ball, x: number, y: number, r: number, bounce: number) {
    const dx = b.x - x;
    const dy = b.y - y;
    const d = Math.hypot(dx, dy);
    if (d >= r + BALL_R || d === 0) return null;
    const nx = dx / d;
    const ny = dy / d;
    b.x = x + nx * (r + BALL_R);
    b.y = y + ny * (r + BALL_R);
    const vn = b.vx * nx + b.vy * ny;
    if (vn < 0) {
      b.vx -= (1 + bounce) * vn * nx;
      b.vy -= (1 + bounce) * vn * ny;
    }
    return { nx, ny };
  }

  // ---- read-outs for the renderer / DMD / audio ------------------------------
  ballSaveActive() {
    return this.state === 'play' && this.t < this.ballSaveUntil;
  }

  /** Fastest free ball on the playfield (drives the rolling sound). */
  rollSpeed() {
    let m = 0;
    for (const b of this.balls) if (b.mode === 'free' && b.x < LANE_L) m = Math.max(m, Math.hypot(b.vx, b.vy));
    return m;
  }

  onRail() {
    return this.balls.some((b) => b.mode === 'rail');
  }

  dmd(best: number): { top: string; bottom?: string } {
    if (this.message) return this.message;
    if (this.state === 'idle') return { top: 'UFO INVASION', bottom: best ? `HIGH SCORE ${fmt(best)}` : 'PRESS START' };
    if (this.state === 'over') return { top: 'GAME OVER', bottom: fmt(this.score) };
    let bottom = `BALL ${this.ballNum}`;
    if (this.multiball) bottom += '  MULTIBALL';
    else if (this.skillActive && !this.skillLaunched && this.laneBall()) bottom = 'SKILL SHOT: ' + 'UFO'[this.skillLane];
    else if (this.lockLit) bottom += '  LOCK LIT';
    else if (this.locked) bottom += `  LOCKED ${this.locked}`;
    return { top: fmt(this.score), bottom };
  }
}
