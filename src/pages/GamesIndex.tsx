import BaseLayout from '../components/BaseLayout';
import HorizontalCard from '../components/HorizontalCard';
import { games } from '../data/games';

export default function GamesIndex() {
  return (
    <BaseLayout
      title="Nicholas Trigger - Games"
      description="A small collection of browser games built as React components."
    >
      <div className="text-3xl w-full font-bold mb-2">Browser Games</div>
      <p className="text-base-content/70 mb-5">
        A growing set of small games, each built as a self-contained React component. Pick one and
        play in your browser.
      </p>

      {games.map((game, i) => (
        <div key={game.slug}>
          {i > 0 && <div className="divider my-0"></div>}
          <HorizontalCard
            title={game.title}
            desc={game.description}
            url={`/projects/games/${game.slug}`}
            badge={game.tags?.[0]}
          />
        </div>
      ))}
    </BaseLayout>
  );
}
