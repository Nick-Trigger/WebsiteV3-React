const KBD_CLASS =
  'kbd kbd-lg shadow-inner shadow-black/10 cursor-pointer select-none transition-transform transition-shadow transition-colors hover:shadow-md active:translate-y-[1px] active:shadow-sm active:bg-neutral-500';
const BTN_CLASS = 'btn btn-circle active:shadow-sm active:bg-neutral-500';

export interface DPadProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  /** Visible key hints on the desktop cluster. */
  labels?: { up?: string; down?: string; left?: string; right?: string };
  /** Caption under the desktop cluster. */
  caption?: string;
}

/**
 * A four-way directional control shared by all games. Renders a keyboard-style
 * cluster on desktop and a touch cluster on mobile; both are real buttons with
 * aria-labels, so the controls are keyboard- and screen-reader-accessible
 * regardless of input device.
 */
export default function DPad({ onUp, onDown, onLeft, onRight, labels, caption = 'Movement' }: DPadProps) {
  const l = { up: '↑/W', down: '↓/S', left: '←/A', right: '→/D', ...labels };

  return (
    <>
      {/* Keyboard-style cluster (desktop). */}
      <div className="hidden sm:flex flex-col items-center gap-2 w-40 rounded-xl bg-orange-400 p-4">
        <div className="grid grid-cols-3 gap-2">
          <span />
          <kbd className={KBD_CLASS} onClick={onUp} role="button" aria-label="Up">
            {l.up}
          </kbd>
          <span />
          <kbd className={KBD_CLASS} onClick={onLeft} role="button" aria-label="Left">
            {l.left}
          </kbd>
          <kbd className={KBD_CLASS} onClick={onDown} role="button" aria-label="Down">
            {l.down}
          </kbd>
          <kbd className={KBD_CLASS} onClick={onRight} role="button" aria-label="Right">
            {l.right}
          </kbd>
        </div>
        {caption && <p className="text-xs text-center text-base-100">{caption}</p>}
      </div>

      {/* Touch cluster (mobile). */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-40 rounded-xl bg-orange-400 p-4 sm:hidden">
        <span />
        <button type="button" className={BTN_CLASS} onClick={onUp} aria-label="Up">
          ⮝
        </button>
        <span />
        <button type="button" className={BTN_CLASS} onClick={onLeft} aria-label="Left">
          ⮜
        </button>
        <span />
        <button type="button" className={BTN_CLASS} onClick={onRight} aria-label="Right">
          ⮞
        </button>
        <span />
        <button type="button" className={BTN_CLASS} onClick={onDown} aria-label="Down">
          ⮟
        </button>
        <span />
      </div>
    </>
  );
}
