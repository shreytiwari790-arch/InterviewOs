import { Link } from 'react-router';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { dashboardService } from '../../services/dashboardService';
import { interviewPath } from '../../utils/paths';

/** For signed-in candidates: a slim reminder when an interview is prepared or still in progress. */
export function ActiveInterviewBar() {
  const { data } = useApi((signal) => dashboardService.getCandidateDashboard(signal));
  const active = data?.activeInterview;
  if (!active) return null;

  return (
    <div className="border-b border-brand-100 bg-brand-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3 text-sm sm:px-8">
        <RotateCcw className="size-4 text-brand-600" aria-hidden="true" />
        <span className="text-ink-700">
          {active.status === 'ready' ? 'Your interview is ready:' : 'You have an interview in progress:'}{' '}
          <span className="font-semibold text-ink-900">
            {active.company} · {active.role}
          </span>
        </span>
        <Link
          to={interviewPath(active.id)}
          className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800"
        >
          {active.status === 'ready' ? 'Start now' : 'Continue'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
