/**
 * Inline SVG logos for the playground languages. Drawn by hand (simplified)
 * so we don't ship binary assets or hotlink third-party images.
 */

export function PythonLogo({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="Python logo">
      {/* top snake */}
      <path
        fill="#3776AB"
        d="M12 2C8.1 2 7.1 3.2 7.1 4.9V7h5v.7H5.3C3.5 7.7 2 9.2 2 11.9s1.5 4.2 3.3 4.2h1.8v-2.4c0-1.9 1.6-3.4 3.5-3.4h4.8c1.6 0 2.8-1.3 2.8-2.9V4.9C18.2 3.2 15.9 2 12 2Z"
      />
      {/* bottom snake */}
      <path
        fill="#FFD43B"
        d="M12 22c3.9 0 4.9-1.2 4.9-2.9V17h-5v-.7h6.8c1.8 0 3.3-1.5 3.3-4.2s-1.5-4.2-3.3-4.2h-1.8v2.4c0 1.9-1.6 3.4-3.5 3.4H8.6c-1.6 0-2.8 1.3-2.8 2.9v2.5C5.8 20.8 8.1 22 12 22Z"
      />
      <circle cx="9.4" cy="4.8" r="1" fill="#fff" />
      <circle cx="14.6" cy="19.2" r="1" fill="#fff" />
    </svg>
  );
}

/** Shared hexagon shape used by the C and C++ marks. */
function HexBadge({
  className,
  fill,
  label,
  text,
  fontSize,
}: {
  className: string;
  fill: string;
  label: string;
  text: string;
  fontSize: number;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label={label}>
      <path fill={fill} d="M12 1.2 21.4 6.6v10.8L12 22.8 2.6 17.4V6.6L12 1.2Z" />
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize={fontSize}
        fill="#fff"
      >
        {text}
      </text>
    </svg>
  );
}

export function CLogo({ className = 'w-16 h-16' }: { className?: string }) {
  return <HexBadge className={className} fill="#03599C" label="C logo" text="C" fontSize={11} />;
}

export function CppLogo({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <HexBadge className={className} fill="#00427E" label="C++ logo" text="C++" fontSize={8.5} />
  );
}

export function RustLogo({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="Rust logo">
      {/* simplified gear */}
      <g fill="#F74C00">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const cx = 12 + Math.cos(angle) * 10.2;
          const cy = 12 + Math.sin(angle) * 10.2;
          return <circle key={i} cx={cx} cy={cy} r="1.8" />;
        })}
        <circle cx="12" cy="12" r="9.4" />
      </g>
      <text
        x="12"
        y="12.2"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="ui-serif, Georgia, serif"
        fontWeight="700"
        fontSize="12"
        fill="#fff"
      >
        R
      </text>
    </svg>
  );
}

export function JavaScriptLogo({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="JavaScript logo">
      <rect x="1" y="1" width="22" height="22" rx="2.5" fill="#F7DF1E" />
      <text
        x="17.5"
        y="20.5"
        textAnchor="end"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="11"
        fill="#000"
      >
        JS
      </text>
    </svg>
  );
}
