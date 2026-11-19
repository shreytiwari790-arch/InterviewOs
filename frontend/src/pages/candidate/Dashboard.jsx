import { Link } from 'react-router';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  FileText,
  FileUp,
  Gauge,
  History,
  LineChart,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { RecentInterviews } from '../../components/dashboard/RecentInterviews';
import { ScoreTrendChart } from '../../components/dashboard/ScoreTrendChart';
import { TopicPerformance } from '../../components/dashboard/TopicPerformance';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { cn } from '../../utils/cn';
import { firstName, greetingForTime } from '../../utils/format';
import { experienceLabels } from '../../utils/labels';
import { interviewPath, paths } from '../../utils/paths';

function JourneyStep({ index, title, description, isDone, isCurrent }) {
  return (
    <li className="flex gap-4">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
          isDone
            ? 'bg-brand-500 text-white'
            : isCurrent
              ? 'bg-white text-ink-900'
              : 'border border-white/20 text-slate-400',
        )}
      >
        {isDone ? <CheckCircle2 className="size-5" aria-hidden="true" /> : index}
      </span>
      <div className="min-w-0 flex-1 pb-1">
        <p
          className={cn(
            'text-sm font-semibold',
            isDone ? 'text-slate-400 line-through decoration-slate-500' : 'text-white',
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
    </li>
  );
}

