import PdfViewerPage from "../components/PdfViewerPage";

export default function ResumeViewer() {
    return (
        <PdfViewerPage
            pageTitle="Nicholas Trigger's Resume"
            backTo="/"
            buttonText="Return to Home"
            heading="Nicholas Trigger's Resume"
            pdfUrl="/Trigger,Nicholas-Resume.pdf"
        />
    );
}
