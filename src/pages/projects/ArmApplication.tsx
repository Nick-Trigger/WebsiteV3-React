import PdfViewerPage from '../../components/PdfViewerPage';

export default function ArmApplication() {
  return (
    <PdfViewerPage
      pageTitle="Nicholas Trigger - Pulse Mate VentureWell Application"
      backTo="/projects/arm"
      heading="Pulse Mate: VentureWell E-Team Application"
      pdfUrl="/PATS_arm.pdf"
    />
  );
}
