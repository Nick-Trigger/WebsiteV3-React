import { Link } from 'react-router-dom';
import BaseLayout from '../../components/BaseLayout';
import PdfViewer from '../../components/PdfViewer';

interface PosterPanelProps {
  team: string;
  authors: string;
  pdfUrl: string;
}

function PosterPanel({ team, authors, pdfUrl }: PosterPanelProps) {
  return (
    <>
      <p className="text-sm text-base-content/60 mb-2 px-1">{authors}</p>
      <PdfViewer url={pdfUrl} title={`${team} Poster`} />
    </>
  );
}

export default function DogPosters() {
  return (
    <BaseLayout
      title="Nicholas Trigger - Dog Activity Tracker Posters"
      includeSidebar={false}
    >
      <div className="flex items-center justify-between mb-4 max-w-screen-xl mx-auto px-2">
        <div>
          <Link to="/projects/dog" className="btn btn-ghost btn-sm gap-1 -ml-2 mb-1">
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
            Back to project
          </Link>
          <h1 className="text-3xl font-bold">Dog Activity Trackers: Posters</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Duke University EGR 101 Foundry · Saving Grace Animal Shelter
          </p>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-box mb-4 max-w-screen-xl mx-auto px-2">
        <input
          type="radio"
          name="poster_tabs"
          role="tab"
          className="tab"
          aria-label="Team MAAAC: Activity Tracker"
          defaultChecked
        />
        <div role="tabpanel" className="tab-content pt-4">
          <PosterPanel
            team="Team MAAAC: Activity Tracker"
            authors="Alexandre Dias, Ari Dixit, Arshaan Sayed, Conrad Qu, Mila Prakapenka"
            pdfUrl="/dog1poster.pdf"
          />
        </div>

        <input
          type="radio"
          name="poster_tabs"
          role="tab"
          className="tab"
          aria-label="Team 2: Dog Fitness Tracker"
        />
        <div role="tabpanel" className="tab-content pt-4">
          <PosterPanel
            team="Team 2: Dog Fitness Tracker"
            authors="Sam Patterson, Pablo Garza T, Yiannis Lempidakis, John Button, Jacob Hills"
            pdfUrl="/dog2poster.pdf"
          />
        </div>
      </div>
    </BaseLayout>
  );
}
