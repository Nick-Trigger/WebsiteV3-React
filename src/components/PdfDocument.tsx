import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy, PageViewport } from "pdfjs-dist";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Must be set in the same module that renders <Document> (see react-pdf docs).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfDocumentProps {
  url: string;
  // Shown in the toolbar; falls back to the file name.
  title?: string;
  // When the PDF last changed, e.g. "September 4, 2026".
  updated?: string;
}

type FitMode = "width" | "height";

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];
// iOS Safari refuses to draw canvases larger than this many pixels.
const MAX_CANVAS_PIXELS = 16_777_216;

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const InfoIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </Icon>
);

const ChevronUpIcon = () => (
  <Icon>
    <polyline points="18 15 12 9 6 15"></polyline>
  </Icon>
);

const ChevronDownIcon = () => (
  <Icon>
    <polyline points="6 9 12 15 18 9"></polyline>
  </Icon>
);

const MinusIcon = () => (
  <Icon>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </Icon>
);

const PlusIcon = () => (
  <Icon>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </Icon>
);

const FitWidthIcon = () => (
  <Icon>
    <polyline points="18 8 22 12 18 16"></polyline>
    <polyline points="6 8 2 12 6 16"></polyline>
    <line x1="2" y1="12" x2="22" y2="12"></line>
  </Icon>
);

const FitHeightIcon = () => (
  <Icon>
    <polyline points="8 6 12 2 16 6"></polyline>
    <polyline points="8 18 12 22 16 18"></polyline>
    <line x1="12" y1="2" x2="12" y2="22"></line>
  </Icon>
);

const DownloadIcon = () => (
  <Icon>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </Icon>
);

const MaximizeIcon = () => (
  <Icon>
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
  </Icon>
);

const CloseIcon = () => (
  <Icon>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </Icon>
);

// Vendor-prefixed Fullscreen API, still needed for older Safari.
type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

const PrintIcon = () => (
  <Icon>
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </Icon>
);

// Print the PDF itself (not the surrounding page) by loading it in a hidden
// iframe. Mobile browsers can't print iframes, so open the PDF in a new tab
// there and let the native viewer handle printing.
function printPdf(url: string) {
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.open(url, "_blank", "noopener");
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.open(url, "_blank", "noopener");
    }
    // Leave it long enough for the print dialog to grab the document.
    setTimeout(() => iframe.remove(), 60_000);
  };
  document.body.appendChild(iframe);
}

