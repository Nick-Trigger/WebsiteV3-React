import { createContext, useContext } from 'react';

export interface GameFullscreenState {
  /** True while the game is expanded (real Fullscreen API or the CSS overlay fallback). */
  isFullscreen: boolean;
  /** Enter/exit fullscreen. Must be called from a user gesture (click/tap). */
  toggleFullscreen: () => void;
}

/**
 * Provided by GameLayout so a game can react to (or require) fullscreen.
 * Null when a game is rendered outside GameLayout.
 */
export const GameFullscreenContext = createContext<GameFullscreenState | null>(null);

export const useGameFullscreen = () => useContext(GameFullscreenContext);
