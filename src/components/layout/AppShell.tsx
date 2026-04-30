import { Outlet, useLocation } from 'react-router-dom';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const hiddenShellRoutes = ['/auth'];

export function AppShell() {
  const location = useLocation();
  const hideShell = hiddenShellRoutes.includes(location.pathname);

  if (hideShell) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopNavbar />
      <div className="mx-auto flex max-w-[1600px] px-3 pt-20 md:px-5">
        <LeftSidebar />
        <main className="w-full pb-24 md:ml-72 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
