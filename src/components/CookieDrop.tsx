import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Same physics feel as BouncyHeadshot, but free-floating: cookies rain from the
// top of the viewport, bounce around, can be grabbed and flung, and after a few
// seconds shrink away and unmount.
const LIFE_MS = 9000;
const GRAVITY = 0.8;
const RESTITUTION = 0.72;
const AIR_DRAG = 0.999;
const FLOOR_FRICTION = 0.92;
const SPIN = 0.4;
const SIZE = 88;
const LEAVE_MS = 400; // shrink-out duration

function BouncyCookie({ index, onGone }: { index: number; onGone: () => void }) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  const pos = useRef({
    x: Math.random() * Math.max(1, window.innerWidth - SIZE),
    y: -SIZE - index * 110 - Math.random() * 60, // stagger the rain
  });
  const vel = useRef({ x: (Math.random() - 0.5) * 10, y: 0 });
  const angle = useRef(Math.random() * 360);
  const angVel = useRef((Math.random() - 0.5) * 8);
  const grab = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0, t: 0 });
  const dragging = useRef(false);
  const diesAt = useRef(0);
  const leaveStart = useRef(0);
  const raf = useRef(0);
  const goneRef = useRef(false);

  const applyTransform = useCallback((scale = 1) => {
    const el = imgRef.current;
    if (el)
      el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${angle.current}deg) scale(${scale})`;
  }, []);

  const finish = useCallback(() => {
    if (goneRef.current) return;
    goneRef.current = true;
    cancelAnimationFrame(raf.current);
    onGone();
  }, [onGone]);

  const step = useCallback(() => {
    const now = performance.now();

    if (leaveStart.current) {
      const t = (now - leaveStart.current) / LEAVE_MS;
      if (t >= 1) {
        finish();
        return;
      }
      applyTransform(1 - t);
      raf.current = requestAnimationFrame(step);
      return;
    }

    if (!dragging.current) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      vel.current.y += GRAVITY;
      vel.current.x *= AIR_DRAG;
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;
      angle.current += angVel.current;

      if (pos.current.x < 0) {
        pos.current.x = 0;
        vel.current.x = Math.abs(vel.current.x) * RESTITUTION;
        angVel.current *= 0.8;
      } else if (pos.current.x + SIZE > vw) {
        pos.current.x = vw - SIZE;
        vel.current.x = -Math.abs(vel.current.x) * RESTITUTION;
        angVel.current *= 0.8;
      }
      // no ceiling: cookies enter from above and can be flung back up
      if (pos.current.y + SIZE > vh) {
        pos.current.y = vh - SIZE;
        vel.current.y = -Math.abs(vel.current.y) * RESTITUTION;
        vel.current.x *= FLOOR_FRICTION;
        angVel.current *= 0.9;
      }

      applyTransform();
      if (now >= diesAt.current) leaveStart.current = now;
    }

    raf.current = requestAnimationFrame(step);
  }, [applyTransform, finish]);

  const onMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const dt = Math.max(1, performance.now() - last.current.t);
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      vel.current.x = (dx / dt) * 16;
      vel.current.y = (dy / dt) * 16;
      angle.current += dx * SPIN;
      pos.current.x = e.clientX - grab.current.x;
      pos.current.y = e.clientY - grab.current.y;
      last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      applyTransform();
    },
    [applyTransform],
  );

  const onUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    angVel.current = vel.current.x * 0.8;
    diesAt.current = performance.now() + LIFE_MS; // playing with it keeps it alive
  }, [onMove]);

  const onDown = (e: React.PointerEvent) => {
    if (leaveStart.current) return; // too late, it's crumbling
    dragging.current = true;
    grab.current = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y };
    vel.current = { x: 0, y: 0 };
    last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
  };

  useEffect(() => {
    diesAt.current = performance.now() + LIFE_MS;
    raf.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [step, onMove, onUp]);

  return createPortal(
    <img
      ref={imgRef}
      src="/cookie.svg"
      alt=""
      aria-hidden="true"
      width={SIZE}
      height={SIZE}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onPointerDown={onDown}
      style={{
        width: SIZE,
        height: SIZE,
        transform: `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${angle.current}deg)`,
      }}
      className="fixed top-0 left-0 z-[9999] cursor-grab active:cursor-grabbing select-none touch-none will-change-transform drop-shadow-lg"
    />,
    document.body,
  );
}

export default function CookieDrop({ count = 5, onDone }: { count?: number; onDone: () => void }) {
  const [gone, setGone] = useState(0);

  useEffect(() => {
    if (gone >= count) onDone();
  }, [gone, count, onDone]);

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <BouncyCookie key={i} index={i} onGone={() => setGone((g) => g + 1)} />
      ))}
    </>
  );
}
