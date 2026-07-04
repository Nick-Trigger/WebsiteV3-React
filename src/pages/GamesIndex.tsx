import { useMemo, useState } from 'react';
import BaseLayout from '../components/BaseLayout';
import HorizontalCard from '../components/HorizontalCard';
import GameThumbnail from '../components/GameThumbnail';
import { games } from '../data/games';

export default function GamesIndex() {
  const categories = useMemo(() => {
    const tags = Array.from(new Set(games.flatMap((g) => g.tags ?? [])));
    const hasNew = tags.includes('NEW');
    const rest = tags.filter((t) => t !== 'NEW').sort((a, b) => a.localeCompare(b));
    // NEW leads the list when any game carries it, then All, then tags A→Z.
    return [...(hasNew ? ['NEW'] : []), 'All', ...rest];
  }, []);
  const [cat, setCat] = useState('All');
  const shown =
    cat === 'All'
      ? [...games].sort((a, b) => {
          const aNew = a.tags?.includes('NEW') ? 1 : 0;
          const bNew = b.tags?.includes('NEW') ? 1 : 0;
          return bNew - aNew;
        })
      : games.filter((g) => g.tags?.includes(cat));

  return (
    <BaseLayout
      title="Nicholas Trigger - Games"
      description="A small collection of browser games built as React components."
    >
      <div className="flex items-baseline gap-2 mb-2">
        <h1 className="text-3xl font-bold">Browser Games</h1>
        <span className="text-lg text-base-content/50">{games.length}</span>
      </div>
      <p className="text-base-content/70 mb-4">
        A growing set of small games, each built as a self-contained React component. Pick one and
        play right in your browser.
      </p>

      <div className="relative w-full max-w-xs mb-5">
        {/* Overlay label; clicks fall through to the select so the whole
            control opens the native dropdown. */}
        <span className="pointer-events-none absolute inset-y-0 left-4 z-[1] flex items-center gap-2 text-base-content/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          Filter
        </span>
        <select
          className="select w-full pl-24 cursor-pointer focus:outline-none! focus-visible:outline-solid! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-primary!"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* key={cat} remounts the list on filter change to replay the card animation */}
      <div key={cat}>
        {shown.map((game, i) => (
          <div
            key={game.slug}
            className="card-enter"
            style={{ '--card-index': i } as React.CSSProperties}
          >
            {i > 0 && <div className="divider my-0"></div>}
            <HorizontalCard
              title={game.title}
              desc={game.description}
              url={`/projects/games/${game.slug}`}
              badge={game.tags?.[0]}
              media={<GameThumbnail slug={game.slug} />}
            />
          </div>
        ))}
      </div>
    </BaseLayout>
  );
}
