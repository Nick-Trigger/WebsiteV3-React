import { lazy, Suspense, useEffect, useState } from 'react';
import { documentDates } from '../data/documentDates';

// pdf.js needs browser APIs, so load the renderer only on the client
// (never during the static prerender).
const PdfDocument = lazy(() => import('./PdfDocument'));

interface PdfViewerProps {
  url: string;
  // Shown in the viewer's toolbar; falls back to the file name.
  title?: string;
}

const spinner = (
  <div className="flex justify-center p-12">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
);

// Drop-in PDF viewer: renders the PDF with react-pdf on the client, with the
// "last updated" date that scripts/document-dates.mjs generates for every PDF
// in public/.
export default function PdfViewer({ url, title }: PdfViewerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return spinner;

  return (
    <Suspense fallback={spinner}>
      <PdfDocument url={url} title={title} updated={documentDates[decodeURI(url)]?.label} />
    </Suspense>
  );
}
