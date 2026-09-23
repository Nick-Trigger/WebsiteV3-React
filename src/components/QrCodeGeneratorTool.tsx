import { useEffect, useMemo, useRef, useState } from 'react';
import QRCodeStyling, {
  type CornerDotType,
  type CornerSquareType,
  type DotType,
  type ErrorCorrectionLevel,
  type FileExtension,
} from 'qr-code-styling';
import { HexColorInput, HexColorPicker } from 'react-colorful';

const DEFAULT_TEXT = 'https://nicholastrigger.com/projects/qr-code-generator';
const DEFAULT_LOGO = '/favicon.svg';
const QR_SIZE = 280;

const DOT_STYLES: { value: DotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy rounded' },
  { value: 'extra-rounded', label: 'Extra rounded' },
];

const CORNER_SQUARE_STYLES: { value: CornerSquareType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Circle' },
  { value: 'extra-rounded', label: 'Rounded' },
];

const CORNER_DOT_STYLES: { value: CornerDotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Circle' },
];

const ERROR_CORRECTION_LEVELS: { value: ErrorCorrectionLevel; label: string }[] = [
  { value: 'L', label: 'Low (~7%)' },
  { value: 'M', label: 'Medium (~15%)' },
  { value: 'Q', label: 'Quartile (~25%)' },
  { value: 'H', label: 'High (~30%)' },
];

const DOWNLOAD_FORMATS: FileExtension[] = ['png', 'jpeg', 'webp', 'svg'];

/** A labeled swatch button that opens a react-colorful popover for picking a hex color. */
function ColorPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-1 relative" ref={wrapRef}>
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      <button
        type="button"
        className="w-full h-9 rounded border border-base-300 bg-base-100 flex items-center gap-2 px-2 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span
          className="w-5 h-5 rounded border border-base-300 shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm font-mono uppercase">{value}</span>
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 mt-2 p-3 rounded-lg border border-base-300 bg-base-100 shadow-xl">
          <HexColorPicker color={value} onChange={onChange} />
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed
            className="input input-bordered input-sm w-full mt-2 font-mono"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Interactive QR code generator: dot/corner style options, custom colors, an
 * optional center logo, and copy/download actions. Built on qr-code-styling,
 * which draws to a canvas we mount directly (no React re-render of the QR
 * itself - the imperative `.update()` call handles that).
 */
