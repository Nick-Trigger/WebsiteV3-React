import { Link } from 'react-router-dom';
import BaseLayout from '../../components/BaseLayout';

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

interface PosterPanelProps {
  authors: string;
  pdfUrl: string;
}

function PosterPanel({ authors, pdfUrl }: PosterPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-sm text-base-content/60">{authors}</p>
        <a href={pdfUrl} download className="btn btn-primary btn-sm gap-2">
          <DownloadIcon />
          Download
        </a>
      </div>
      <div className="w-full rounded-xl overflow-hidden shadow-2xl border border-base-300">
        <object
          data={`${pdfUrl}#toolbar=1&view=FitH`}
          type="application/pdf"
          style={{ width: '100%', height: '88vh', minHeight: '600px', display: 'block' }}
        >
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-base-content/60">
            <p>Your browser doesn't support inline PDFs.</p>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Open PDF
            </a>
          </div>
        </object>
      </div>
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
            authors="Sam Patterson, Pablo Garza T, Yiannis Lempidakis, John Button, Jacob Hills"
            pdfUrl="/dog2poster.pdf"
          />
        </div>
      </div>
    </BaseLayout>
  );
}
