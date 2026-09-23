import type { SfxName } from './engine';

type Osc = OscillatorType;
interface ToneOpts {
  type?: Osc;
  gain?: number;
  to?: number;
  delay?: number;
  attack?: number;
}
interface NoiseOpts {
  freq?: number;
  q?: number;
  type?: BiquadFilterType;
  gain?: number;
  delay?: number;
}

const MASTER = 0.55;

/**
 * Every sound is synthesised with the Web Audio API (no sample files): short
 * filtered-noise bursts for the mechanical clacks, pitched envelopes for the
 * electronic bits, and two looping noise beds for the ball rolling on wood and
 * rattling along the metal wire ramp.
 */
export class PinballSound {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private noiseBuf!: AudioBuffer;
  private rollGain!: GainNode;
  private rollFilter!: BiquadFilterNode;
  private railGain!: GainNode;
  muted = false;

  /** Create / resume the context. Call from a user gesture. */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : MASTER;
      this.master.connect(ctx.destination);

      const len = ctx.sampleRate * 2;
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

      // rolling ball: low rumble
      const roll = ctx.createBufferSource();
      roll.buffer = this.noiseBuf;
      roll.loop = true;
      this.rollFilter = ctx.createBiquadFilter();
      this.rollFilter.type = 'lowpass';
      this.rollFilter.frequency.value = 220;
      this.rollGain = ctx.createGain();
      this.rollGain.gain.value = 0;
      roll.connect(this.rollFilter).connect(this.rollGain).connect(this.master);
      roll.start();

