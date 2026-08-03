import PdfViewerPage from "../components/PdfViewerPage";

export default function ArmApplication() {
    return (
        <PdfViewerPage
            pageTitle="Nicholas Trigger's Resume"
            backTo="/"
            buttonText="Return to Home"
            heading="Nicholas Trigger's Resume"
            subtitle="Updated July 2026"
            pdfUrl="/Trigger,Nicholas-Resume.pdf"
        />
    );
}
