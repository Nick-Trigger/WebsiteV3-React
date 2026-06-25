import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

const RETURN_MS = 9000; // how long it bounces before flying home
const GRAVITY = 0.8;
const RESTITUTION = 0.72; // energy kept on a bounce
const AIR_DRAG = 0.999;
const FLOOR_FRICTION = 0.92;
const DRAG_THRESHOLD = 6; // px of movement before a click becomes a drag
const SPIN = 0.4; // degrees of roll per px dragged

/**
 * Easter egg: the sidebar headshot can be grabbed and flung. It spins with the
 * drag, then bounces around the viewport under gravity, and flies home after a
 * few seconds. A plain click (no real movement) still navigates to "/".
 *
 * All window/document/rAF access lives in handlers and effects, so it's safe
 * under SSG (the portal only mounts once dragging begins, on the client).
 */
export default function BouncyHeadshot() {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [active, setActive] = useState(false); // floating (drag / fly / return)
  const activeRef = useRef(false);

  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const angle = useRef(0);
  const angVel = useRef(0);
  const size = useRef(136);
  const grab = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0, t: 0 });
  const moved = useRef(0);
  const dragging = useRef(false);
  const returning = useRef(false);
  const returnAt = useRef(0);
  const raf = useRef(0);
  const suppressClick = useRef(false);

  const applyTransform = useCallback(() => {
    const el = imgRef.current;
    if (el) el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${angle.current}deg)`;
  }, []);

  const step = useCallback(() => {
    if (returning.current) {
      const home = slotRef.current?.getBoundingClientRect();
      if (!home) {
        setActive(false);
        activeRef.current = false;
        returning.current = false;
        return;
      }
      pos.current.x += (home.left - pos.current.x) * 0.18;
      pos.current.y += (home.top - pos.current.y) * 0.18;
      angle.current += (0 - angle.current) * 0.18;
      applyTransform();
      if (Math.abs(home.left - pos.current.x) < 0.6 && Math.abs(home.top - pos.current.y) < 0.6 && Math.abs(angle.current) < 0.6) {
        setActive(false);
        activeRef.current = false;
        returning.current = false;
        return;
      }
      raf.current = requestAnimationFrame(step);
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const s = size.current;

    vel.current.y += GRAVITY;
    vel.current.x *= AIR_DRAG;
    pos.current.x += vel.current.x;
    pos.current.y += vel.current.y;
    angle.current += angVel.current;

    if (pos.current.x < 0) {
      pos.current.x = 0;
      vel.current.x = Math.abs(vel.current.x) * RESTITUTION;
      angVel.current *= 0.8;
    } else if (pos.current.x + s > vw) {
      pos.current.x = vw - s;
      vel.current.x = -Math.abs(vel.current.x) * RESTITUTION;
      angVel.current *= 0.8;
    }
    if (pos.current.y < 0) {
      pos.current.y = 0;
      vel.current.y = Math.abs(vel.current.y) * RESTITUTION;
    } else if (pos.current.y + s > vh) {
      pos.current.y = vh - s;
      vel.current.y = -Math.abs(vel.current.y) * RESTITUTION;
      vel.current.x *= FLOOR_FRICTION;
      angVel.current *= 0.9;
    }

    applyTransform();
    if (performance.now() >= returnAt.current) returning.current = true;
    raf.current = requestAnimationFrame(step);
  }, [applyTransform]);

  const onMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      moved.current += Math.abs(dx) + Math.abs(dy);

      if (!activeRef.current) {
        if (moved.current < DRAG_THRESHOLD) {
          last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
          return;
        }
        // lift off
        pos.current.x = e.clientX - grab.current.x;
        pos.current.y = e.clientY - grab.current.y;
        activeRef.current = true;
        setActive(true);
        last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const dt = Math.max(1, performance.now() - last.current.t);
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
    if (!activeRef.current) return; // never crossed threshold -> let the link handle the click

    suppressClick.current = true; // a drag just happened; don't navigate
    angVel.current = vel.current.x * 0.8;
    returnAt.current = performance.now() + RETURN_MS;
    returning.current = false;
    raf.current = requestAnimationFrame(step);
  }, [onMove, step]);

  const onDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(raf.current);
    returning.current = false;
    if (!activeRef.current) {
      const r = slotRef.current?.getBoundingClientRect();
      if (!r) return;
      size.current = r.width;
      grab.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      pos.current = { x: r.left, y: r.top };
    } else {
      grab.current = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y };
    }
    dragging.current = true;
    moved.current = 0;
    vel.current = { x: 0, y: 0 };
    last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    },
    [onMove, onUp],
  );

  return (
    <div className="w-fit mx-auto mt-5 mb-6">
      <div ref={slotRef} className="w-[8.5rem] aspect-square">
        {active ? (
          <div className="w-full h-full" /> // placeholder keeps layout while floating
        ) : (
          <Link
            to="/"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className="block w-full h-full avatar transition ease-in-out hover:scale-[102%]"
            onClick={(e) => {
              if (suppressClick.current) {
                e.preventDefault();
                suppressClick.current = false;
              }
            }}
          >
            <img
              src="/pfp.jpg"
              alt="Profile image"
              width={300}
              height={300}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onPointerDown={onDown}
              className="mask mask-circle w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
            />
          </Link>
        )}
      </div>

      {active &&
        createPortal(
          <img
            ref={imgRef}
            src="/pfp.jpg"
            alt=""
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onPointerDown={onDown}
            style={{
              width: size.current,
              height: size.current,
              transform: `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${angle.current}deg)`,
            }}
            className="fixed top-0 left-0 z-[9999] rounded-full shadow-2xl cursor-grab active:cursor-grabbing select-none touch-none will-change-transform"
          />,
          document.body,
        )}
    </div>
  );
}