      // wire ramp: metallic rattle
      const rail = ctx.createBufferSource();
      rail.buffer = this.noiseBuf;
      rail.loop = true;
      const railF = ctx.createBiquadFilter();
      railF.type = 'bandpass';
      railF.frequency.value = 3200;
      railF.Q.value = 6;
      this.railGain = ctx.createGain();
      this.railGain.gain.value = 0;
      rail.connect(railF).connect(this.railGain).connect(this.master);
      rail.start();
    }
    void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : MASTER, this.ctx.currentTime, 0.02);
  }

  /** Continuous sounds: rolling speed (px/s) and whether a ball is on the wire ramp. */
  setAmbient(rollSpeed: number, onRail: boolean) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const r = Math.min(1, rollSpeed / 1600);
    this.rollGain.gain.setTargetAtTime(r * 0.35, now, 0.05);
    this.rollFilter.frequency.setTargetAtTime(160 + r * 260, now, 0.05);
    this.railGain.gain.setTargetAtTime(onRail ? 0.22 : 0, now, 0.04);
  }

  silence() {
    this.setAmbient(0, false);
  }

  private tone(freq: number, dur: number, o: ToneOpts = {}) {
    const ctx = this.ctx!;
    const t0 = ctx.currentTime + (o.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(o.gain ?? 0.15, t0 + (o.attack ?? 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, o: NoiseOpts = {}) {
    const ctx = this.ctx!;
    const t0 = ctx.currentTime + (o.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = o.type ?? 'bandpass';
    f.frequency.value = o.freq ?? 1000;
    f.Q.value = o.q ?? 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.gain ?? 0.3, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t0, Math.random() * 1.5);
    src.stop(t0 + dur + 0.05);
  }

  private arp(notes: number[], step: number, o: ToneOpts = {}) {
    notes.forEach((n, i) => this.tone(n, step * 1.6, { ...o, delay: (o.delay ?? 0) + i * step }));
  }

  play(name: SfxName, amt = 1) {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'flip':
        this.noise(0.07, { freq: 900, type: 'lowpass', gain: 0.55 });
        this.tone(150, 0.07, { gain: 0.12, to: 60 });
        break;
      case 'flipDown':
        this.noise(0.05, { freq: 500, type: 'lowpass', gain: 0.25 });
        break;
      case 'bumper':
        this.tone(620, 0.13, { gain: 0.14, to: 140 });
        this.tone(1240, 0.08, { type: 'triangle', gain: 0.08, to: 420 });
        this.noise(0.05, { freq: 2200, gain: 0.3 });
        break;
      case 'sling':
        this.tone(900, 0.09, { gain: 0.12, to: 240 });
        this.noise(0.05, { freq: 3000, gain: 0.3 });
        break;
      case 'rollover':
        this.tone(1318, 0.06, { type: 'sine', gain: 0.16 });
        this.tone(1760, 0.09, { type: 'sine', gain: 0.16, delay: 0.06 });
        break;
      case 'laneComplete':
        this.arp([659, 784, 988, 1319, 1568], 0.07, { gain: 0.1 });
        break;
      case 'target':
        this.noise(0.04, { freq: 4000, type: 'highpass', gain: 0.35 });
        this.tone(240, 0.07, { gain: 0.1, to: 110 });
        break;
      case 'targetBank':
        this.arp([523, 659, 784, 1047, 1319], 0.06, { type: 'triangle', gain: 0.18 });
        break;
      case 'targetReset':
        this.noise(0.1, { freq: 400, type: 'lowpass', gain: 0.45 });
        this.tone(110, 0.1, { gain: 0.1, to: 70 });
        break;
      case 'spinner':
        this.tone(2600, 0.018, { gain: 0.05 });
        break;
      case 'launch':
        this.noise(0.2, { freq: 700, type: 'lowpass', gain: 0.35 + 0.45 * amt });
        this.tone(100, 0.2, { type: 'sine', gain: 0.3, to: 40 });
        break;
      case 'rampEnter':
        this.tone(280, 0.35, { type: 'sawtooth', gain: 0.05, to: 900 });
        break;
      case 'ramp':
        this.arp([392, 523, 659, 784], 0.08, { gain: 0.1 });
        break;
      case 'rampFail':
        this.tone(500, 0.4, { type: 'sawtooth', gain: 0.05, to: 140 });
        break;
      case 'saucer':
        this.tone(70, 0.45, { type: 'sine', gain: 0.4, to: 32 });
        this.tone(1400, 0.7, { type: 'triangle', gain: 0.06, to: 120 });
        break;
      case 'kick':
        this.noise(0.09, { freq: 500, type: 'lowpass', gain: 0.55 });
        this.tone(130, 0.1, { gain: 0.14, to: 50 });
        break;
      case 'lock':
        this.arp([196, 247, 294, 392, 494], 0.11, { type: 'sawtooth', gain: 0.08, delay: 0.2 });
        break;
      case 'multiball':
        for (let i = 0; i < 4; i++) this.tone(380, 0.35, { type: 'sawtooth', gain: 0.07, to: 1250, delay: i * 0.35 });
        this.arp([523, 659, 784, 1047, 1319, 1568], 0.08, { gain: 0.1, delay: 1.45 });
        break;
      case 'jackpot':
        this.arp([523, 659, 784, 1047, 784, 1047, 1319, 1568, 2093], 0.065, { gain: 0.12 });
        this.noise(0.8, { freq: 7000, type: 'highpass', gain: 0.12 });
        break;
      case 'skill':
        this.arp([784, 988, 1175, 1568], 0.09, { gain: 0.12 });
        this.tone(1568, 0.6, { type: 'triangle', gain: 0.1, delay: 0.36 });
        this.tone(1976, 0.6, { type: 'triangle', gain: 0.08, delay: 0.36 });
        break;
      case 'drain':
        this.tone(440, 1, { type: 'sawtooth', gain: 0.08, to: 55 });
        break;
      case 'ballSave':
        this.arp([880, 660, 880, 1175], 0.09, { type: 'triangle', gain: 0.15 });
        break;
      case 'bonus':
        this.arp([1047, 1175, 1319], 0.05, { gain: 0.08 });
        break;
      case 'extraBall':
        this.arp([523, 659, 784, 1047, 1319, 1568, 2093], 0.06, { gain: 0.12 });
        break;
      case 'wall':
        this.noise(0.035, { freq: 1300, gain: 0.08 + 0.2 * amt });
        break;
      case 'start':
        this.arp([262, 330, 392, 523, 659], 0.09, { gain: 0.1 });
        break;
      case 'gameOver':
        this.arp([392, 330, 262, 196, 131], 0.22, { type: 'triangle', gain: 0.15 });
        break;
      case 'ready':
        // ball drops onto the plunger, then a rising "shoot me" chime
        this.noise(0.06, { freq: 600, type: 'lowpass', gain: 0.3 * amt });
        this.arp([784, 1047, 1568], 0.09, { type: 'triangle', gain: 0.13 * amt, delay: 0.08 });
        break;
    }
  }
}
