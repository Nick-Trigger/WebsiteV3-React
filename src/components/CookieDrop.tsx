import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useConsent } from '../consent';

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

// Live handles into one cookie's physics refs so other cookies can collide
// with it. Refs (not values) are shared because some are reassigned in place.
interface CookieBody {
  id: number;
  pos: RefObject<{ x: number; y: number }>;
  vel: RefObject<{ x: number; y: number }>;
  angVel: RefObject<number>;
  dragging: RefObject<boolean>;
  leaveStart: RefObject<number>;
}

function BouncyCookie({
  index,
  bodies,
  crossed,
  onGone,
}: {
  index: number;
  bodies: Set<CookieBody>;
  crossed: boolean;
  onGone: () => void;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);

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
  const entered = useRef(false); // has it fallen into the viewport yet?
  const diesAt = useRef(0);
  const leaveStart = useRef(0);
  const raf = useRef(0);
  const goneRef = useRef(false);

  const applyTransform = useCallback((scale = 1) => {
    const el = elRef.current;
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

    // Shrink-out progress; physics keeps running underneath so the cookie
    // never freezes mid-air while it despawns.
    let scale = 1;
    if (leaveStart.current) {
      const t = (now - leaveStart.current) / LEAVE_MS;
      if (t >= 1) {
        finish();
        return;
      }
      scale = 1 - t;
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
      // Ceiling kicks in only once the cookie has rained into view, so the
      // staggered entry from above still works.
      if (!entered.current && pos.current.y >= 0) entered.current = true;
      if (entered.current && pos.current.y < 0) {
        pos.current.y = 0;
        vel.current.y = Math.abs(vel.current.y) * RESTITUTION;
        angVel.current *= 0.9;
      }
      if (pos.current.y + SIZE > vh) {
        pos.current.y = vh - SIZE;
        vel.current.y = -Math.abs(vel.current.y) * RESTITUTION;
        vel.current.x *= FLOOR_FRICTION;
        angVel.current *= 0.9;
      }

      if (!leaveStart.current && now >= diesAt.current) leaveStart.current = now;
    }

    // Cookie-vs-cookie collisions. Runs even while dragged (a held cookie can
    // bat the others around); each pair is resolved once per frame by the
    // lower-indexed cookie. Despawning cookies stop colliding.
    if (!leaveStart.current) {
      for (const other of bodies) {
        if (other.id <= index || other.leaveStart.current) continue;
        const meHeld = dragging.current;
        const otherHeld = other.dragging.current;
        if (meHeld && otherHeld) continue;

        const dx = other.pos.current.x - pos.current.x;
        const dy = other.pos.current.y - pos.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0 || dist >= SIZE) continue;
        const nx = dx / dist;
        const ny = dy / dist;

        // Push the circles apart; a held cookie acts as an immovable wall.
        const overlap = SIZE - dist;
        if (meHeld) {
          other.pos.current.x += nx * overlap;
          other.pos.current.y += ny * overlap;
        } else if (otherHeld) {
          pos.current.x -= nx * overlap;
          pos.current.y -= ny * overlap;
        } else {
          pos.current.x -= (nx * overlap) / 2;
          pos.current.y -= (ny * overlap) / 2;
          other.pos.current.x += (nx * overlap) / 2;
          other.pos.current.y += (ny * overlap) / 2;
        }

        // Equal-mass impulse along the normal (full impulse if one is held).
        const rvx = other.vel.current.x - vel.current.x;
        const rvy = other.vel.current.y - vel.current.y;
        const rel = rvx * nx + rvy * ny;
        if (rel < 0) {
          const j = (-(1 + RESTITUTION) * rel) / (meHeld || otherHeld ? 1 : 2);
          if (!meHeld) {
            vel.current.x -= j * nx;
            vel.current.y -= j * ny;
          }
          if (!otherHeld) {
            other.vel.current.x += j * nx;
            other.vel.current.y += j * ny;
          }
          // Glancing hits add a little spin.
          const tangent = -rvx * ny + rvy * nx;
          if (!meHeld) angVel.current += tangent * 0.05;
          if (!otherHeld) other.angVel.current -= tangent * 0.05;
        }
      }
    }

    applyTransform(scale);
    raf.current = requestAnimationFrame(step);
  }, [applyTransform, finish, bodies, index]);

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
    const body: CookieBody = { id: index, pos, vel, angVel, dragging, leaveStart };
    bodies.add(body);
    diesAt.current = performance.now() + LIFE_MS;
    raf.current = requestAnimationFrame(step);
    return () => {
      bodies.delete(body);
      cancelAnimationFrame(raf.current);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [step, onMove, onUp, bodies, index]);

  return createPortal(
    <div
      ref={elRef}
      aria-hidden="true"
      onPointerDown={onDown}
      style={{
        width: SIZE,
        height: SIZE,
        transform: `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${angle.current}deg)`,
      }}
      className="fixed top-0 left-0 z-[9999] cursor-grab active:cursor-grabbing select-none touch-none will-change-transform drop-shadow-lg"
    >
      <img
        src="/cookie.svg"
        alt=""
        width={SIZE}
        height={SIZE}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className="w-full h-full"
      />
      {/* Cookies are off, so the ones raining down get struck out. */}
      {crossed && (
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 w-full h-full"
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M5 5 L19 19" />
          <path d="M19 5 L5 19" />
        </svg>
      )}
    </div>,
    document.body,
  );
}

export default function CookieDrop({ count = 5, onDone }: { count?: number; onDone: () => void }) {
  // Track which cookies are still alive so each one unmounts the moment its
  // own timeout ends, instead of lingering until the last cookie despawns.
  const [alive, setAlive] = useState(() => Array.from({ length: count }, (_, i) => i));
  // Shared physics registry so the cookies can collide with each other.
  const bodies = useRef<Set<CookieBody>>(new Set());
  const consent = useConsent();

  useEffect(() => {
    if (alive.length === 0) onDone();
  }, [alive, onDone]);

  return (
    <>
      {alive.map((i) => (
        <BouncyCookie
          key={i}
          index={i}
          bodies={bodies.current}
          crossed={consent.state === 'denied'}
          onGone={() => setAlive((a) => a.filter((x) => x !== i))}
        />
      ))}
    </>
  );
}
