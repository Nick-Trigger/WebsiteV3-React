import PdfViewerPage from "../components/PdfViewerPage";

export default function CvViewer() {
    return (
        <PdfViewerPage
            pageTitle="Nicholas Trigger's Curriculum Vitae"
            backTo="/"
            buttonText="Return to Home"
            heading="Nicholas Trigger's Curriculum Vitae"
            pdfUrl="/Trigger,Nicholas-CV.pdf"
        />
    );
}
