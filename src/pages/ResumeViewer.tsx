import PdfViewerPage from "../components/PdfViewerPage";

export default function ArmApplication() {
    return (
        <PdfViewerPage
            pageTitle="Nicholas Trigger - Pulse Mate VentureWell Application"
            backTo="/"
            buttonText="Return to Home"
            heading="Nicholas Trigger's Resume"
            subtitle="Updated July 2026"
            pdfUrl="/Trigger,Nicholas-Resume.pdf"
        />
    );
}
