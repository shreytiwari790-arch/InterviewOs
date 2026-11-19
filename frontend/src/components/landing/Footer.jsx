import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { paths } from '../../utils/paths';
import { Logo } from '../ui/Logo';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '#how-it-works', label: 'How it works' },
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#about', label: 'About us' },
      { href: '#contact', label: 'Contact' },
    ],
  },
];

export function Footer() {
  const { user } = useAuth();
  const accountLinks = user
    ? [
        { to: paths.dashboard, label: 'Dashboard' },
        { to: paths.newInterview, label: 'New interview' },
      ]
    : [
        { to: paths.login, label: 'Sign in' },
        { to: paths.register, label: 'Try for free' },
      ];

  return (
    <footer className="border-t border-slate-200 bg-slate-900">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_2fr]">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-5 text-sm leading-relaxed text-slate-400">
            AI-powered interview preparation built around your resume and the company you want to join.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {[...columns, { title: 'Account', links: accountLinks }].map(({ title, links }) => (
            <div key={title}>
              <p className="text-sm font-semibold tracking-wide text-slate-200 uppercase">{title}</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                {links.map(({ href, to, label }) => (
                  <li key={label}>
                    {to ? (
                      <Link to={to} className="transition-colors hover:text-brand-400">
                        {label}
                      </Link>
                    ) : (
                      <a href={href} className="transition-colors hover:text-brand-400">
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-700/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} InterviewOS. All rights reserved.</p>
          <p>Company names identify preparation tracks only and do not imply affiliation.</p>
        </div>
      </div>
    </footer>
  );
}
