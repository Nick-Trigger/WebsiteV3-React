import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import CookieDrop from './CookieDrop';
import { resetConsent, setConsent, useConsent } from '../consent';

const OPEN_EVENT = 'open-cookie-settings';

/**
 * Open the cookie dialog from anywhere. Used by the right-click menu on desktop
 * and by the gear next to the theme toggle on mobile, where there is no
 * right-click to reach it with.
 */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * The cookie dialog. Mounted once by BaseLayout; opens on `openCookieSettings`.
 * Dismissing it with OK still rains cookies, same as it always has.
 */
export default function CookieSettings() {
  const [open, setOpen] = useState(false);
  const [cookieRun, setCookieRun] = useState(0); // key so the drop can re-trigger
  const consent = useConsent();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const granted = consent.state === 'granted';

  return (
    <>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
            onClick={() => setOpen(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Cookies"
              className="w-full max-w-sm rounded-box bg-base-100 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-2 text-lg font-bold">Cookies? 🍪</h2>
              <p className="mb-4 text-sm">
                Only Microsoft Clarity is used, to see which pages people actually read. No ads, and
                nothing is sold or shared.
              </p>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-base-200 p-3">
                <span className="text-sm font-medium">Allow analytics cookies</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={granted}
                  onChange={(e) => setConsent(e.target.checked ? 'granted' : 'denied')}
                />
              </label>

              <p className="mt-2 text-xs opacity-70">
                {consent.explicit
                  ? 'Saved on this device.'
                  : consent.restricted
                    ? 'Off by default — your region asks first.'
                    : 'On by default in your region.'}
              </p>

              <div className="mt-6 flex items-center justify-end gap-2">
                {consent.explicit && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={resetConsent}>
                    Use regional default
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setOpen(false);
                    setCookieRun(Date.now());
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {cookieRun > 0 && <CookieDrop key={cookieRun} onDone={() => setCookieRun(0)} />}
    </>
  );
}
