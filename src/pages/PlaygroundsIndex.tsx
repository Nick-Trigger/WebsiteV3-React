import BaseLayout from '../components/BaseLayout';
import HorizontalCard from '../components/HorizontalCard';
import { playgrounds } from '../data/playgrounds';

/**
 * Lists every available code playground, mirroring the games index. The card
 * icon is the language's logo.
 */
export default function PlaygroundsIndex() {
  return (
    <BaseLayout
      title="Nicholas Trigger - Code Playgrounds"
      description="Interactive code playgrounds — write and run code in a sandboxed environment, right in your browser."
    >
      <div className="flex items-baseline gap-2 mb-2">
        <h1 className="text-3xl font-bold">Code Playgrounds</h1>
        <span className="text-lg text-base-content/50">{playgrounds.length}</span>
      </div>
      <p className="text-base-content/70 mb-5">
        Write and run code right from this page. Python and JavaScript execute entirely in your
        browser inside sandboxed WebAssembly virtual machines — nothing you run can touch this
        site or your data. Compiled languages (C, C++, Rust) are built and run on the public
        Compiler Explorer sandbox (godbolt.org), with only text output coming back.
      </p>

      <div>
        {playgrounds.map((pg, i) => (
          <div
            key={pg.slug}
            className="card-enter"
            style={{ '--card-index': i } as React.CSSProperties}
          >
            {i > 0 && <div className="divider my-0"></div>}
            <HorizontalCard
              title={pg.title}
              desc={pg.description}
              url={`/projects/playgrounds/${pg.slug}`}
              badge={pg.tags?.[0]}
              media={
                <div className="flex items-center justify-center w-full h-full bg-base-200">
                  <pg.Logo className="w-20 h-20" />
                </div>
              }
            />
          </div>
        ))}
      </div>
    </BaseLayout>
  );
}
