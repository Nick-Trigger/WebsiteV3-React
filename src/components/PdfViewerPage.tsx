import { Link } from 'react-router-dom';
import BaseLayout from './BaseLayout';

interface PdfViewerPageProps {
  pageTitle: string;
  backTo: string;
  heading: string;
  subtitle: string;
  pdfUrl: string;
}

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

const DownloadIcon = () => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export default function PdfViewerPage({
  pageTitle,
  backTo,
  heading,
  subtitle,
  pdfUrl,
}: PdfViewerPageProps) {
  return (
    <BaseLayout title={pageTitle} includeSidebar={false}>
      <div className="flex items-center justify-between mb-8 max-w-screen-xl mx-auto px-2">
        <div>
          <Link to={backTo} className="btn btn-ghost btn-sm gap-1 -ml-2 mb-1">
            <BackArrow />
            Back to project
          </Link>
          <h1 className="text-3xl font-bold">{heading}</h1>
          <p className="text-base-content/60 text-sm mt-1">{subtitle}</p>
        </div>
        <a href={pdfUrl} download className="btn btn-primary btn-sm gap-2">
          <DownloadIcon />
          Download PDF
        </a>
      </div>

      <div className="w-full rounded-xl overflow-hidden shadow-2xl border border-base-300">
        <object
          data={`${pdfUrl}#toolbar=1&view=FitH`}
          type="application/pdf"
          style={{ width: '100%', height: '90vh', minHeight: '600px', display: 'block' }}
        >
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-base-content/60">
            <p>Your browser doesn't support inline PDFs.</p>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Open PDF
            </a>
          </div>
        </object>
      </div>
    </BaseLayout>
  );
}
