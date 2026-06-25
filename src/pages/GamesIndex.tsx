import BaseLayout from '../components/BaseLayout';
import HorizontalCard from '../components/HorizontalCard';
import { games } from '../data/games';
import GameThumbnail from '../components/GameThumbnail';

export default function GamesIndex() {
  return (
    <BaseLayout
      title="Nicholas Trigger - Games"
      description="A collection of browser games built as React components."
    >
      <div className="text-3xl w-full font-bold mb-2">Browser Games</div>
      <p className="text-base-content/70 mb-5">
        Playable browser games built as self-contained React components.
      </p>

      {games.map((game, i) => (
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
