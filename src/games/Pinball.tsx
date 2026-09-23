import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useGameFullscreen } from '../components/GameFullscreen';
import { BALLS_PER_GAME, fmt, PinballEngine } from './pinball/engine';
import { DotMatrix, PinballRenderer } from './pinball/render';
import { PinballSound } from './pinball/sound';
import { H, W } from './pinball/table';

const BEST_KEY = 'pinball-best';
const MUTE_KEY = 'pinball-muted';

type Phase = 'ready' | 'playing' | 'paused' | 'over';

const KEY = 'px-1.5 py-0.5 rounded bg-white/90 text-black font-mono text-[10px] font-bold';

/** Keyboard keys for each flipper (left, right). */
const FLIPPER_KEYS: [string[], string[]] = [['a'], ['d', 'l']];

export default function Pinball() {
  const fs = useGameFullscreen();
  // Outside GameLayout there's no fullscreen to require.
  const isFs = fs ? fs.isFullscreen : true;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dmdRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PinballEngine | null>(null);
  const rendererRef = useRef<PinballRenderer | null>(null);
  const dmdRenderer = useRef<DotMatrix | null>(null);
  const soundRef = useRef<PinballSound | null>(null);
  const bestRef = useRef(0);
  const phaseRef = useRef<Phase>('ready');
  const touches = useRef(new Map<number, 0 | 1>());

  const [phase, setPhaseState] = useState<Phase>('ready');
  const [best, setBest] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [muted, setMuted] = useState(false);
  const [flipDown, setFlipDown] = useState<[boolean, boolean]>([false, false]);
  const heldKeys = useRef(new Set<string>());

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  const engine = () => (engineRef.current ??= new PinballEngine());
  const sound = () => (soundRef.current ??= new PinballSound());

  /** Drive a flipper and light its cabinet button. */
  const flip = (side: 0 | 1, down: boolean) => {
    engine().setFlipper(side, down);
    setFlipDown((prev) => {
      if (prev[side] === down) return prev;
      const next: [boolean, boolean] = [prev[0], prev[1]];
      next[side] = down;
      return next;
    });
  };

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (!rendererRef.current) {
      const res = canvas.width / W;
      rendererRef.current = new PinballRenderer(res);
    }
    const e = engine();
    rendererRef.current.draw(ctx, e, performance.now() / 1000);
    if (dmdRef.current) {
      dmdRenderer.current ??= new DotMatrix();
      const d = e.dmd(bestRef.current);
      dmdRenderer.current.draw(dmdRef.current, d.top, d.bottom);
    }
  }, []);

  // one-time setup: resolution, saved best / mute, first paint
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const res = Math.min(3, Math.max(2, Math.ceil((window.devicePixelRatio || 1) * 1.5)));
      canvas.width = W * res;
      canvas.height = H * res;
    }
    try {
      const b = Number(localStorage.getItem(BEST_KEY) || '0');
      if (!Number.isNaN(b)) {
        bestRef.current = b;
        setBest(b);
      }
      const m = localStorage.getItem(MUTE_KEY) === '1';
      setMuted(m);
      sound().setMuted(m);
    } catch {
      /* ignore */
    }
    engine().onSfx = (name, amt) => soundRef.current?.play(name, amt);    paint();
  }, [paint]);

  // leaving fullscreen pauses the game
  useEffect(() => {
    if (!isFs && phaseRef.current === 'playing') {
      heldKeys.current.clear();
      setFlipDown([false, false]);
      engine().releaseAll();
      soundRef.current?.silence();
      setPhase('paused');
    }
  }, [isFs]);

  // main loop
  useEffect(() => {
    if (phase !== 'playing' || !isFs) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const e = engine();
      e.frame((now - last) / 1000);
      last = now;
      paint();
      soundRef.current?.setAmbient(e.rollSpeed(), e.onRail());
      if (e.state === 'over') {
        soundRef.current?.silence();
        setFinalScore(e.score);
        if (e.score > bestRef.current) {
          bestRef.current = e.score;
          setBest(e.score);
          try {
            localStorage.setItem(BEST_KEY, String(e.score));
          } catch {
            /* ignore */
          }
        }
        setPhase('over');
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, isFs, paint]);

  // keep the attract screen animated (lights / DMD) while not playing
  useEffect(() => {
    if (phase === 'playing') return;
    paint();
    const id = window.setInterval(paint, 250);
    return () => window.clearInterval(id);
  }, [phase, paint]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      sound().setMuted(next);
      try {
        localStorage.setItem(MUTE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const startGame = () => {
    if (!isFs) return;
    // drop focus from the page's Fullscreen button so Space can't "click" it
    (document.activeElement as HTMLElement | null)?.blur?.();
    sound().unlock();
    engine().start();
    setPhase('playing');
  };

  const resume = () => {
    if (!isFs) return;
    (document.activeElement as HTMLElement | null)?.blur?.();
    sound().unlock();
    setPhase('playing');
  };

  // Space presses the overlay's Start / Play again / Resume button. Kept in a
  // ref so the (mount-once) key handler always sees the current phase.
  const spaceAction = useRef<() => boolean>(() => false);
  spaceAction.current = () => {
    if (!isFs || phase === 'playing') return false;
    if (phase === 'paused') resume();
    else startGame();
    return true;
  };

  // keyboard: A left flipper, D or L right flipper, Space plunger (hold + release), M mute
  useEffect(() => {
    const handle = (ev: KeyboardEvent, down: boolean) => {
      const k = ev.key.toLowerCase();
      if (k === 'm' && down && !ev.repeat) {
        toggleMute();
        return;
      }
      if (phaseRef.current !== 'playing') {
        if (ev.code === 'Space' && down && !ev.repeat && spaceAction.current()) ev.preventDefault();
        return;
      }
      if (ev.code === 'Space') {
        ev.preventDefault();
        if (!ev.repeat) engine().setLaunch(down);
        return;
      }
      const side = FLIPPER_KEYS.findIndex((keys) => keys.includes(k));
      if (side < 0) return;
      ev.preventDefault();
      if (down) heldKeys.current.add(k);
      else heldKeys.current.delete(k);
      // a side stays up while any of its keys is held (e.g. D and L together)
      flip(side as 0 | 1, FLIPPER_KEYS[side].some((key) => heldKeys.current.has(key)));
    };
    const onDown = (ev: KeyboardEvent) => handle(ev, true);
    const onUp = (ev: KeyboardEvent) => handle(ev, false);
    const onBlur = () => {
      heldKeys.current.clear();
      engineRef.current?.releaseAll();
      setFlipDown([false, false]);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [toggleMute]);

  // touch: left half of the table = left flipper, right half = right flipper
  const onTableDown = (ev: ReactPointerEvent<HTMLCanvasElement>) => {
    if (phaseRef.current !== 'playing') return;
    const rect = ev.currentTarget.getBoundingClientRect();
    const side: 0 | 1 = ev.clientX - rect.left < rect.width / 2 ? 0 : 1;
    touches.current.set(ev.pointerId, side);
    ev.currentTarget.setPointerCapture(ev.pointerId);
    flip(side, true);
  };
  const onTableUp = (ev: ReactPointerEvent<HTMLCanvasElement>) => {
    const side = touches.current.get(ev.pointerId);
    if (side === undefined) return;
    touches.current.delete(ev.pointerId);
    if (![...touches.current.values()].includes(side)) flip(side, false);
  };

  const holdButton = (press: (down: boolean) => void) => ({
    onPointerDown: (ev: ReactPointerEvent<HTMLButtonElement>) => {
      ev.currentTarget.setPointerCapture(ev.pointerId);
      if (phaseRef.current === 'playing') press(true);
    },
    onPointerUp: () => press(false),
    onPointerCancel: () => press(false),
  });

  const flipperButton = (side: 0 | 1) => {
    const pressed = flipDown[side];
    return (
      <button
        type="button"
        aria-label={side === 0 ? 'Left flipper (A)' : 'Right flipper (D or L)'}
        aria-pressed={pressed}
        className={`w-14 self-stretch my-10 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 touch-none select-none text-white transition-[transform,box-shadow,background-color] duration-75 ${
          pressed
            ? 'translate-y-[3px] bg-gradient-to-b from-yellow-300 to-orange-500 border-yellow-100 text-black shadow-[0_0_22px_rgba(250,204,21,0.85)]'
            : 'bg-gradient-to-b from-red-500 to-red-700 border-red-900 shadow-[inset_0_2px_0_rgba(255,255,255,0.35),0_4px_0_#450a0a] hover:brightness-110'
        }`}
        {...holdButton((d) => flip(side, d))}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
          <path d={side === 0 ? 'M15 4 5 12l10 8z' : 'M9 4l10 8-10 8z'} />
        </svg>
        <span className="flex flex-col items-center gap-1">
          {FLIPPER_KEYS[side].map((k) => (
            <kbd key={k} className={`${KEY} text-xs`}>
              {k.toUpperCase()}
            </kbd>
          ))}
        </span>
        <span className="text-[9px] font-black tracking-widest [writing-mode:vertical-rl] rotate-180">FLIP</span>
      </button>
    );
  };

  const overlay = (() => {
    if (phase === 'playing' && isFs) return null;
    const needFs = !isFs;
    const enterFs = () => fs?.toggleFullscreen();
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/65 backdrop-blur-[2px] rounded-md text-white text-center px-6">
        {phase === 'over' && (
          <>
            <p className="text-3xl font-black tracking-wide text-orange-400">GAME OVER</p>
            <p className="font-mono text-lg">Score: {fmt(finalScore)}</p>
            {finalScore >= best && finalScore > 0 && <p className="text-sm text-yellow-300 font-bold">New high score!</p>}
          </>
        )}
        {phase === 'paused' && <p className="text-2xl font-black tracking-wide">PAUSED</p>}
        {phase === 'ready' && (
          <>
            <p className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-lime-300 to-emerald-500">
              UFO INVASION
            </p>
            <ul className="text-xs text-white/80 space-y-1 text-left">
              <li>
                <kbd className={KEY}>A</kbd> left flipper, <kbd className={KEY}>D</kbd> or <kbd className={KEY}>L</kbd> right flipper
              </li>
              <li>
                Hold <kbd className={KEY}>Space</kbd> to pull the plunger, release to launch
              </li>
              <li>
                <kbd className={KEY}>M</kbd> mute
              </li>
            </ul>
          </>
        )}
        {needFs ? (
          <>
            <p className="text-sm text-white/80 max-w-[240px]">
              {phase === 'paused' ? 'Return to fullscreen to keep playing.' : 'This game only plays in fullscreen.'}
            </p>
            <button type="button" className="btn btn-warning" onClick={enterFs} disabled={!fs}>
              Enter Fullscreen
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-warning" onClick={phase === 'paused' ? resume : startGame}>
              {phase === 'paused' ? 'Resume' : phase === 'over' ? 'Play again' : 'Start game'}
            </button>
            <p className="text-xs text-white/60 -mt-2">
              or press <kbd className={KEY}>Space</kbd>
            </p>
          </>
        )}
      </div>
    );
  })();

  return (
    <div
      className="max-w-full rounded-[28px] p-3 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border-4 border-orange-500 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.15)]"
      style={{ width: 540 }}
    >
      {/* backbox: dot-matrix display */}
      <div className="rounded-xl p-2 bg-black border-2 border-zinc-700 shadow-[inset_0_0_12px_rgba(255,120,30,0.25)]">
        <canvas
          ref={dmdRef}
          width={DotMatrix.width}
          height={DotMatrix.height}
          className="block w-full rounded"
          style={{ aspectRatio: `${DotMatrix.width} / ${DotMatrix.height}` }}
          role="img"
          aria-label="Score display"
        />
        <div className="flex justify-between px-1 pt-1 text-[10px] font-mono text-orange-300/80">
          <span>HIGH {fmt(best)}</span>
          <span>{BALLS_PER_GAME} BALLS</span>
        </div>
      </div>

      {/* playfield flanked by the cabinet's flipper buttons */}
      <div className="flex items-stretch gap-2 mt-3">
        {flipperButton(0)}
        <div className="relative flex-1 min-w-0">
          <canvas
            ref={canvasRef}
            width={W * 2}
            height={H * 2}
            className="block w-full rounded-md border-2 border-zinc-600 touch-none select-none"
            style={{ aspectRatio: `${W} / ${H}` }}
            onPointerDown={onTableDown}
            onPointerUp={onTableUp}
            onPointerCancel={onTableUp}
          />
          {overlay}
        </div>
        {flipperButton(1)}
      </div>

      {/* front panel */}
      <div className="flex items-center justify-between mt-3 px-1">
        <button type="button" className="btn btn-ghost btn-xs text-zinc-300" onClick={toggleMute} aria-pressed={muted}>
          {muted ? '🔇 Sound off' : '🔊 Sound on'}
        </button>
        <button
          type="button"
          className="btn btn-sm rounded-full bg-gradient-to-b from-yellow-300 to-orange-500 border-orange-700 text-black font-black touch-none select-none"
          {...holdButton((d) => engine().setLaunch(d))}
        >
          LAUNCH
        </button>
      </div>
    </div>
  );
}
