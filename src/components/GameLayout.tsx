import { Link } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import BaseLayout from './BaseLayout';
import ClientOnly from './ClientOnly';
import type { Game } from '../data/games';

type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FsDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

const currentFsElement = () => {
  const d = document as FsDocument;
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? null;
};

const BackArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const EnterFullscreenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
    <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
    <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
    <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
    <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
    <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
    <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
  </svg>
);

/**
 * Shared shell for every game page: back link, title, a fullscreen toggle, the
 * (client-only) game mount, and a "How to play" list. Each game just supplies
 * its registry entry; fullscreen behaviour is identical for all of them.
 *
 * Fullscreen wraps the element CONTAINING the game (wrapRef). The exit button
 * lives inside that element because the Fullscreen API only renders the
 * fullscreened subtree. Browsers without element fullscreen (iOS Safari) fall
 * back to a fixed full-viewport overlay.
 */
export default function GameLayout({ game }: { game: Game }) {
  const { title, description, instructions = [], Component } = game;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<HTMLDivElement | null>(null);

  const [realFs, setRealFs] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [apiSupported, setApiSupported] = useState(false);
  const [scale, setScale] = useState(1);

  const isFs = realFs || overlay;

  // Detect Fullscreen API support and keep realFs in sync (covers Esc exits).
  useEffect(() => {
    const el = document.documentElement as FsElement;
    setApiSupported(
      typeof el.requestFullscreen === 'function' ||
        typeof el.webkitRequestFullscreen === 'function',
    );
    const onChange = () => setRealFs(currentFsElement() === wrapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // Esc exits the CSS-overlay fallback (the real API handles Esc itself).
  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlay(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay]);

  // Scale the game up (or down) to fill the screen while expanded.
  useEffect(() => {
    if (!isFs) {
      setScale(1);
      return;
    }
    const compute = () => {
      const node = gameRef.current;
      if (!node) return;
      const gw = node.offsetWidth;
      const gh = node.offsetHeight;
      if (!gw || !gh) return;
      setScale(Math.min(window.innerWidth / gw, window.innerHeight / gh) * 0.92);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [isFs]);

  const toggleFullscreen = useCallback(async () => {
    const wrap = wrapRef.current as FsElement | null;
    if (!wrap) return;

    if (isFs) {
      if (realFs) {
        const d = document as FsDocument;
        try {
          await (document.exitFullscreen?.() ?? d.webkitExitFullscreen?.());
        } catch {
          /* ignore */
        }
      }
      setOverlay(false);
    } else if (apiSupported) {
      try {
        await (wrap.requestFullscreen?.() ?? wrap.webkitRequestFullscreen?.());
      } catch {
        setOverlay(true); // fall back if the request is rejected
      }
    } else {
      setOverlay(true);
    }
  }, [isFs, realFs, apiSupported]);

  const wrapClass = overlay
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-base-300'
    : realFs
      ? 'relative w-screen h-screen flex items-center justify-center bg-base-300'
      : 'relative flex justify-center mb-6';

  return (
    <BaseLayout title={`Nicholas Trigger - ${title}`} description={description}>
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Link to="/projects/games" className="btn btn-ghost btn-sm gap-1 -ml-2">
            <BackArrow />
            Back to games
          </Link>
          <button onClick={toggleFullscreen} className="btn btn-ghost btn-sm gap-1">
            <EnterFullscreenIcon />
            Fullscreen
          </button>
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-base-content/60 text-sm mt-1">{description}</p>
      </div>

      <div ref={wrapRef} className={wrapClass}>
        {isFs && (
          <button
            onClick={toggleFullscreen}
            className="btn btn-sm absolute top-4 right-4 z-10 gap-1"
          >
            <ExitFullscreenIcon />
            Exit
          </button>
        )}
        <div
          ref={gameRef}
          style={isFs ? { transform: `scale(${scale})`, transformOrigin: 'center' } : undefined}
        >
          <ClientOnly
            fallback={
              <div className="flex items-center justify-center w-full max-w-[400px] aspect-square rounded-xl border border-base-300 bg-base-200 text-base-content/50">
                Loading game…
              </div>
            }
          >
            <Component />
          </ClientOnly>
        </div>
      </div>

      {instructions.length > 0 && (
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">How to play</h2>
          <ul className="list-disc list-inside text-sm text-base-content/70 space-y-1">
            {instructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </BaseLayout>
  );
}
