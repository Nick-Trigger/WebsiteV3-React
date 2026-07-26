import { Link } from 'react-router-dom';
import BaseLayout from './BaseLayout';
import ClientOnly from './ClientOnly';
import type { Playground } from '../data/playgrounds';

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
 * Shared shell for every playground page: back link, title, the client-only
 * editor/runner mount, and a "How the sandbox works" list. Mirrors GameLayout.
 * The runner itself only exists after hydration (workers and CodeMirror are
 * browser-only), so SSG prerenders just this frame.
 */
export default function PlaygroundLayout({ playground }: { playground: Playground }) {
  const { title, description, notes = [], Component } = playground;

  return (
    <BaseLayout title={`Nicholas Trigger - ${title}`} description={description}>
      <div className="mb-6">
        <Link to="/projects/playgrounds" className="btn btn-ghost btn-sm gap-1 -ml-2 mb-1">
          <BackArrow />
          Back to playgrounds
        </Link>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-base-content/60 text-sm mt-1">{description}</p>
      </div>

      <ClientOnly
        fallback={
          <div className="flex items-center justify-center w-full h-64 rounded-xl border border-base-300 bg-base-200 text-base-content/50">
            Loading playground…
          </div>
        }
      >
        <Component />
      </ClientOnly>

      {notes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">How the sandbox works</h2>
          <ul className="list-disc list-inside text-sm text-base-content/70 space-y-1">
            {notes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </BaseLayout>
  );
}
