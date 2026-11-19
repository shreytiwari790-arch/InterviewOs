import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { upcomingPaths } from '../../utils/paths';
import { Avatar } from '../ui/Avatar';
import { Logo } from '../ui/Logo';

function NavItem({ to, label, icon: Icon, end }) {
  const baseClasses = 'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';

  if (upcomingPaths.has(to)) {
    return (
      <span className={cn(baseClasses, 'cursor-default text-slate-400')} aria-disabled="true">
        <Icon className="size-[18px] text-slate-300" aria-hidden="true" />
        {label}
        <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
          Soon
        </span>
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(baseClasses, isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-slate-50 hover:text-ink-900')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn('size-[18px]', isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-ink-500')}
            aria-hidden="true"
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ navigation, homePath, badge }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <Link to={homePath} className="rounded-md focus-visible:outline-2 focus-visible:outline-brand-500">
          <Logo />
        </Link>
        {badge && (
          <span className="rounded-md bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
            {badge}
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Main">
        {navigation.map((section) => (
          <div key={section.label ?? 'main'}>
            {section.label && (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-brand-500"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Shared application frame: fixed sidebar on desktop, slide-over drawer on mobile. */
export function AppShell({ navigation, homePath, badge }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Prevent the page behind the mobile drawer from scrolling.
  useEffect(() => {
    document.body.style.overflow = isMobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  return (
    <div className="min-h-dvh bg-slate-50/70">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white lg:block">
        <SidebarContent navigation={navigation} homePath={homePath} badge={badge} />
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Link to={homePath}>
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </header>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute top-4 right-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            {/* Any link click inside the drawer closes it */}
            <div onClick={(event) => event.target.closest('a') && setIsMobileNavOpen(false)} className="h-full">
              <SidebarContent navigation={navigation} homePath={homePath} badge={badge} />
            </div>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
