import { cn } from '../../utils/cn';
import { categoryLabels } from '../../utils/labels';

function sectionStatus(score) {
  if (score >= 75) return { label: 'Strong', chip: 'bg-brand-50 text-brand-700 ring-brand-200', bar: 'bg-brand-500' };
  if (score >= 60) return { label: 'Getting there', chip: 'bg-sky-50 text-sky-700 ring-sky-200', bar: 'bg-sky-500' };
  return { label: 'Needs work', chip: 'bg-amber-50 text-amber-800 ring-amber-200', bar: 'bg-amber-400' };
}

/**
 * Average score for each interview section (MCQs, Core CS, HR…), weakest first.
 * Sections the candidate has not been tested on yet are listed at the end.
 */
export function SectionBreakdown({ categories }) {
  const practised = new Set(categories.map(({ category }) => category));
  const untested = Object.keys(categoryLabels).filter((category) => !practised.has(category));
  const weakest = categories[0];

  return (
    <div>
      {weakest && weakest.score < 75 && (
        <p className="mb-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-ink-700">
          Focus first on{' '}
          <span className="font-semibold text-ink-900">{categoryLabels[weakest.category] ?? weakest.category}</span>,
          your lowest section at <span className="font-semibold tabular-nums">{weakest.score}%</span>.
        </p>
      )}
      <ul className="space-y-4">
        {categories.map(({ category, score, attempts }) => {
          const status = sectionStatus(score);
          return (
            <li key={category}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink-900">
                    {categoryLabels[category] ?? category}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
                      status.chip,
                    )}
                  >
                    {status.label}
                  </span>
                </div>
                <span className="shrink-0 text-sm text-ink-500">
                  <span className="font-semibold text-ink-900 tabular-nums">{score}%</span>
                  <span className="ml-2 hidden text-xs sm:inline">
                    {attempts} interview{attempts === 1 ? '' : 's'}
                  </span>
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn('h-full rounded-full transition-[width] duration-700', status.bar)}
                  style={{ width: `${score}%` }}
                />
              </div>
            </li>
          );
        })}
        {untested.map((category) => (
          <li key={category} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-ink-500">{categoryLabels[category]}</span>
            <span className="text-xs text-ink-500">Not tested yet</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
