import PdfViewerPage from "../components/PdfViewerPage";
import { documentDates } from "../data/documentDates";

export default function CvViewer() {
    return (
        <PdfViewerPage
            pageTitle="Nicholas Trigger's Curriculum Vitae"
            backTo="/"
            buttonText="Return to Home"
            heading="Nicholas Trigger's Curriculum Vitae"
            subtitle={`Updated ${documentDates.cv.label}`}
            pdfUrl="/Trigger,Nicholas-CV.pdf"
        />
    );
}
