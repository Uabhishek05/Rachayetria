import { BellIcon, MagnifyingGlassIcon, ChevronDownIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/features/theme/ThemeContext';

export function TopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-3 md:px-5">
        <Link to={user ? '/home' : '/'} className="w-32 sm:w-40 md:w-48">
          <img
            src="/logo-r.jpeg"
            alt="Rachayetria logo"
            className="h-10 w-auto rounded-md object-contain md:h-11"
          />
        </Link>
        <div className="hidden flex-1 md:block">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search books, authors, discussions"
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/search?q=' + encodeURIComponent((e.target as HTMLInputElement).value));
                }
              }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5 text-slate-300" />
          ) : (
            <MoonIcon className="h-5 w-5 text-slate-600" />
          )}
        </button>
        {user ? (
          <>
            <Link to="/search" className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-600" />
            </Link>
            <Link to="/notifications" className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
              <BellIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            </Link>
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                <img
                  src={user.photoURL ?? 'https://i.pravatar.cc/60?img=32'}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <ChevronDownIcon className="hidden h-4 w-4 text-slate-500 dark:text-slate-400 md:block" />
              </MenuButton>
              <MenuItems anchor="bottom end" className="z-40 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <MenuItem>
                  <Link className="block rounded-lg px-3 py-2 text-sm data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-800" to="/profile">
                    Profile
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link className="block rounded-lg px-3 py-2 text-sm data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-800" to="/admin">
                    Admin
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={logout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm data-[focus]:bg-slate-100 dark:data-[focus]:bg-slate-800"
                  >
                    Log out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </>
        ) : (
          <Link to="/auth">
            <Button className="px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
