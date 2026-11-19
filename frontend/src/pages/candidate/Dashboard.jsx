import { Award, CheckCircle2, FileText, Gauge, History, LineChart, PlayCircle, Target } from 'lucide-react';
import { NextSteps } from '../../components/dashboard/NextSteps';
import { RecentInterviews } from '../../components/dashboard/RecentInterviews';
import { ScoreTrendChart } from '../../components/dashboard/ScoreTrendChart';
import { TopicPerformance } from '../../components/dashboard/TopicPerformance';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/ui/StatCard';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { firstName, formatDate, greetingForTime } from '../../utils/format';
import { paths } from '../../utils/paths';

const resumeStatusLabels = {
  uploaded: { label: 'Uploaded', tone: 'neutral' },
  analyzing: { label: 'Analysing', tone: 'brand' },
  analyzed: { label: 'Analysed', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
};

function ResumeStatCard({ resume, isLoading }) {
  const status = resume && resumeStatusLabels[resume.status];
  return (
    <StatCard
      label="Resume"
      icon={FileText}
      isLoading={isLoading}
      value={
        status ? (
          <Badge tone={status.tone} className="align-middle text-sm">
            {status.label}
          </Badge>
        ) : (
          <span className="text-slate-400">—</span>
        )
      }
      hint={resume ? resume.fileName : 'No resume uploaded yet'}
    />
  );
}

function LoadingList() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((row) => (
        <Skeleton key={row} className="h-11 w-full" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, isLoading, reload } = useApi((signal) => dashboardService.getCandidateDashboard(signal));
  const isInitialLoad = isLoading && !data;

  return (
    <>
      <PageHeader
        title={`${greetingForTime()}, ${firstName(user.name)}`}
        description="Here's where your interview preparation stands."
        actions={
          <ButtonLink to={paths.newInterview}>
            <PlayCircle className="size-4" aria-hidden="true" />
            Start new interview
          </ButtonLink>
        }
      />

      {error && (
        <Alert tone="error" className="mb-6">
          {error.message}{' '}
          <Button variant="ghost" size="sm" onClick={reload} className="ml-1 h-auto px-1 py-0 underline">
            Try again
          </Button>
        </Alert>
      )}

      {data?.activeInterview && (
        <Alert tone="info" title="You have an interview in progress" className="mb-6">
          {data.activeInterview.company} · {data.activeInterview.role}, started{' '}
          {formatDate(data.activeInterview.startedAt)}.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumeStatCard resume={data?.resume} isLoading={isInitialLoad} />
        <StatCard
          label="Interviews completed"
          icon={CheckCircle2}
          isLoading={isInitialLoad}
          value={data?.stats.completedInterviews ?? 0}
        />
        <StatCard
          label="Average score"
          icon={Gauge}
          isLoading={isInitialLoad}
          value={data?.stats.averageScore != null ? `${data.stats.averageScore}%` : '—'}
          hint={data?.stats.averageScore == null ? 'Shown after your first interview' : undefined}
        />
        <StatCard
          label="Best score"
          icon={Award}
          isLoading={isInitialLoad}
          value={data?.stats.bestScore != null ? `${data.stats.bestScore}%` : '—'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Performance trend" description="Overall score across your recent interviews" />
          <CardBody>
            {isInitialLoad ? (
              <Skeleton className="h-56 w-full" />
            ) : data?.scoreTrend.length > 1 ? (
              <ScoreTrendChart points={data.scoreTrend} />
            ) : (
              <EmptyState
                icon={LineChart}
                title="Not enough data yet"
                description="Complete at least two interviews to see how your scores change over time."
                className="h-56"
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recommended next steps" />
          <CardBody>{isInitialLoad ? <LoadingList /> : <NextSteps steps={data?.nextSteps ?? []} />}</CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Recent interviews" />
          <CardBody>
            {isInitialLoad ? (
              <LoadingList />
            ) : data?.recentInterviews.length ? (
              <RecentInterviews interviews={data.recentInterviews} />
            ) : (
              <EmptyState
                icon={History}
                title="No interviews yet"
                description="Your completed interviews and their scores will appear here."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Topics" description="Based on your last 10 reports" />
          <CardBody>
            {isInitialLoad ? (
              <LoadingList />
            ) : data?.topics.strong.length || data?.topics.weak.length ? (
              <TopicPerformance strong={data.topics.strong} weak={data.topics.weak} />
            ) : (
              <EmptyState
                icon={Target}
                title="No topic data yet"
                description="Strong and weak topics appear after your first report."
              />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
