import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { paths } from '../../utils/paths';
import { buttonClasses } from '../ui/buttonStyles';
import { Avatar } from '../ui/Avatar';
import { Logo } from '../ui/Logo';
import { useStartCta } from '../../hooks/useStartCta';

const sectionLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const startCta = useStartCta('Try for free');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const actions = user ? (
    <>
      <Link
        to={user.role === 'admin' ? paths.admin : paths.dashboard}
        className="px-3 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
      >
        {user.role === 'admin' ? 'Admin panel' : 'Dashboard'}
      </Link>
      <Link to={startCta.to} className={buttonClasses({ variant: 'dark', size: 'sm' })}>
        {startCta.label}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
      <span className="ml-1 flex items-center gap-1">
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
      </span>
    </>
  ) : (
    <>
      <Link to={paths.login} className="px-3 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900">
        Sign in
      </Link>
      <Link to={startCta.to} className={buttonClasses({ variant: 'dark', size: 'sm' })}>
        {startCta.label}
      </Link>
    </>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white/85 backdrop-blur-lg transition-shadow duration-200',
        isScrolled ? 'shadow-[0_1px_0_0_rgb(226_232_240)]' : '',
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          to={paths.home}
          aria-label="InterviewOS home"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {sectionLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[15px] font-medium text-ink-700 transition-colors hover:text-brand-700"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">{actions}</div>

        <button
          type="button"
          className="rounded-full p-2 text-ink-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 pt-3 pb-5 shadow-lg lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {sectionLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink-800 hover:bg-slate-50"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">{actions}</div>
        </div>
      )}
    </header>
  );
}
