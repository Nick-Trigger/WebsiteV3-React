import { useCallback, useEffect, useRef, useState } from 'react';
import GamePlayer from '../components/GamePlayer';

const HOLES = 9;
const GAME_TIME = 30; // seconds
const BEST_KEY = 'whack-best';

export default function WhackAMole() {
  const upRef = useRef<boolean[]>(Array(HOLES).fill(false));
  const duckTimers = useRef<Record<number, number>>({});
  const scoreRef = useRef(0);
  const bestRef = useRef(0);

  const [up, setUp] = useState<boolean[]>(Array(HOLES).fill(false));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [time, setTime] = useState(GAME_TIME);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);

  const setHole = (i: number, v: boolean) => {
    upRef.current = upRef.current.map((x, idx) => (idx === i ? v : x));
    setUp([...upRef.current]);
  };

  const popRandom = useCallback(() => {
    const empty = upRef.current.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    if (!empty.length) return;
    const i = empty[Math.floor(Math.random() * empty.length)];
    setHole(i, true);
    duckTimers.current[i] = window.setTimeout(() => setHole(i, false), 650 + Math.random() * 500);
  }, []);

  const whack = (i: number) => {
    if (!running || !upRef.current[i]) return;
    setHole(i, false);
    if (duckTimers.current[i]) clearTimeout(duckTimers.current[i]);
    scoreRef.current += 1;
    setScore(scoreRef.current);
  };

  const clearAll = () => {
    Object.values(duckTimers.current).forEach(clearTimeout);
    duckTimers.current = {};
    upRef.current = Array(HOLES).fill(false);
    setUp([...upRef.current]);
  };

  const start = useCallback(() => {
    clearAll();
    scoreRef.current = 0;
    setScore(0);
    setTime(GAME_TIME);
    setOver(false);
    setRunning(true);
  }, []);

  useEffect(() => {
    try {
      const b = Number(localStorage.getItem(BEST_KEY) || '0');
      if (!Number.isNaN(b)) {
        bestRef.current = b;
        setBest(b);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const popId = window.setInterval(popRandom, 680);
    const secId = window.setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => {
      window.clearInterval(popId);
      window.clearInterval(secId);
    };
  }, [running, popRandom]);

  useEffect(() => {
    if (running && time === 0) {
      setRunning(false);
      setOver(true);
      clearAll();
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
  }, [running, time]);

  return (
    <GamePlayer
      stats={[
        { label: 'Score', value: score, valueClassName: 'text-primary' },
        { label: 'Time', value: time, valueClassName: 'text-warning' },
        { label: 'Best', value: best, valueClassName: 'text-secondary' },
      ]}
      screenMaxWidth={400}
      controls={<p className="text-xs text-center text-base-100 max-w-[260px]">Tap a face the moment it pops up</p>}
    >
      <div className="relative w-full aspect-square rounded-xl bg-amber-900 border border-base-300 shadow-lg p-3 select-none">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
          {Array.from({ length: HOLES }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => whack(i)}
              className="relative rounded-full bg-amber-950/70 overflow-hidden flex items-end justify-center cursor-pointer"
              aria-label={`hole ${i + 1}`}
            >
              <img
                src="/pfp.jpg"
                alt=""
                className={`w-[86%] mb-[-8%] rounded-full transition-transform duration-150 ${up[i] ? 'translate-y-0' : 'translate-y-[120%]'}`}
              />
            </button>
          ))}
        </div>
        {(!running || over) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 rounded-xl text-white">
            {over && <p className="text-2xl font-bold">Time! Score {score}</p>}
            <button className="btn btn-primary btn-sm" onClick={start}>
              {over ? 'Play again' : 'Start'}
            </button>
          </div>
        )}
      </div>
    </GamePlayer>
  );
}
