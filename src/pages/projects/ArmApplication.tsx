import PdfViewerPage from '../../components/PdfViewerPage';

export default function ArmApplication() {
  return (
    <PdfViewerPage
      pageTitle="Nicholas Trigger - Pulse Mate VentureWell Application"
      backTo="/projects/arm"
      heading="Pulse Mate: VentureWell E-Team Application"
      subtitle="Team PATS · Duke University · Summer 2023 Cohort"
      pdfUrl="/PATS_arm.pdf"
    />
  );
}
