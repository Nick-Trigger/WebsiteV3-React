import { Link } from 'react-router-dom';
import BaseLayout from '../../components/BaseLayout';
import ClientOnly from '../../components/ClientOnly';
import QrCodeGeneratorTool from '../../components/QrCodeGeneratorTool';

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

export default function QrCodeGenerator() {
  return (
    <BaseLayout
      title="Nicholas Trigger - QR Code Generator"
      description="Generate custom-styled QR codes with rounded dots, colors, and a logo in the center. Copy to clipboard or download as PNG, JPEG, WEBP, or SVG."
    >
      <div className="mb-6">
        <Link to="/projects" className="btn btn-ghost btn-sm gap-1 -ml-2 mb-1">
          <BackArrow />
          Back to projects
        </Link>
        <h1 className="text-3xl font-bold">QR Code Generator</h1>
        <p className="text-base-content/60 text-sm mt-1">
          Generate a QR code with custom dot and corner shapes, colors, and an optional logo in the
          center, then copy it or download it.
        </p>
      </div>

      {/* The generator's controls need real horizontal room; below `sm` show a
          notice instead of a cramped, broken layout. */}
      <div className="qr:hidden flex flex-col items-center gap-2 text-center rounded-xl border border-base-300 bg-base-200 p-8">
        <p className="font-semibold">A bigger screen is needed for this tool</p>
        <p className="text-sm text-base-content/60">
          The QR code generator's style controls need more room than this screen provides. Try
          again on a tablet, laptop, or desktop.
        </p>
      </div>

      <div className="hidden qr:block">
        <ClientOnly
          fallback={
            <div className="flex items-center justify-center w-full h-96 rounded-xl border border-base-300 bg-base-200 text-base-content/50">
              Loading QR code generator…
            </div>
          }
        >
          <QrCodeGeneratorTool />
        </ClientOnly>
      </div>
    </BaseLayout>
  );
}
