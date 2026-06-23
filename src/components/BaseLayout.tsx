import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from './Seo';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

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
  const { pathname } = useLocation();

  // Close the mobile drawer after a client-side navigation.
  useEffect(() => {
    const drawer = document.getElementById('my-drawer') as HTMLInputElement | null;
    if (drawer) drawer.checked = false;
  }, [pathname]);

  return (
    <>
      <Seo title={title} description={description} image={image} />
      <div className="bg-base-100 drawer lg:drawer-open">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content bg-base-100">
          <Header />
          <div className="md:flex md:justify-center">
            <main className="p-6 pt-10 lg:max-w-[80%] max-w-[100vw]">{children}</main>
          </div>
          <Footer />
        </div>
        {includeSidebar && <Sidebar />}
      </div>
    </>
  );
}
