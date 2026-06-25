import type { ComponentType } from 'react';
import Snake from '../games/Snake';
import Game2048 from '../games/Game2048';
import TowerDefense from '../games/TowerDefense';
import Flappy from '../games/Flappy'
import Breakout from '../games/Breakout'
import Pong from '../games/Pong';
import SlidingPuzzle from '../games/SlidingPuzzle'
import WhackAMole from '../games/WhackAMole'

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
    tags: ['NEW', 'Puzzle', 'Strategy'],
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
    tags: ['NEW', 'Puzzle'],
    instructions: [
      'Arrow keys / WASD or the D-pad to slide every tile',
      'Tiles with the same number merge into one',
      'Reach the 2048 tile to win — press R for a new game',
    ],
    Component: Game2048,
  },
  {
    slug: 'tower-defense',
    title: 'Tower Defense',
    description: 'Defend your base from waves of enemies.',
    tags: ['NEW', 'Strategy'],
    instructions: [
      'Place towers to stop the enemies from reaching the end',
      'Choose the right tower for each situation',
      'Upgrade your towers to make them more powerful',
    ],
    Component: TowerDefense,
  },
  {
    slug: 'flappy',
    title: 'Flappy Bird',
    description: 'Navigate through the pipes without hitting them.',
    tags: ['NEW', 'Arcade'],
    instructions: [
      'Press SPACE or tap the screen to make the bird fly',
      'Avoid the pipes and don\'t hit the ground or ceiling',
      'The game gets progressively harder as you go',
    ],
    Component: Flappy,
  },
  {
    slug: 'breakout',
    title: 'Breakout',
    description: 'Break all the bricks without letting the ball fall.',
    tags: ['NEW', 'Arcade'],
    instructions: [
      'Use the arrow keys or mouse to move the paddle',
      'Bounce the ball to break all the bricks',
      'Don\'t let the ball fall off the bottom of the screen',
    ],
    Component: Breakout,
  },
  {
    slug: 'pong',
    title: 'Pong',
    description: 'A classic two-player game of ping-pong.',
    tags: ['NEW', 'Arcade'],
    instructions: [
      'Player 1 uses W and S keys to move their paddle up and down',
      'Player 2 uses UP and DOWN arrow keys to move their paddle up and down',
      'First player to score 11 points wins!',
    ],
    Component: Pong,
  },
  {
    slug: 'sliding-puzzle',
    title: 'Sliding Puzzle',
    description: 'Rearrange the tiles to form a complete picture.',
    tags: ['NEW', 'Puzzle'],
    instructions: [
      'Click on a tile adjacent to the empty space to move it',
      'Try to arrange all tiles in numerical order (or a specific image)',
      'The fewer moves you make, the better your score!',
    ],
    Component: SlidingPuzzle,
  },
  {
    slug: 'whack-a-mole',
    title: 'Whack-a-Mole',
    description: 'Hit as many moles as you can before time runs out.',
    tags: ['NEW', 'Arcade'],
    instructions: [
      "Click on a mole's hole when it appears",
      "Don't click on an empty hole",
      "The game gets faster as you progress",
    ],
    Component: WhackAMole,
  },

];
