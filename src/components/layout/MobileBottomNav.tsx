import { NavLink } from 'react-router-dom';
import { navItems } from './navConfig';

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-7 border-t border-slate-200 bg-white py-1 dark:border-slate-800 dark:bg-slate-950 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium',
                isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
