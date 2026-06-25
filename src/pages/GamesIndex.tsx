import { useMemo, useState } from 'react';
import BaseLayout from '../components/BaseLayout';
import HorizontalCard from '../components/HorizontalCard';
import GameThumbnail from '../components/GameThumbnail';
import { games } from '../data/games';

export default function GamesIndex() {
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(games.flatMap((g) => g.tags ?? [])))],
    [],
  );
  const [cat, setCat] = useState('All');
  const shown = cat === 'All' ? games : games.filter((g) => g.tags?.includes(cat));

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

      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {shown.map((game, i) => (
        <div key={game.slug}>
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
    </BaseLayout>
  );
}
