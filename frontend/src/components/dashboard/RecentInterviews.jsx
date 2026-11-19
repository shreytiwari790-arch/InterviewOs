import { Link } from 'react-router';
import { Badge } from '../ui/Badge';
import { formatDate, scoreTone } from '../../utils/format';
import { interviewPath } from '../../utils/paths';

export function RecentInterviews({ interviews }) {
  return (
    <ul className="divide-y divide-slate-100">
      {interviews.map((interview) => (
        <li key={interview.id}>
          <Link
            to={interviewPath(interview.id)}
            className="-mx-2 flex items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700">
              {interview.company.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">
                {interview.company} · {interview.role}
              </p>
              <p className="text-xs text-slate-500">
                {formatDate(interview.completedAt)}
                {interview.difficulty && <span className="capitalize"> · {interview.difficulty}</span>}
              </p>
            </div>
            {typeof interview.score === 'number' && <Badge tone={scoreTone(interview.score)}>{interview.score}%</Badge>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
