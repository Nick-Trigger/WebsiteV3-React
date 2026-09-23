// GENERATED FILE — do not edit by hand.
// Regenerate with `npm run doc-dates` (see scripts/document-dates.mjs).
//
// One entry per PDF in public/, keyed by the URL it's served at. Each is the
// date of the most recent commit that changed that PDF, so the viewer can say
// when the document itself last changed.
export interface DocumentDate {
  /** Commit date of the last change, as YYYY-MM-DD. */
  iso: string;
  /** Human-readable date, e.g. "August 6, 2026". */
  label: string;
}

export const documentDates: Record<string, DocumentDate> = {
  "/CLABSI_DHF_FINAL_NICHOLAS_TRIGGER.pdf": { iso: '2026-05-08', label: 'May 8, 2026' },
  "/CLABSI_Final_Poster_2026_V2.pdf": { iso: '2026-04-23', label: 'April 23, 2026' },
  "/PATS_arm.pdf": { iso: '2023-04-20', label: 'April 20, 2023' },
  "/Trigger,Nicholas-CV.pdf": { iso: '2026-09-23', label: 'September 23, 2026' },
  "/Trigger,Nicholas-Resume.pdf": { iso: '2026-09-04', label: 'September 4, 2026' },
  "/dog1poster.pdf": { iso: '2023-12-03', label: 'December 3, 2023' },
  "/dog2poster.pdf": { iso: '2023-12-03', label: 'December 3, 2023' },
};
