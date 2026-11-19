import { Link } from 'react-router';
import { buttonClasses } from '../components/ui/buttonStyles';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link to="/" className={buttonClasses({ variant: 'secondary', className: 'mt-8' })}>
        Go home
      </Link>
    </main>
  );
}
