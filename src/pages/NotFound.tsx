import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BaseLayout from '../components/BaseLayout';
import { useConsent } from '../consent';

export default function NotFound() {
  const { state } = useConsent();

  useEffect(() => {
    // Only signal Clarity when analytics consent is granted. The consent
    // module wires the Clarity consent API on window.clarity.
    if (typeof window !== 'undefined' && state === 'granted') {
      try {
        window.clarity?.('event', 'page_not_found', { path: window.location.pathname });
      } catch {
        // ignore errors — clarity might not be loaded yet
      }
    }
  }, [state]);
  return (
    <BaseLayout title="404: Not Found" includeSidebar={false}>
      <div className="justify-center">
        <h1 className="text-9xl font-bold mb-4">🏝</h1>
        <h1 className="text-9xl font-bold mb-2">404</h1>
        <h3 className="text-2xl">The page you're looking for couldn't be found.</h3>
        <Link className="btn btn-accent mt-9" to="/">
          Home
        </Link>
      </div>
    </BaseLayout>
  );
}