export default function QrCodeGeneratorTool() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [dotsType, setDotsType] = useState<DotType>('rounded');
  const [dotsColor, setDotsColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [cornersSquareType, setCornersSquareType] = useState<CornerSquareType>('dot');
  const [cornersDotType, setCornersDotType] = useState<CornerDotType>('square');
  const [cornersColor, setCornersColor] = useState('#000000');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>('Q');
  const [logo, setLogo] = useState<string | null>(DEFAULT_LOGO);
  const [logoSize, setLogoSize] = useState(0.4);
  const [hideBackgroundDots, setHideBackgroundDots] = useState(true);
  const [downloadFormat, setDownloadFormat] = useState<FileExtension>('png');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copySupported, setCopySupported] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  const data = text.trim().length > 0 ? text : DEFAULT_TEXT;

  const options = useMemo(
    () => ({
      width: QR_SIZE,
      height: QR_SIZE,
      type: 'canvas' as const,
      data,
      image: logo ?? undefined,
      margin: 8,
      qrOptions: { errorCorrectionLevel },
      dotsOptions: { type: dotsType, color: dotsColor },
      backgroundOptions: { color: backgroundColor },
      cornersSquareOptions: { type: cornersSquareType, color: cornersColor },
      cornersDotOptions: { type: cornersDotType, color: cornersColor },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: logoSize,
        hideBackgroundDots,
      },
    }),
    [
      data,
      logo,
      errorCorrectionLevel,
      dotsType,
      dotsColor,
      backgroundColor,
      cornersSquareType,
      cornersDotType,
      cornersColor,
      logoSize,
      hideBackgroundDots,
    ],
  );

  // Create the renderer once and mount its canvas into the container.
  useEffect(() => {
    setCopySupported(
      typeof navigator !== 'undefined' &&
        !!navigator.clipboard?.write &&
        typeof window.ClipboardItem !== 'undefined',
    );
    const qr = new QRCodeStyling(options);
    qrRef.current = qr;
    if (containerRef.current) qr.append(containerRef.current);
    // Intentionally created exactly once per mount; updates below use `.update()`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push style/content changes into the existing instance.
  useEffect(() => {
    qrRef.current?.update(options);
  }, [options]);

  const handleLogoUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    qrRef.current?.download({ name: 'qr-code', extension: downloadFormat });
  };

  const handleCopy = async () => {
    try {
      const raw = await qrRef.current?.getRawData('png');
      if (!raw || !(raw instanceof Blob)) throw new Error('No image data');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': raw })]);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    } finally {
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      {/* Preview + actions */}
      <div className="flex flex-col items-center gap-4 mx-auto lg:mx-0">
        <div
          ref={containerRef}
          className="rounded-xl border border-base-300 bg-base-100 shadow-sm p-3 [&_canvas]:rounded-lg"
          style={{ width: QR_SIZE + 24, height: QR_SIZE + 24 }}
        />

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            className={`btn btn-sm gap-1 ${copyState === 'copied' ? 'btn-success' : copyState === 'error' ? 'btn-error' : 'btn-outline'}`}
            onClick={handleCopy}
            disabled={!copySupported}
            title={copySupported ? 'Copy the QR code image to your clipboard' : 'Clipboard image copy is not supported in this browser'}
          >
            {copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Copy failed' : 'Copy'}
          </button>

          <div className="join">
            <select
              className="join-item select select-bordered select-sm"
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as FileExtension)}
              aria-label="Download format"
            >
              {DOWNLOAD_FORMATS.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt.toUpperCase()}
                </option>
              ))}
            </select>
            <button className="join-item btn btn-primary btn-sm" onClick={handleDownload}>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <label className="flex flex-col gap-1 col-span-2">
          <div className="label">
            <span className="label-text font-semibold">Content</span>
          </div>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="QR code content (URL, text, etc.)"
          />
        </label>

        <label className="flex flex-col gap-1">
          <div className="label">
            <span className="label-text">Dot Style</span>
          </div>
          <select
            className="select select-bordered select-sm w-full"
            value={dotsType}
            onChange={(e) => setDotsType(e.target.value as DotType)}
          >
            {DOT_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <div className="label">
            <span className="label-text">Error Correction</span>
          </div>
          <select
            className="select select-bordered select-sm w-full"
            value={errorCorrectionLevel}
            onChange={(e) => setErrorCorrectionLevel(e.target.value as ErrorCorrectionLevel)}
          >
            {ERROR_CORRECTION_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <div className="label">
            <span className="label-text">Corner Square Style</span>
          </div>
          <select
            className="select select-bordered select-sm w-full"
            value={cornersSquareType}
            onChange={(e) => setCornersSquareType(e.target.value as CornerSquareType)}
          >
            {CORNER_SQUARE_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <div className="label">
            <span className="label-text">Corner Dot Style</span>
          </div>
          <select
            className="select select-bordered select-sm w-full"
            value={cornersDotType}
            onChange={(e) => setCornersDotType(e.target.value as CornerDotType)}
          >
            {CORNER_DOT_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <ColorPickerField label="Foreground Color" value={dotsColor} onChange={setDotsColor} />

        <ColorPickerField label="Corner Color" value={cornersColor} onChange={setCornersColor} />

        <ColorPickerField
          label="Background Color"
          value={backgroundColor}
          onChange={setBackgroundColor}
        />

        <div className="col-span-2">
          <div className="divider my-1">Center Logo</div>
        </div>

        <label className="flex flex-col gap-1 col-span-2">
          <div className="label">
            <span className="label-text">Upload Image</span>
          </div>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered file-input-sm w-full"
            placeholder="Choose an image file"
            onChange={(e) => handleLogoUpload(e.target.files?.[0])}
          />
        </label>

        <label className="flex flex-col gap-1 col-span-2">
          <div className="label">
            <span className="label-text">Logo Size ({Math.round(logoSize * 100)}%)</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.5}
            step={0.05}
            className="range range-sm w-full"
            value={logoSize}
            onChange={(e) => setLogoSize(Number(e.target.value))}
            disabled={!logo}
          />
        </label>

        <label className="label flex flex-row items-center justify-start cursor-pointer gap-2 col-span-2">
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={hideBackgroundDots}
            onChange={(e) => setHideBackgroundDots(e.target.checked)}
            disabled={!logo}
          />
          <span className="label-text">Clear Dots Behind the Logo</span>
        </label>

        {logo && (
          <button className="btn btn-outline btn-md col-span-2" onClick={() => setLogo(null)}>
            Remove Logo
          </button>
        )}

        {logo && errorCorrectionLevel !== 'H' && errorCorrectionLevel !== 'Q' && (
          <p className="text-xs text-warning sm:col-span-2">
            Tip: use Quartile or High error correction when adding a logo so the code still scans
            reliably.
          </p>
        )}
      </div>
    </div>
  );
}