function WelcomeBanner({ user, data, isLoading }) {
  const hasProfile = Boolean(data?.profile);
  const completed = data?.stats.completedInterviews ?? 0;
  const hasInterview = completed > 0;
  const isAnalysing = data?.resume?.status === 'analyzing';
  const stepsDone = [hasProfile, hasInterview, hasInterview].filter(Boolean).length;

  const message = !data
    ? 'Loading your preparation…'
    : !hasProfile
      ? 'Start by uploading your resume so every question is built around your experience.'
      : !hasInterview
        ? 'Your resume is ready. Pick a company and take your first mock interview.'
        : `You have completed ${completed} interview${completed === 1 ? '' : 's'}. Keep the momentum going.`;

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-ink-900 p-6 sm:p-8 lg:p-10">
      <div
        className="pointer-events-none absolute -top-32 -right-20 size-96 rounded-full bg-brand-500/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-1/3 size-80 rounded-full bg-brand-700/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-medium text-brand-300">{greetingForTime()}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {firstName(user.name)}, ready to practise?
          </h1>
          <p className="mt-3 max-w-lg leading-relaxed text-slate-300">{message}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={paths.newInterview} className={buttonClasses({ size: 'lg' })}>
              <PlayCircle className="size-5" aria-hidden="true" />
              Start new interview
            </Link>
            <Link
              to={paths.resume}
              className={buttonClasses({
                variant: 'secondary',
                size: 'lg',
                className: 'border-white/15 bg-white/10 text-white hover:border-white/25 hover:bg-white/15',
              })}
            >
              <FileUp className="size-5" aria-hidden="true" />
              {hasProfile ? 'View resume' : 'Upload resume'}
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Your preparation journey</p>
            <span className="text-xs font-medium text-brand-300 tabular-nums">{stepsDone}/3</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand-400 transition-[width] duration-700"
              style={{ width: `${(stepsDone / 3) * 100}%` }}
            />
          </div>
          {isLoading && !data ? (
            <Skeleton className="mt-6 h-32 bg-white/10" />
          ) : (
            <ol className="mt-6 space-y-5">
              <JourneyStep
                index={1}
                title="Upload and analyse your resume"
                description={isAnalysing ? 'Analysis in progress…' : 'Personalises every question you get.'}
                isDone={hasProfile}
                isCurrent={!hasProfile}
              />
              <JourneyStep
                index={2}
                title="Complete your first mock interview"
                description="Choose the company and role you are targeting."
                isDone={hasInterview}
                isCurrent={hasProfile && !hasInterview}
              />
              <JourneyStep
                index={3}
                title="Review your report and practise again"
                description="Work on weak topics until they become strengths."
                isDone={hasInterview}
                isCurrent={false}
              />
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

const statTones = {
  brand: 'bg-brand-50 text-brand-600',
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
};

function StatTile({ icon: Icon, label, value, hint, tone, isLoading }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <span className={cn('flex size-10 items-center justify-center rounded-2xl', statTones[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      {isLoading ? (
        <Skeleton className="mt-4 h-8 w-20" />
      ) : (
        <p className="mt-4 text-[28px] leading-none font-semibold tracking-tight text-ink-900 tabular-nums">{value}</p>
      )}
      <p className="mt-2 text-sm font-medium text-ink-600">{label}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

function ResumeSnapshot({ data }) {
  const { profile, resume } = data;
  if (!profile) {
    return (
      <EmptyState
        icon={FileText}
        title={resume?.status === 'analyzing' ? 'Analysing your resume…' : 'No analysed resume yet'}
        description="Upload your resume to get questions about your own projects and skills."
        action={
          <Link to={paths.resume} className={buttonClasses({ size: 'sm' })}>
            Go to resume
          </Link>
        }
      />
    );
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-xs">
          <FileText className="size-5 text-brand-600" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-900">{resume.fileName}</p>
          <p className="text-xs text-ink-500">{experienceLabels[profile.experienceLevel]}</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wider text-ink-500 uppercase">Top skills</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.topSkills.map((skill) => (
            <span key={skill} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
              {skill}
            </span>
          ))}
        </div>
      </div>
      {profile.focusAreas.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wider text-ink-500 uppercase">Prepare next</p>
          <ul className="space-y-1.5">
            {profile.focusAreas.map((area) => (
              <li key={area} className="flex items-center gap-2 text-sm text-ink-700">
                <Sparkles className="size-3.5 text-brand-500" aria-hidden="true" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link
        to={paths.resume}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        View full analysis
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((row) => (
        <Skeleton key={row} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, isLoading, reload } = useApi((signal) => dashboardService.getCandidateDashboard(signal));
  const isInitialLoad = isLoading && !data;
  const stats = data?.stats;
  const active = data?.activeInterview;

  return (
    <div className="space-y-6">
      {error && (
        <Alert tone="error">
          {error.message}{' '}
          <Button variant="ghost" size="sm" onClick={reload} className="ml-1 h-auto px-1 py-0 underline">
            Try again
          </Button>
        </Alert>
      )}

      <WelcomeBanner user={user} data={data} isLoading={isLoading} />

      {active && (
        <div className="flex flex-col gap-4 rounded-3xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500">
            <RotateCcw className="size-5 text-white" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-ink-900">
              {active.status === 'ready' ? 'Your interview is ready to start' : 'You have an interview in progress'}
            </p>
            <p className="text-sm text-ink-600">
              {active.company} · {active.role}
            </p>
          </div>
          <Link to={interviewPath(active.id)} className={buttonClasses({ variant: 'dark' })}>
            {active.status === 'ready' ? 'Start now' : 'Continue'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={CheckCircle2}
          tone="brand"
          label="Interviews completed"
          value={stats?.completedInterviews ?? 0}
          isLoading={isInitialLoad}
        />
        <StatTile
          icon={Gauge}
          tone="sky"
          label="Average score"
          value={stats?.averageScore != null ? `${stats.averageScore}%` : '—'}
          hint={stats?.averageScore == null ? 'After your first interview' : undefined}
          isLoading={isInitialLoad}
        />
        <StatTile
          icon={Award}
          tone="amber"
          label="Best score"
          value={stats?.bestScore != null ? `${stats.bestScore}%` : '—'}
          isLoading={isInitialLoad}
        />
        <StatTile
          icon={Target}
          tone="violet"
          label="Topics to improve"
          value={data ? data.topics.weak.length : 0}
          hint={data?.topics.weak[0] ? `Start with ${data.topics.weak[0].topic}` : 'Shown after your first report'}
          isLoading={isInitialLoad}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
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
                title="Your trend appears here"
                description="Complete at least two interviews to see how your scores change."
                className="h-56"
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Resume snapshot" />
          <CardBody>{isInitialLoad ? <LoadingRows /> : data && <ResumeSnapshot data={data} />}</CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent interviews"
            action={
              data?.recentInterviews.length > 0 && (
                <Link to={paths.interviewHistory} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                  View all
                </Link>
              )
            }
          />
          <CardBody>
            {isInitialLoad ? (
              <LoadingRows />
            ) : data?.recentInterviews.length ? (
              <RecentInterviews interviews={data.recentInterviews} />
            ) : (
              <EmptyState
                icon={History}
                title="No interviews yet"
                description="Your completed interviews and scores will be listed here."
                action={
                  <Link to={paths.newInterview} className={buttonClasses({ size: 'sm', variant: 'dark' })}>
                    Take your first interview
                  </Link>
                }
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Topics" description="From your last 10 reports" />
          <CardBody>
            {isInitialLoad ? (
              <LoadingRows />
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
    </div>
  );
}
