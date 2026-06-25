import type { ComponentType } from 'react';
import Snake from '../games/Snake';
import Game2048 from '../games/Game2048';

export interface Game {
  /** URL slug; the route is /projects/games/<slug>. */
  slug: string;
  title: string;
  description: string;
  /** Short labels; the first one is used as the listing-card badge. */
  tags?: string[];
  /** Bullet points shown under the board on the game page. */
  instructions?: string[];
  /** The playable component. Rendered client-only via GameLayout. */
  Component: ComponentType;
}

/**
 * The single source of truth for the games section. Add a game here and it
 * shows up on the /projects/games index and gets its own route automatically
 * (see src/routes.tsx). Remember to also add its path to scripts/postbuild.mjs
 * so it lands in the sitemap.
 */
export const games: Game[] = [
  {
    slug: 'snake',
    title: 'Snake',
    description:
      'Its Snake, Eat Food... Get Longer!',
    tags: ['Arcade', 'Canvas'],
    instructions: [
      'Arrow keys or WASD to steer (on-screen pad on mobile)',
      'Eat the red food to grow and score a point',
      'Avoid the walls and your own tail',
    ],
    Component: Snake,
  },
  {
    slug: '2048',
    title: '2048',
    description: 'Slide the tiles, merge matching numbers, and reach 2048.',
    tags: ['Puzzle'],
    instructions: [
      'Arrow keys / WASD or the D-pad to slide every tile',
      'Tiles with the same number merge into one',
      'Reach the 2048 tile to win — press R for a new game',
    ],
    Component: Game2048,
  },
];