// Renders a PDF to canvas so it looks the same on every browser/device instead
// of relying on a native PDF plugin, inside a screen-height scrollable frame
// with a toolbar like a built-in PDF reader.
export default function PdfDocument({ url, title, updated }: PdfDocumentProps) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Inner size of the scroll frame (excludes padding and scrollbar gutter).
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  // Unscaled viewport of every page: gives off-screen pages their size and maps
  // link destinations to positions on the page.
  const [viewports, setViewports] = useState<PageViewport[]>([]);
  // Pages near the visible area; only these get a (memory-hungry) canvas.
  const [nearbyPages, setNearbyPages] = useState<Set<number>>(new Set([0]));
  const [currentPage, setCurrentPage] = useState(1);
  // What's typed in the page box while it's being edited; null shows currentPage.
  const [pageInput, setPageInput] = useState<string | null>(null);
  const [zoomIndex, setZoomIndex] = useState(ZOOM_STEPS.indexOf(1));
  const [fitMode, setFitMode] = useState<FitMode>("width");
  const [fullscreen, setFullscreen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // How far through the document the frame is scrolled (0-1), so the reading
  // position survives anything that resizes the pages.
  const scrollFraction = useRef(0);

  const numPages = viewports.length;
  const aspectRatios = viewports.map((vp) => vp.height / vp.width);
  const fileName = decodeURIComponent(url.split("/").pop() ?? url);
  const label = title ?? fileName;
  const zoom = ZOOM_STEPS[zoomIndex];

  useEffect(() => {
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      setFrameSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [frame]);

  // The page placeholders only exist once both the PDF has loaded and the frame
  // has been measured; either can finish first (a cached PDF often beats the
  // first ResizeObserver callback), so wait for both before observing.
  const hasLayout = frameSize.width > 0;
  useEffect(() => {
    if (!frame || !numPages || !hasLayout) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setNearbyPages((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            const index = Number(
              (entry.target as HTMLElement).dataset.pageIndex,
            );
            if (entry.isIntersecting) next.add(index);
            else next.delete(index);
          }
          return next;
        });
      },
      // Start rendering a screen or so before a page scrolls into view.
      { root: frame, rootMargin: "100% 0px" },
    );
    pageRefs.current
      .slice(0, numPages)
      .forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [frame, numPages, hasLayout]);

  const handleLoadSuccess = async (pdf: PDFDocumentProxy) => {
    setViewports(
      await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, i) =>
          // The viewport accounts for page rotation and crop offsets.
          (await pdf.getPage(i + 1)).getViewport({ scale: 1 }),
        ),
      ),
    );
  };

  // Track which page is showing: the last page whose top has scrolled past the
  // upper third of the frame.
  const handleScroll = () => {
    if (!frame) return;
    scrollFraction.current = frame.scrollTop / Math.max(frame.scrollHeight, 1);
    const threshold =
      frame.getBoundingClientRect().top + frame.clientHeight / 3;
    let page = 1;
    pageRefs.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= threshold) page = i + 1;
    });
    setCurrentPage(page);
  };

  // Close the info panel on any click outside it, or Esc.
  useEffect(() => {
    if (!infoOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!infoRef.current?.contains(e.target as Node)) setInfoOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInfoOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [infoOpen]);

  // Full screen: always cover the window with CSS (iPhone Safari only allows
  // real fullscreen for video), and also use the Fullscreen API where it
  // exists so the browser's own bars get hidden too.
  const enterFullscreen = () => {
    setFullscreen(true);
    const box = boxRef.current as FullscreenElement | null;
    const request =
      box?.requestFullscreen?.bind(box) ??
      box?.webkitRequestFullscreen?.bind(box);
    try {
      Promise.resolve(request?.()).catch(() => {});
    } catch {
      // CSS full screen is already showing.
    }
  };

  const exitFullscreen = () => {
    setFullscreen(false);
    const doc = document as FullscreenDocument;
    if (doc.fullscreenElement ?? doc.webkitFullscreenElement) {
      const exit =
        doc.exitFullscreen?.bind(doc) ?? doc.webkitExitFullscreen?.bind(doc);
      try {
        Promise.resolve(exit?.()).catch(() => {});
      } catch {
        // Nothing to undo.
      }
    }
  };

  useEffect(() => {
    if (!fullscreen) return;
    const doc = document as FullscreenDocument;
    // Leaving native fullscreen another way (Esc, back gesture) exits ours too.
    const onChange = () => {
      if (!(doc.fullscreenElement ?? doc.webkitFullscreenElement))
        setFullscreen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    document.addEventListener("keydown", onKey);
    // Stop the page behind the overlay from scrolling.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [fullscreen]);

  // `offset` is a distance in CSS pixels below the top of the page.
  const goToPage = (
    page: number,
    offset = 0,
    behavior: ScrollBehavior = "smooth",
  ) => {
    const el = pageRefs.current[page - 1];
    if (!frame || !el) return;
    // Position within the frame's scrollable content (offsetTop would be
    // relative to the nearest positioned ancestor, not the frame).
    const pageTop =
      el.getBoundingClientRect().top -
      frame.getBoundingClientRect().top +
      frame.scrollTop;
    frame.scrollTo({ top: pageTop + offset - 16, behavior });
  };

  // Internal link clicked: jump to the destination's spot on its page. `dest`
  // is an explicit PDF destination like [pageRef, {name: 'XYZ'}, left, top, zoom].
  const handleItemClick = ({
    dest,
    pageIndex,
  }: {
    dest?: unknown;
    pageIndex: number;
  }) => {
    let offset = 0;
    const viewport = viewports[pageIndex];
    if (viewport && Array.isArray(dest)) {
      const mode = (dest[1] as { name?: string } | undefined)?.name;
      const top =
        mode === "XYZ"
          ? dest[3]
          : mode === "FitH" || mode === "FitBH"
            ? dest[2]
            : mode === "FitR"
              ? dest[5]
              : null;
      if (typeof top === "number") {
        const [, y] = viewport.convertToViewportPoint(0, top);
        offset = Math.max(0, y * (pageWidth / viewport.width));
      }
    }
    // Jump instantly: smooth-scrolling across dozens of pages would render
    // every page it passes.
    goToPage(pageIndex + 1, offset, "auto");
  };
  const commitPageInput = () => {
    if (pageInput === null) return;
    const page = parseInt(pageInput, 10);
    if (!Number.isNaN(page)) {
      // Jump instantly, for the same reason as internal links.
      goToPage(Math.min(Math.max(page, 1), numPages), 0, "auto");
    }
    setPageInput(null);
  };

  // react-pdf captures onItemClick once on its first render, so hand it a stable
  // function that always calls the latest handler.
  const itemClickRef = useRef(handleItemClick);
  itemClickRef.current = handleItemClick;
  const [onItemClick] = useState(
    () => (args: { dest?: unknown; pageIndex: number }) =>
      itemClickRef.current(args),
  );

  const fitWidth =
    fitMode === "height" && numPages
      ? Math.min(frameSize.height / aspectRatios[0], frameSize.width)
      : frameSize.width;
  const pageWidth = Math.floor(fitWidth * zoom);

  // Zooming, switching fit or entering full screen resizes every page; put the
  // frame back at the same point in the document instead of a random page.
  useLayoutEffect(() => {
    if (frame) frame.scrollTop = scrollFraction.current * frame.scrollHeight;
  }, [frame, pageWidth]);

  // Render at twice the screen's pixel density, then let the browser scale it
  // down. Rendering at exactly 1x (especially on fractional-DPR screens like
  // 1.5x) leaves the canvas a pixel off and the browser resamples it, which
  // blurs text. Capped so a big zoomed page stays under canvas size limits.
  const renderScale = (ratio: number) =>
    Math.min(
      (window.devicePixelRatio || 1) * 2,
      Math.sqrt(MAX_CANVAS_PIXELS / (pageWidth * pageWidth * ratio)),
    );

  const iconButton = "btn btn-ghost btn-xs sm:btn-sm btn-square";
  // A tinted pill that visually ties related toolbar controls together.
  const group = "flex items-center gap-0.5 rounded-lg bg-base-200 p-0.5";

  return (
    <div
      ref={boxRef}
      className={`flex flex-col overflow-hidden bg-base-200 ${
        fullscreen
          ? "fixed inset-0 z-[100] h-[100dvh] w-screen"
          : "rounded-xl border border-base-300 shadow-2xl h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)] min-h-[32rem]"
      }`}
    >
      {/* Toolbar. Controls are grouped by what they do, each group on its own
          tinted pill: full screen | page navigation | title | view (zoom, fit)
          | document (info, download, print). On phones the title takes the
          first row, navigation and document actions the second, view the third. */}
      <div className="relative flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 bg-base-300 px-2 py-1.5 text-sm sm:grid sm:grid-cols-[1fr_auto_1fr]">
        <p
          className="order-first w-full truncate text-center font-medium sm:order-none sm:col-start-2 sm:row-start-1 sm:max-w-xs md:max-w-md"
          title={label}
        >
          {label}
        </p>

        <div className="order-1 flex items-center gap-2 sm:order-none sm:col-start-1 sm:row-start-1">
          <div role="group" aria-label="Full screen" className={group}>
            <button
              type="button"
              className={iconButton}
              onClick={fullscreen ? exitFullscreen : enterFullscreen}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              title={fullscreen ? "Exit full screen" : "Full screen"}
            >
              {fullscreen ? <CloseIcon /> : <MaximizeIcon />}
            </button>
          </div>

          <div role="group" aria-label="Page navigation" className={group}>
            <button
              type="button"
              className={iconButton}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              title="Previous page"
            >
              <ChevronUpIcon />
            </button>

            {numPages ? (
              <span className="mx-1 flex items-center gap-1 tabular-nums whitespace-nowrap">
                <input
                  type="text"
                  inputMode="numeric"
                  // Swap daisyUI's offset focus ring for a subtle border colour.
                  className="input input-xs px-1 text-center tabular-nums focus:outline-none focus:shadow-none focus:[--input-color:var(--color-primary)]"
                  style={{ width: `${String(numPages).length + 2}ch` }}
                  value={pageInput ?? currentPage}
                  onFocus={(e) => {
                    setPageInput(String(currentPage));
                    e.target.select();
                  }}
                  onChange={(e) =>
                    setPageInput(e.target.value.replace(/\D/g, ""))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") {
                      setPageInput(null);
                      // Blur after the reset so onBlur doesn't commit the draft.
                      requestAnimationFrame(() =>
                        (e.target as HTMLInputElement).blur(),
                      );
                    }
                  }}
                  onBlur={commitPageInput}
                  aria-label="Page number"
                />
                / {numPages}
              </span>
            ) : (
              <span className="mx-1">–</span>
            )}
            <button
              type="button"
              className={iconButton}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= numPages}
              aria-label="Next page"
              title="Next page"
            >
              <ChevronDownIcon />
            </button>
          </div>
        </div>

        {/* Flattened into the toolbar's rows on phones so the two groups can
            sit on different rows; a single cluster on the right from sm up. */}
        <div className="contents sm:col-start-3 sm:row-start-1 sm:flex sm:items-center sm:justify-self-end sm:gap-2">
          <div
            role="group"
            aria-label="View"
            className={`${group} order-3 mx-auto sm:order-none sm:mx-0`}
          >
            <button
              type="button"
              className={iconButton}
              onClick={() => setZoomIndex((z) => z - 1)}
              disabled={zoomIndex <= 0}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <MinusIcon />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs sm:btn-sm w-12 px-0 font-normal tabular-nums"
              onClick={() => setZoomIndex(ZOOM_STEPS.indexOf(1))}
              aria-label={`Zoom ${Math.round(zoom * 100)}%, reset to 100%`}
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className={iconButton}
              onClick={() => setZoomIndex((z) => z + 1)}
              disabled={zoomIndex >= ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <PlusIcon />
            </button>
            <span
              className="mx-0.5 h-4 w-px bg-base-content/20"
              aria-hidden="true"
            ></span>
            <button
              type="button"
              className={iconButton}
              onClick={() => {
                setFitMode((m) => (m === "width" ? "height" : "width"));
                setZoomIndex(ZOOM_STEPS.indexOf(1));
              }}
              aria-label={
                fitMode === "width" ? "Fit to height" : "Fit to width"
              }
              title={fitMode === "width" ? "Fit to height" : "Fit to width"}
            >
              {fitMode === "width" ? <FitHeightIcon /> : <FitWidthIcon />}
            </button>
          </div>

          <div
            role="group"
            aria-label="Document"
            className={`${group} order-2 sm:order-none`}
          >
            <div ref={infoRef}>
              <button
                type="button"
                className={`${iconButton} ${infoOpen ? "btn-active" : ""}`}
                onClick={() => setInfoOpen((o) => !o)}
                aria-label="Document info"
                aria-expanded={infoOpen}
                title="Document info"
              >
                <InfoIcon />
              </button>
              {/* Anchored to the toolbar (not the button) so it always lines up
                  with the viewer's right edge, even when the toolbar wraps. */}
              {infoOpen && (
                <div
                  role="dialog"
                  aria-label="Document info"
                  className="absolute right-2 top-full z-20 mt-1 w-max max-w-[16rem] rounded-box border border-base-300 bg-base-100 p-3 text-sm shadow-xl"
                >
                  <p className="text-base-content/60 text-xs">Last updated</p>
                  <p className="font-medium">{updated ?? "Unknown"}</p>
                  <p className="text-base-content/60 text-xs mt-2">File</p>
                  <p className="font-medium break-all">{fileName}</p>
                </div>
              )}
            </div>
            <a
              href={url}
              download
              className={iconButton}
              aria-label="Download PDF"
              title="Download"
            >
              <DownloadIcon />
            </a>
            <button
              type="button"
              className={iconButton}
              onClick={() => printPdf(url)}
              aria-label="Print PDF"
              title="Print"
            >
              <PrintIcon />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={setFrame}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-auto bg-base-200 p-4"
        // Reserve the scrollbar's space so it can't change the page width.
        style={{ scrollbarGutter: "stable" }}
      >
        <Document
          file={url}
          // Without this, react-pdf suspends while each newly visible page
          // loads, and the nearest <Suspense> hides the whole viewer, which
          // resets the frame's scroll position to the top.
          suspense={false}
          onLoadSuccess={handleLoadSuccess}
          onItemClick={onItemClick}
          externalLinkTarget="_blank"
          externalLinkRel="noopener noreferrer"
          loading={
            <div className="flex justify-center p-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-base-content/60">
              <p>Couldn't load the PDF preview.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Open PDF
              </a>
            </div>
          }
          className="flex flex-col gap-4"
        >
          {pageWidth > 0 &&
            aspectRatios.map((ratio, i) => (
              <div
                key={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                data-page-index={i}
                className="mx-auto shrink-0 bg-white shadow-lg"
                style={{
                  width: pageWidth,
                  height: Math.floor(pageWidth * ratio),
                }}
              >
                {nearbyPages.has(i) && (
                  <Page
                    pageNumber={i + 1}
                    width={pageWidth}
                    devicePixelRatio={renderScale(ratio)}
                    suspense={false}
                    loading={null}
                  />
                )}
              </div>
            ))}
        </Document>
      </div>
    </div>
  );
}
