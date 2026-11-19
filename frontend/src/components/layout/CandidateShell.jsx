import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { ChevronDown, LogOut, Menu, Plus, Settings, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { firstName } from '../../utils/format';
import { paths } from '../../utils/paths';
import { Avatar } from '../ui/Avatar';
import { buttonClasses } from '../ui/buttonStyles';
import { Logo } from '../ui/Logo';

const links = [
  { to: paths.start, label: 'Home', end: true },
  { to: paths.dashboard, label: 'Dashboard' },
  { to: paths.resume, label: 'Resume' },
  { to: paths.interviewHistory, label: 'History', end: true },
];

function navLinkClasses({ isActive }) {
  return cn(
    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-slate-50 hover:text-ink-900',
  );
}

/** Closes a popover when the user clicks outside it or presses Escape. */
function useDismiss(isOpen, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointer = (event) => ref.current && !ref.current.contains(event.target) && close();
    const onKey = (event) => event.key === 'Escape' && close();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);
  return ref;
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDismiss(isOpen, () => setIsOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full border border-transparent py-1 pr-2 pl-1 transition-colors hover:border-slate-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-brand-500"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Avatar name={user.name} />
        <span className="hidden max-w-28 truncate text-sm font-medium text-ink-800 md:block">
          {firstName(user.name)}
        </span>
        <ChevronDown
          className={cn('hidden size-4 text-ink-500 transition-transform md:block', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 origin-top-right animate-fade-up rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-ink-900/10 [animation-duration:150ms]"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar name={user.name} className="size-10 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
              <p className="truncate text-xs text-ink-500">{user.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <Link
            to={paths.settings}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-700 hover:bg-slate-50"
          >
            <Settings className="size-4 text-ink-500" aria-hidden="true" />
            Account settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Top-navigation frame shared by every candidate page, so the start page,
 * dashboard, resume and reports all feel like one product.
 */
export function CandidateShell() {
  const { pathname } = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isSettingUp = pathname === paths.newInterview;

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setIsMobileOpen(false);
  }

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,var(--color-brand-50)_0%,#ffffff_420px)] bg-no-repeat">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
          <Link to={paths.start} aria-label="InterviewOS home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClasses}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {!isSettingUp && (
              <span className="hidden sm:block">
                <Link to={paths.newInterview} className={buttonClasses({ size: 'sm' })}>
                  <Plus className="size-4" aria-hidden="true" />
                  New interview
                </Link>
              </span>
            )}
            <UserMenu />
            <button
              type="button"
              onClick={() => setIsMobileOpen((open) => !open)}
              className="rounded-full p-2 text-ink-600 hover:bg-slate-100 md:hidden"
              aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {isMobileOpen && (
          <nav className="border-t border-slate-100 bg-white px-5 py-3 md:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-1">
              {links.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={navLinkClasses}>
                  {label}
                </NavLink>
              ))}
              {!isSettingUp && (
                <Link to={paths.newInterview} className={buttonClasses({ size: 'md', className: 'mt-2' })}>
                  <Plus className="size-4" aria-hidden="true" />
                  New interview
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}
