import { Link } from 'react-router';
import { ArrowRight, Clock3, History, PlayCircle } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { interviewService } from '../../services/interviewService';
import { formatDate, scoreTone } from '../../utils/format';
import { interviewStatusLabels } from '../../utils/labels';
import { interviewPath, paths, reportPath } from '../../utils/paths';

export default function InterviewHistory() {
  const { data, error, isLoading } = useApi((signal) => interviewService.list(signal));
  const interviews = data?.interviews ?? [];

  return (
    <>
      <PageHeader
        title="Interview history"
        description="Every interview you have taken, with scores and reports."
        actions={
          <ButtonLink to={paths.newInterview}>
            <PlayCircle className="size-4" aria-hidden="true" />
            New interview
          </ButtonLink>
        }
      />
      {error && (
        <Alert tone="error" className="mb-6">
          {error.message}
        </Alert>
      )}

      {isLoading && !data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-20 rounded-3xl" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <Card>
          <EmptyState
            icon={History}
            title="No interviews yet"
            description="Take your first mock interview and your results will appear here."
            action={<ButtonLink to={paths.newInterview}>Start an interview</ButtonLink>}
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {interviews.map((interview) => {
            const status = interviewStatusLabels[interview.status];
            const isCompleted = interview.status === 'completed';
            return (
              <li key={interview.id}>
                <Link
                  to={isCompleted ? reportPath(interview.id) : interviewPath(interview.id)}
                  className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-md hover:shadow-brand-900/5 sm:p-5"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-sm font-semibold text-white">
                    {interview.company.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">
                      {interview.company.name} · {interview.role.name}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-500">
                      <span>{formatDate(interview.completedAt ?? interview.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Clock3 className="size-3" aria-hidden="true" />
                        {interview.config.durationMinutes} min
                      </span>
                      <span>{interview.questionCount || interview.config.totalQuestions} questions</span>
                    </p>
                  </div>
                  {isCompleted ? (
                    <span
                      className={`text-xl font-semibold tabular-nums ${scoreTone(interview.overallScore) === 'success' ? 'text-brand-700' : scoreTone(interview.overallScore) === 'warning' ? 'text-amber-600' : 'text-red-600'}`}
                    >
                      {interview.overallScore}%
                    </span>
                  ) : (
                    <Badge tone={status.tone}>{status.label}</Badge>
                  )}
                  <ArrowRight
                    className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
