import { Link } from 'react-router-dom';
import BaseLayout from './BaseLayout';
import PdfViewer from './PdfViewer';

interface PdfViewerPageProps {
  pageTitle: string;
  backTo: string;
  heading: string;
  pdfUrl: string;
  buttonText?: string;
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

export default function PdfViewerPage({
  pageTitle,
  backTo,
  heading,
  pdfUrl,
  buttonText,
}: PdfViewerPageProps) {
  return (
    // remove default padding and max-width so the PDF can use the full viewport
    <BaseLayout title={pageTitle} includeSidebar={true} contentClassName="p-0 w-full min-w-0 lg:max-w-none flex flex-grow flex-col items-center">
      {/* The viewer's toolbar shows the file name; keep a real heading for SEO
          and screen readers. */}
      <h1 className="sr-only">{heading}</h1>

      <div className="w-full max-w-6xl px-2">
        <PdfViewer url={pdfUrl} title={pageTitle} />
      </div>

      <div className="w-full max-w-6xl px-2 mt-6 mb-12">
        <Link to={backTo} className="btn btn-sm gap-1">
          <BackArrow /> {buttonText ?? 'Back to project'}
        </Link>
      </div>
    </BaseLayout>
  );
}
