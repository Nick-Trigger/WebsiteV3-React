import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

const cvSections = [
  ['profile', 'Profile'],
  ['education', 'Education'],
  ['engineering-experience', 'Engineering Experience'],
  ['research-experience', 'Research Experience'],
  ['patents', 'Patents'],
  ['projects', 'Projects'],
  ['leadership', 'Leadership'],
  ['certifications', 'Certifications'],
  ['skills', 'Skills'],
] as const;

export default function SidebarMenu() {
  const { pathname } = useLocation();

  const active = (test: boolean) =>
    `py-3 my-0.5 text-base${test ? ' bg-primary text-white' : ''}`;

  const onCv = /^\/cv/.test(pathname);

  // The section links pop out as a floating flyout anchored to the CV item.
  // It is portaled to <body> with fixed positioning so the sidebar's
  // overflow-y-auto doesn't clip it, and so it overlays the page content
  // instead of pushing the rest of the sidebar down.
  const cvItemRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flyout, setFlyout] = useState<{ top: number; left: number } | null>(null);

  const openFlyout = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = cvItemRef.current?.getBoundingClientRect();
    if (rect) setFlyout({ top: rect.top, left: rect.right });
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setFlyout(null), 120);
  };

  return (
    <ul className="menu grow shrink menu-md overflow-y-auto no-scrollbar flex flex-col items-start w-full items-stretch">
      <li>
        <Link className={active(pathname === '/')} to="/">
          Home
        </Link>
      </li>
      <li>
        <Link className={active(/^\/projects/.test(pathname))} to="/projects">
          Projects
        </Link>
      </li>
      <li
        ref={cvItemRef}
        onMouseEnter={onCv ? openFlyout : undefined}
        onMouseLeave={onCv ? scheduleClose : undefined}
      >
        <Link
          className={`${active(onCv)} flex w-full items-center justify-between`}
          to="/cv"
          onFocus={onCv ? openFlyout : undefined}
          onBlur={onCv ? scheduleClose : undefined}
        >
          <span>CV</span>
          {onCv && (
            <span aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                role="img"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                style={{ fill: 'currentColor' }}
              >
                <path fill="currentColor" fill-rule="evenodd" d="M9.97 7.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06L13.44 12L9.97 8.53a.75.75 0 0 1 0-1.06" clip-rule="evenodd"></path>
              </svg>
            </span>
          )}
        </Link>
      </li>

      {onCv &&
        flyout &&
        createPortal(
          <ul
            className="menu menu-sm fixed z-50 w-56 rounded-box border border-base-content/10 bg-base-100 shadow-xl"
            style={{ top: flyout.top, left: flyout.left }}
            onMouseEnter={openFlyout}
            onMouseLeave={scheduleClose}
          >
            {cvSections.map(([id, label]) => (
              <li key={id}>
                {/* Plain anchor so the browser scrolls natively to the section */}
                <a className="text-sm" href={`/cv#${id}`} onClick={() => setFlyout(null)}>
                  {label}
                </a>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </ul>
  );
}
