import { Link } from 'react-router-dom';
import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';

export default function Sidebar() {
  return (
    <div className="drawer-side z-40">
      <label htmlFor="my-drawer" className="drawer-overlay" aria-label="Close menu"></label>
      <aside className="px-2 pt-2 h-auto min-h-full w-[19rem] bg-base-200 text-base-content flex flex-col">
        <div className="w-fit mx-auto mt-5 mb-6">
          <Link to="/">
            <div className="avatar transition ease-in-out hover:scale-[102%] block m-auto">
              <div className="w-[8.5rem]">
                <img
                  className="mask mask-circle"
                  width={300}
                  height={300}
                  src="/pfp.jpg"
                  alt="Profile image"
                />
              </div>
            </div>
          </Link>
        </div>
        <SidebarMenu />
        <SidebarFooter />
      </aside>
    </div>
  );
}
