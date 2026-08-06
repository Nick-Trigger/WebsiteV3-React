import PdfViewerPage from "../components/PdfViewerPage";
import { documentDates } from "../data/documentDates";

export default function ResumeViewer() {
    return (
        <PdfViewerPage
            pageTitle="Nicholas Trigger's Resume"
            backTo="/"
            buttonText="Return to Home"
            heading="Nicholas Trigger's Resume"
            subtitle={`Updated ${documentDates.resume.label}`}
            pdfUrl="/Trigger,Nicholas-Resume.pdf"
        />
    );
}
