import type { ComponentType } from 'react';
import Snake from '../games/Snake';

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
      'The classic arcade game — eat, grow, and try not to bite your own tail.',
    tags: ['Arcade', 'Canvas'],
    instructions: [
      'Arrow keys or WASD to steer (on-screen pad on mobile)',
      'Eat the red food to grow and score a point',
      'Avoid the walls and your own tail',
    ],
    Component: Snake,
  },
];
