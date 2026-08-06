import { useMemo, useState } from 'react';
import BaseLayout from '../components/BaseLayout';
import { ProjectCards } from '../components/ProjectComponets';
import { projects } from '../data/projects';

const STARRED = '★ Starred';

export default function Projects() {
  const categories = useMemo(
    () => [
      'All',
      STARRED,
      ...Array.from(new Set(projects.flatMap((p) => p.tags ?? []))).sort((a, b) =>
        a.localeCompare(b),
      ),
    ],
    [],
  );
  const [cat, setCat] = useState('All');
  const shown =
    cat === 'All'
      ? projects
      : cat === STARRED
        ? projects.filter((p) => p.featured)
        : projects.filter((p) => p.tags?.includes(cat));

  return (

    <BaseLayout title="Nicholas Trigger - Projects">
      <>
        <div className="flex items-baseline gap-2 py-2">
          <h1 className="text-4xl md:text-5xl font-bold">Projects</h1>
        </div>

        <div className="relative w-full max-w-xs mt-5 mb-2">
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
          <ProjectCards items={shown} />
        </div>
        <p className="mt-4 text-sm text-base-content/70">
          {shown.length} project{shown.length !== 1 && 's'} of {projects.length} shown
        </p>
      </>

    </BaseLayout>
  );
}
