import { useEffect, useState, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders its children only after the component has mounted in the browser.
 *
 * Routes are prerendered to static HTML by vite-react-ssg, so any component
 * that touches window/document/canvas/localStorage during render would crash
 * the build. Wrapping such components here defers them to after hydration and
 * shows `fallback` during the server render.
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <>{mounted ? children : fallback}</>;
}
