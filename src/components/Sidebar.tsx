import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';
import BouncyHeadshot from './BouncyHeadshot';

export default function Sidebar() {
  return (
    <div className="drawer-side z-40 no-scrollbar">
      <label htmlFor="my-drawer" className="drawer-overlay" aria-label="Close menu"></label>
      <aside className="px-2 pt-2 h-auto min-h-full w-[19rem] bg-base-200 text-base-content flex flex-col">
        <BouncyHeadshot />
        <SidebarMenu />
        <SidebarFooter />
      </aside>
    </div>
  );
}
