import type { ReactNode } from 'react';

export interface GameStat {
  label: string;
  value: ReactNode;
  /** Optional color class for the value, e.g. "text-primary". */
  valueClassName?: string;
}

interface GamePlayerProps {
  /** Readout chips shown above the screen (score, best, level, …). */
  stats?: GameStat[];
  /**
   * The play area — a canvas, a board, etc. The screen wrapper is positioned
   * `relative`, so a game can absolutely-position overlays (start / game over)
   * over it simply by rendering them as siblings of the play area.
   */
  children: ReactNode;
  /** The control cluster, typically a <DPad/>. */
  controls?: ReactNode;
  /** Max width of the screen in px (square games keep width === height). */
  screenMaxWidth?: number;
}

/**
 * The handheld "game player" chassis: an orange shell wrapping three reusable,
 * independently-addressable regions — the score readout, the screen, and the
 * controls. Any game drops its own screen content in as children and supplies
 * its own stats + controls, so the look stays consistent across games while the
 * gameplay is fully swappable.
 */
export default function GamePlayer({
  stats = [],
  children,
  controls,
  screenMaxWidth = 400,
}: GamePlayerProps) {
  return (
    <div className="relative flex flex-col items-center gap-4 rounded-xl bg-orange-500 outline-none shadow-[inset_3px_3px_0_rgba(255,255,255,0.35),inset_-12px_-12px_0_rgba(0,0,0,0.45),0_10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col items-center gap-4 w-full p-8">
        {stats.length > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-6 text-sm font-mono bg-orange-400 px-3 py-2 rounded-lg"
          >
            {stats.map((s) => (
              <span key={s.label}>
                {s.label}:{' '}
                <span className={`font-bold ${s.valueClassName ?? ''}`}>{s.value}</span>
              </span>
            ))}
          </div>
        )}

        <div className="relative w-full" style={{ maxWidth: screenMaxWidth }}>
          {children}
        </div>

        {controls}
      </div>
    </div>
  );
}
