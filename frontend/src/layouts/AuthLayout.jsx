import { lazy, Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import { Check } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const InterviewAnimation = lazy(() => import('../components/marketing/InterviewAnimation'));

const highlights = [
  'Questions built from your resume',
  'Company-specific interview patterns',
  'Scored feedback on every answer',
];

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh bg-white">
      <div className="flex w-full flex-col px-6 py-6 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        <Link
          to="/"
          className="self-start rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
        >
          <Logo />
        </Link>

        <main className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-[400px] animate-fade-up">
            <Outlet />
          </div>
        </main>

        <p className="text-xs text-ink-500">© {new Date().getFullYear()} InterviewOS</p>
      </div>

      <aside className="hidden p-3 lg:block lg:w-1/2">
        <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-50 via-white to-brand-100/70 px-10 py-10">
          <div
            className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-300/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-brand-200/40 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex w-full max-w-md flex-col items-center text-center">
            <div className="aspect-square w-full max-w-[380px] [@media(max-height:760px)]:max-w-[280px]">
              <Suspense fallback={null}>
                <InterviewAnimation className="size-full" />
              </Suspense>
            </div>
            <h2 className="mt-4 text-[26px] leading-tight font-semibold tracking-tight xl:text-[30px]">
              Walk in already knowing <span className="text-brand-600">what they&apos;ll ask</span>
            </h2>
            <ul className="mt-6 space-y-2.5 text-left [@media(max-height:700px)]:hidden">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-ink-600">
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand-500">
                    <Check className="size-3 text-white" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
