// GENERATED FILE — do not edit by hand.
// Regenerate with `npm run doc-dates` (see scripts/document-dates.mjs).
//
// Each entry is the date of the most recent commit that changed the matching
// PDF in public/, so the viewers can say when the document itself last changed.
export interface DocumentDate {
  /** Commit date of the last change, as YYYY-MM-DD (UTC). */
  iso: string;
  /** Human-readable month and year, e.g. "August 2026". */
  label: string;
}

export const documentDates = {
  resume: { iso: '2026-08-06', label: 'August 2026' },
  cv: { iso: '2026-08-06', label: 'August 2026' },
} satisfies Record<string, DocumentDate>;
