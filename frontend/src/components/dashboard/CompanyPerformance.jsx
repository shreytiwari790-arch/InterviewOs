import { cn } from '../../utils/cn';
import { formatShortDate, scoreTone } from '../../utils/format';

const barByTone = { success: 'bg-brand-500', warning: 'bg-amber-400', danger: 'bg-red-400' };

/** Average and best score for each company the candidate has practised for. */
export function CompanyPerformance({ companies }) {
  return (
    <ul className="space-y-4">
      {companies.map(({ company, attempts, averageScore, bestScore, lastCompletedAt }) => (
        <li key={company} className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-xs font-semibold text-white">
            {company.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-semibold text-ink-900">{company}</p>
              <p className="shrink-0 text-sm font-semibold text-ink-900 tabular-nums">{averageScore}%</p>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn('h-full rounded-full', barByTone[scoreTone(averageScore)])}
                style={{ width: `${averageScore}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-ink-500">
              {attempts} attempt{attempts === 1 ? '' : 's'} · best {bestScore}% · last{' '}
              {formatShortDate(lastCompletedAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
