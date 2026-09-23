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

  const onCv = false; // /^\/cv/.test(pathname); //! Disabled
  
  //! Disabled 09/04/2026 - Migrated to PDF viewer
  // Desktop (lg+): the section links pop out as a floating flyout anchored to
  // the CV item. It is portaled to <body> with fixed positioning so the
  // sidebar's overflow-y-auto doesn't clip it, and so it overlays the page
  // content instead of pushing the rest of the sidebar down.
  // Mobile: hover doesn't exist and the flyout would overflow the drawer, so
  // the sections render as an inline submenu toggled by the chevron instead.
  const cvItemRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flyout, setFlyout] = useState<{ top: number; left: number } | null>(null);
  const [subOpen, setSubOpen] = useState(false);

  const FLYOUT_H = 320; // estimate, used only to keep the flyout on-screen

  const openFlyout = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = cvItemRef.current?.getBoundingClientRect();
    if (rect)
      setFlyout({
        top: Math.max(8, Math.min(rect.top, window.innerHeight - FLYOUT_H)),
        left: rect.right,
      });
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
      <li>
        <Link className={active(/^\/resume/.test(pathname))} to="/resume">
          Resume
        </Link>
      </li>
      <li>
        <Link className={active(/^\/cv/.test(pathname))} to="/cv">
          CV
        </Link>
      </li>
    </ul>
  );
}
