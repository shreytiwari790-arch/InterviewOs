import { Link } from 'react-router';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { paths, reportPath } from '../../utils/paths';
import { buttonClasses } from '../ui/buttonStyles';

/** What to work on next: weak topics and the recommendations from the latest report. */
export function FocusPlan({ advice, weakTopics }) {
  const topics = [...new Set([...weakTopics.map(({ topic }) => topic), ...advice.weakTopics])].slice(0, 6);
  const scores = new Map(weakTopics.map(({ topic, score }) => [topic, score]));

  return (
    <div className="space-y-6">
      {topics.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wider text-ink-500 uppercase">Topics that need work</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 ring-1 ring-amber-200 ring-inset"
              >
                {topic}
                {scores.has(topic) && <span className="text-xs text-amber-700 tabular-nums">{scores.get(topic)}%</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {advice.recommendations.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wider text-ink-500 uppercase">Recommended next steps</p>
          <ol className="space-y-2.5">
            {advice.recommendations.map((recommendation, index) => (
              <li key={recommendation} className="flex gap-3 rounded-2xl bg-slate-50 p-3.5 text-sm text-ink-700">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{recommendation}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <p className="flex items-center gap-2 text-xs text-ink-500">
          <Lightbulb className="size-3.5 text-brand-600" aria-hidden="true" />
          From your {advice.company ? `${advice.company} ` : ''}report on {formatDate(advice.createdAt)}
        </p>
        <div className="flex gap-2">
          <Link to={reportPath(advice.interviewId)} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            Open report
          </Link>
          <Link to={paths.newInterview} className={buttonClasses({ size: 'sm' })}>
            Practise again
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
