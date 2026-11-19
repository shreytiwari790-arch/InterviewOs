import { Link } from 'react-router';
import {
  ArrowRight,
  Award,
  BarChart3,
  Check,
  CheckCircle2,
  FileText,
  FileUp,
  History,
  LineChart,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { RecentInterviews } from '../../components/dashboard/RecentInterviews';
import { ScoreRing } from '../../components/dashboard/ScoreRing';
import { ScoreTrendChart } from '../../components/dashboard/ScoreTrendChart';
import { TopicPerformance } from '../../components/dashboard/TopicPerformance';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { EmptyState } from '../../components/ui/EmptyState';
import { Panel } from '../../components/ui/Panel';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { cn } from '../../utils/cn';
import { firstName, greetingForTime } from '../../utils/format';
import { experienceLabels } from '../../utils/labels';
import { interviewPath, paths } from '../../utils/paths';

const linkClasses = 'text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800';

function heroMessage(data) {
  if (!data) return 'Loading your preparation…';
  const completed = data.stats.completedInterviews;
  if (!data.profile) return 'Upload your resume so every question is built around your own experience.';
  if (completed === 0) return 'Your resume is ready. Pick a company and take your first mock interview.';
  const weak = data.topics.weak[0]?.topic;
  return weak
    ? `${completed} interview${completed === 1 ? '' : 's'} done. Your biggest opportunity right now is ${weak}.`
    : `${completed} interview${completed === 1 ? '' : 's'} done. Keep the momentum going.`;
}

function HeroStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-xl bg-white/10">
        <Icon className="size-4 text-brand-300" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">{label}</p>
        <p className="text-sm font-semibold text-white tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function DashboardHero({ user, data, isLoading }) {
  const stats = data?.stats;
  const hasProfile = Boolean(data?.profile);

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-ink-900 p-6 sm:p-10">
      <div
        className="pointer-events-none absolute -top-40 -right-24 size-[460px] rounded-full bg-brand-500/25 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
          backgroundSize: '26px 26px',
          maskImage: 'linear-gradient(90deg, black, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-brand-200">
            <span className="size-1.5 rounded-full bg-brand-400" />
            {greetingForTime()}
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[40px] sm:leading-tight">
            {firstName(user.name)}, here is <span className="text-brand-300">your progress</span>
          </h1>
          <p className="mt-3 max-w-lg leading-relaxed text-slate-300">{heroMessage(data)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={paths.newInterview} className={buttonClasses({ size: 'lg' })}>
              <PlayCircle className="size-5" aria-hidden="true" />
              Start new interview
            </Link>
            <Link
              to={paths.resume}
              className={buttonClasses({
                variant: 'secondary',
                size: 'lg',
                className: 'border-white/15 bg-white/10 text-white shadow-none hover:border-white/25 hover:bg-white/15',
              })}
            >
              <FileUp className="size-5" aria-hidden="true" />
              {hasProfile ? 'View resume' : 'Upload resume'}
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur sm:flex-row sm:justify-center lg:flex-col xl:flex-row">
          {isLoading && !data ? (
            <Skeleton className="size-[132px] rounded-full bg-white/10" />
          ) : (
            <ScoreRing score={stats?.averageScore}>
              <span className="text-3xl font-semibold text-white tabular-nums">
                {stats?.averageScore != null ? `${stats.averageScore}%` : '—'}
              </span>
              <span className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-400 uppercase">Average</span>
            </ScoreRing>
          )}
          <div className="grid w-full max-w-56 gap-4">
            <HeroStat icon={CheckCircle2} label="Completed" value={stats?.completedInterviews ?? 0} />
            <HeroStat icon={Award} label="Best score" value={stats?.bestScore != null ? `${stats.bestScore}%` : '—'} />
            <HeroStat icon={Target} label="Topics to improve" value={data ? data.topics.weak.length : 0} />
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneyStrip({ data }) {
  const hasProfile = Boolean(data?.profile);
  const hasInterview = (data?.stats.completedInterviews ?? 0) > 0;
  const hasRepeat = (data?.stats.completedInterviews ?? 0) > 1;
  const steps = [
    {
      title: 'Analyse your resume',
      text: data?.resume?.status === 'analyzing' ? 'Analysis in progress…' : 'Personalises every question.',
      done: hasProfile,
      to: paths.resume,
    },
    {
      title: 'Take a mock interview',
      text: 'Pick the company and role you want.',
      done: hasInterview,
      to: paths.newInterview,
    },
    { title: 'Practise again', text: 'Turn weak topics into strengths.', done: hasRepeat, to: paths.newInterview },
  ];
  const currentIndex = steps.findIndex((step) => !step.done);

  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        return (
          <li key={step.title}>
            <Link
              to={step.to}
              className={cn(
                'flex h-full items-center gap-4 rounded-2xl border p-4 transition-colors',
                isCurrent
                  ? 'border-brand-200 bg-brand-50/70 hover:border-brand-300'
                  : 'border-slate-200/80 bg-white hover:border-slate-300',
              )}
            >
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  step.done
                    ? 'bg-brand-500 text-white'
                    : isCurrent
                      ? 'bg-ink-900 text-white'
                      : 'bg-slate-100 text-ink-500',
                )}
              >
                {step.done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink-900">{step.title}</span>
                <span className="block truncate text-xs text-ink-500">{step.done ? 'Done' : step.text}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
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
            Upload resume
          </Link>
        }
      />
    );
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-xs">
          <FileText className="size-5 text-brand-600" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{resume.fileName}</p>
          <p className="text-xs text-ink-500">{experienceLabels[profile.experienceLevel] ?? 'Analysed'}</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wider text-ink-500 uppercase">Top skills</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.topSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800 ring-1 ring-brand-100 ring-inset"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      {profile.focusAreas.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wider text-ink-500 uppercase">Prepare next</p>
          <ul className="space-y-2">
            {profile.focusAreas.map((area) => (
              <li key={area} className="flex items-center gap-2.5 text-sm text-ink-700">
                <Sparkles className="size-3.5 shrink-0 text-brand-500" aria-hidden="true" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((row) => (
        <Skeleton key={row} className="h-12 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, isLoading, reload } = useApi((signal) => dashboardService.getCandidateDashboard(signal));
  const isInitialLoad = isLoading && !data;
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

      <DashboardHero user={user} data={data} isLoading={isLoading} />

      {active && (
        <div className="flex flex-col gap-4 rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-5 sm:flex-row sm:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 shadow-sm shadow-brand-700/30">
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

      <JourneyStrip data={data} />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <Panel
          icon={LineChart}
          title="Performance trend"
          description="Overall score across your recent interviews"
          className="lg:col-span-2"
        >
          {isInitialLoad ? (
            <Skeleton className="h-56 w-full rounded-2xl" />
          ) : data?.scoreTrend.length > 1 ? (
            <ScoreTrendChart points={data.scoreTrend} />
          ) : (
            <EmptyState
              icon={BarChart3}
              title="Your trend appears here"
              description="Complete at least two interviews to see how your scores change."
              className="h-56"
            />
          )}
        </Panel>

        <Panel icon={Target} title="Topics" description="From your last 10 reports">
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
        </Panel>

        <Panel
          icon={History}
          title="Recent interviews"
          description="Open any interview to see its full report"
          className="lg:col-span-2"
          action={
            data?.recentInterviews.length > 0 && (
              <Link to={paths.interviewHistory} className={linkClasses}>
                View all
              </Link>
            )
          }
        >
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
        </Panel>

        <Panel
          icon={FileText}
          title="Your resume"
          action={
            data?.profile && (
              <Link to={paths.resume} className={linkClasses}>
                Full analysis
              </Link>
            )
          }
        >
          {isInitialLoad ? <LoadingRows /> : data && <ResumeSnapshot data={data} />}
        </Panel>
      </div>
    </div>
  );
}
