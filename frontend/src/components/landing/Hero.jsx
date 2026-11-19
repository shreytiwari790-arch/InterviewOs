import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Check, Clock3, Quote, SendHorizontal } from 'lucide-react';
import { sampleQuestions } from '../../content/marketing';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useStartCta } from '../../hooks/useStartCta';
import { firstName } from '../../utils/format';
import { buttonClasses } from '../ui/buttonStyles';

const ROTATE_EVERY_MS = 4500;
const heroPoints = ['Resume-aware questions', 'Company-specific patterns', 'Scored feedback'];

/** Dark preview card cycling through sample questions, one per category. Clicking a chip pins it. */
function QuestionShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const active = sampleQuestions[activeIndex];

  useEffect(() => {
    if (isPinned) return undefined;
    const timer = setInterval(() => setActiveIndex((index) => (index + 1) % sampleQuestions.length), ROTATE_EVERY_MS);
    return () => clearInterval(timer);
  }, [isPinned]);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-brand-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="rounded-[28px] bg-ink-900 p-5 shadow-2xl shadow-ink-900/30 sm:p-6">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Question categories">
          {sampleQuestions.map(({ category }, index) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              onClick={() => {
                setActiveIndex(index);
                setIsPinned(true);
              }}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                index === activeIndex
                  ? 'border-brand-400 bg-brand-500 text-white'
                  : 'border-white/15 text-slate-300 hover:border-white/30 hover:text-white',
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div
          className="mt-5 min-h-[210px] rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
          role="tabpanel"
        >
          <div key={activeIndex} className="animate-fade-up">
            <Quote className="size-5 fill-brand-400 text-brand-400" aria-hidden="true" />
            <p className="mt-3 text-lg leading-snug font-semibold text-white sm:text-xl">{active.question}</p>
            {active.options && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {active.options.map((option) => (
                  <span key={option} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300">
                    {option}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-sm text-slate-400 tabular-nums">
            <Clock3 className="size-4" aria-hidden="true" />
            0:00 / 3:00
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:block">Type your answer</span>
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-500 shadow-[0_0_0_6px_rgb(18_179_139_/_0.18)]">
              <SendHorizontal className="size-5 text-white" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const { user } = useAuth();
  const startCta = useStartCta();

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-gradient-to-b from-brand-50/70 to-white"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-12 pb-20 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pt-20 lg:pb-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center rounded-full bg-brand-100/80 px-4 py-1.5 text-sm font-medium text-brand-800">
            {user ? `Welcome back, ${firstName(user.name)}` : 'AI mock interviews, tailored to you'}
          </span>
          <h1 className="mt-6 text-[40px] leading-[1.12] font-semibold tracking-tight sm:text-5xl lg:text-[54px]">
            Walk in already knowing <span className="block text-brand-600">what they&apos;ll ask</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
            Upload your resume, pick your target company and role, and practise with questions modelled on how they
            interview. Get scored, specific feedback before the real thing.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to={startCta.to} className={buttonClasses({ variant: 'dark', size: 'lg', className: 'group' })}>
              {startCta.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="text-[15px] font-medium text-ink-700 underline-offset-4 hover:text-brand-700 hover:underline"
            >
              See how it works
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
            {heroPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-ink-600">
                <span className="flex size-5 items-center justify-center rounded-full bg-brand-100">
                  <Check className="size-3 text-brand-700" strokeWidth={3} aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <QuestionShowcase />
      </div>
    </section>
  );
}
