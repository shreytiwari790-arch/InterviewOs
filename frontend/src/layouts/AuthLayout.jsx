import { Link, Outlet } from 'react-router';
import { Check } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { InterviewPreview } from '../components/marketing/InterviewPreview';

const highlights = ['Questions built from your resume', 'Company-specific interview patterns', 'Rubric-based feedback'];

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh bg-white">
      <div className="flex w-full flex-col px-6 py-6 sm:px-10 lg:w-[46%] lg:px-14 xl:px-20">
        <Link
          to="/"
          className="self-start rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
        >
          <Logo />
        </Link>

        <main className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-[400px]">
            <Outlet />
          </div>
        </main>

        <p className="text-xs text-slate-400">© {new Date().getFullYear()} InterviewOS</p>
      </div>

      <aside className="hidden p-3 lg:block lg:flex-1">
        <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-brand-50 via-slate-50 to-violet-50 px-12 py-10 xl:px-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.18) 1px, transparent 0)',
              backgroundSize: '24px 24px',
              maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
            }}
          />

          <div className="relative mx-auto w-full max-w-[480px]">
            <h2 className="text-[28px] leading-[1.2] font-semibold tracking-tight text-slate-900 xl:text-[32px]">
              Practice the interview you are actually going to face.
            </h2>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 [@media(max-height:720px)]:hidden">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Check className="size-4 text-brand-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <InterviewPreview className="mt-10 [@media(max-height:720px)]:mt-7" />
          </div>
        </div>
      </aside>
    </div>
  );
}
