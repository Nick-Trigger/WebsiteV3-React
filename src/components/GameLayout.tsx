import { Link } from 'react-router-dom';
import BaseLayout from './BaseLayout';
import ClientOnly from './ClientOnly';
import type { Game } from '../data/games';

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

/**
 * Shared shell for every game page: back link, title, the (client-only) game
 * mount, and a "How to play" list. Each game just supplies its registry entry.
 */
export default function GameLayout({ game }: { game: Game }) {
  const { title, description, instructions = [], Component } = game;

  return (
    <BaseLayout title={`Nicholas Trigger - ${title}`} description={description}>
      <div className="mb-6">
        <Link to="/projects/games" className="btn btn-ghost btn-sm gap-1 -ml-2 mb-1">
          <BackArrow />
          Back to games
        </Link>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-base-content/60 text-sm mt-1">{description}</p>
      </div>

      <div className="flex justify-center mb-6">
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
