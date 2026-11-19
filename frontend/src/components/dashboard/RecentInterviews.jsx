import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatDate, scoreTone } from '../../utils/format';
import { reportPath } from '../../utils/paths';

const toneClasses = {
  success: { text: 'text-brand-700', bar: 'bg-brand-500' },
  warning: { text: 'text-amber-600', bar: 'bg-amber-400' },
  danger: { text: 'text-red-600', bar: 'bg-red-400' },
};

/** Completed interviews with a score bar; each row opens its report. */
export function RecentInterviews({ interviews }) {
  return (
    <ul className="-mx-2 space-y-1">
      {interviews.map((interview) => {
        const hasScore = typeof interview.score === 'number';
        const tone = toneClasses[scoreTone(interview.score ?? 0)];
        return (
          <li key={interview.id}>
            <Link
              to={reportPath(interview.id)}
              className="group flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-slate-50"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-xs font-semibold tracking-wide text-white">
                {interview.company.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{interview.company}</p>
                <p className="truncate text-xs text-ink-500">
                  {interview.role} · {formatDate(interview.completedAt)}
                  {interview.difficulty && <span className="capitalize"> · {interview.difficulty}</span>}
                </p>
              </div>
              {hasScore && (
                <div className="hidden w-28 sm:block">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full', tone.bar)} style={{ width: `${interview.score}%` }} />
                  </div>
                </div>
              )}
              <span className={cn('w-12 text-right text-sm font-semibold tabular-nums', tone.text)}>
                {hasScore ? `${interview.score}%` : '—'}
              </span>
              <ChevronRight
                className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-500"
                aria-hidden="true"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
