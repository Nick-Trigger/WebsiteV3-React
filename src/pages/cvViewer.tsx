import PdfViewerPage from "../components/PdfViewerPage";

export default function CvViewer() {
    return (
        <PdfViewerPage
            pageTitle="Nicholas Trigger's Curriculum Vitae"
            backTo="/"
            buttonText="Return to Home"
            heading="Nicholas Trigger's Curriculum Vitae"
            subtitle="Updated August 2026"
            pdfUrl="/Trigger,Nicholas-CV.pdf"
        />
    );
}
