import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const MENU_W = 224;
const MENU_H = 250; // estimate, used only to keep the menu on-screen

type Row = 'divider' | { label: string; run: () => void };

export default function ContextMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef(0);

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1400);
  };

  useEffect(() => {
    const onCtx = (e: MouseEvent) => {
      e.preventDefault();
      setPos({
        x: Math.min(e.clientX, window.innerWidth - MENU_W - 8),
        y: Math.min(e.clientY, window.innerHeight - MENU_H - 8),
      });
      setOpen(true);
    };
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('contextmenu', onCtx);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('contextmenu', onCtx);
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  const rows: Row[] = [
    { label: 'Home', run: () => navigate('/') },
    { label: 'Projects', run: () => navigate('/projects') },
    { label: 'Games', run: () => navigate('/projects/games') },
    'divider',
    {
      label: 'Copy link to page',
      run: () => {
        navigator.clipboard
          ?.writeText(window.location.href)
          .then(() => showToast('Link copied'))
          .catch(() => showToast('Copy failed'));
      },
    },
    { label: 'Back to top', run: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    'divider',
    { label: 'View source on GitHub', run: () => window.open('https://github.com/Nick-Trigger', '_blank', 'noopener') },
  ];

  return (
    <>
      {open &&
        createPortal(
          <div
            className="fixed z-[9998] rounded-box border border-base-300 bg-base-100/95 backdrop-blur p-1.5 text-sm shadow-xl"
            style={{ left: pos.x, top: pos.y, width: MENU_W }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {rows.map((r, i) =>
              r === 'divider' ? (
                <div key={i} className="my-1 h-px bg-base-300" />
              ) : (
                <button
                  key={i}
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-200"
                  onClick={() => {
                    r.run();
                    setOpen(false);
                  }}
                >
                  {r.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}

      {toast &&
        createPortal(
          <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-full bg-neutral px-4 py-2 text-sm text-neutral-content shadow-lg">
            {toast}
          </div>,
          document.body,
        )}
    </>
  );
}
