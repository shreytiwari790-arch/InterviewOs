import { Link, NavLink, Outlet } from 'react-router';
import { LogOut } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';
import { paths } from '../utils/paths';

const links = [
  { to: paths.dashboard, label: 'Dashboard' },
  { to: paths.interviewHistory, label: 'History', end: true },
  { to: paths.resume, label: 'Resume' },
];

/** Light, sidebar-free frame for the start page and the guided interview setup. */
export function FocusLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-brand-50/50 via-white to-white">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
          <Link to={paths.start} aria-label="InterviewOS home">
            <Logo />
          </Link>
          <nav className="ml-auto hidden items-center gap-1 sm:flex" aria-label="Main">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:text-ink-900',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:ml-2">
            <Avatar name={user.name} />
            <button
              type="button"
              onClick={logout}
              className="rounded-full p-2 text-ink-500 transition-colors hover:bg-slate-100 hover:text-ink-800"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Outlet />
      </main>
    </div>
  );
}
