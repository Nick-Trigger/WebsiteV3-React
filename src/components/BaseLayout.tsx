import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from './Seo';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import ContextMenu from './ContextMenu';

interface BaseLayoutProps {
  title?: string;
  description?: string;
  image?: string;
  includeSidebar?: boolean;
  children: ReactNode;
}

export default function BaseLayout({
  title,
  description,
  image,
  includeSidebar = true,
  children,
}: BaseLayoutProps) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Close the mobile drawer after a client-side navigation.
    const drawer = document.getElementById('my-drawer') as HTMLInputElement | null;
    if (drawer) drawer.checked = false;

    // Scroll handling: jump to a #anchor when present (e.g. CV sections),
    // otherwise reset to the top of the page on each navigation.
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return (
    <>
      <Seo title={title} description={description} image={image} />
      <ContextMenu />
      <div className="bg-base-100 drawer lg:drawer-open">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content bg-base-100">
          <Header />
          <div className="md:flex md:justify-center">
            {/* key={pathname} replays the enter animation on each navigation;
                the sidebar lives outside <main>, so it persists across routes. */}
            <main key={pathname} className="page-enter p-6 pt-10 lg:max-w-[80%] max-w-[100vw]">
              {children}
            </main>
          </div>
          <Footer />
        </div>
        {includeSidebar && <Sidebar />}
      </div>
    </>
  );
}
