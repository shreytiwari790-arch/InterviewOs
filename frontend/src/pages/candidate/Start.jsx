import { Link } from 'react-router';
import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  CheckCircle2,
  FileText,
  FileUp,
  PlayCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { cn } from '../../utils/cn';
import { firstName, formatDate, scoreTone } from '../../utils/format';
import { interviewPath, paths, reportPath } from '../../utils/paths';

const steps = [
  { icon: FileUp, title: 'Upload your resume', text: 'We read your skills, projects and experience.' },
  { icon: Building2, title: 'Pick company and role', text: 'TCS, Infosys, Amazon, Google and more.' },
  { icon: Sparkles, title: 'We prepare everything', text: 'Questions, answer keys and rubrics in under a minute.' },
  { icon: BarChart3, title: 'Interview and report', text: 'Timed, one question at a time, then detailed feedback.' },
];

const scoreClasses = { success: 'text-brand-700', warning: 'text-amber-600', danger: 'text-red-600' };

function StatPill({ icon: Icon, label, value, isLoading }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left backdrop-blur">
      <Icon className="size-5 shrink-0 text-brand-300" aria-hidden="true" />
      <div>
        <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-4 w-16 bg-white/10" />
        ) : (
          <p className="text-sm font-semibold text-white">{value}</p>
        )}
      </div>
    </div>
  );
}

/** Candidate home after sign-in: one clear call to action that starts the guided interview flow. */
export default function Start() {
  const { user } = useAuth();
  const { data, isLoading } = useApi((signal) => dashboardService.getCandidateDashboard(signal));
  const active = data?.activeInterview;
  const hasResume = Boolean(data?.profile);
  const recent = data?.recentInterviews.slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] bg-ink-900 px-6 py-14 text-center sm:px-16 sm:py-20">
        <div
          className="pointer-events-none absolute -top-48 left-1/2 size-[620px] -translate-x-1/2 rounded-full bg-brand-500/30 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
          }}
          aria-hidden="true"
        />
        <div className="relative animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-brand-200">
            <span className="size-1.5 rounded-full bg-brand-400" />
            Welcome, {firstName(user.name)}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-[34px] leading-[1.15] font-semibold tracking-tight text-white sm:text-5xl lg:text-[56px]">
            Your next interview could be <span className="text-brand-300">your best one</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Upload your resume, choose the company you are targeting and we will prepare a personalised mock interview
            in minutes.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {active ? (
              <>
                <Link to={interviewPath(active.id)} className={buttonClasses({ size: 'lg', className: 'group px-8' })}>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {active.status === 'ready' ? 'Start your prepared interview' : 'Continue your interview'}
                </Link>
                <Link
                  to={paths.newInterview}
                  className="text-sm font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline"
                >
                  Prepare a different one
                </Link>
              </>
            ) : (
              <Link
                to={paths.newInterview}
                className={buttonClasses({ size: 'lg', className: 'group px-10 text-base' })}
              >
                Get started
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            )}
          </div>
          {active && (
            <p className="mt-4 text-sm text-slate-400">
              {active.company} · {active.role}
            </p>
          )}

          <div className="mx-auto mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
            <StatPill
              icon={FileText}
              label="Resume"
              value={hasResume ? 'Analysed' : data?.resume?.status === 'analyzing' ? 'Analysing…' : 'Not uploaded'}
              isLoading={isLoading && !data}
            />
            <StatPill
              icon={CheckCircle2}
              label="Interviews"
              value={`${data?.stats.completedInterviews ?? 0} completed`}
              isLoading={isLoading && !data}
            />
            <StatPill
              icon={Award}
              label="Best score"
              value={data?.stats.bestScore != null ? `${data.stats.bestScore}%` : 'No score yet'}
              isLoading={isLoading && !data}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wider text-ink-500 uppercase">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li
              key={title}
              className="relative rounded-3xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-200"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50">
                  <Icon className="size-5 text-brand-600" aria-hidden="true" />
                </span>
                <span className="text-3xl font-semibold text-slate-100">{index + 1}</span>
              </div>
              <p className="mt-4 font-semibold text-ink-900">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Your resume</h2>
            <Link to={paths.resume} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              {hasResume ? 'View analysis' : 'Upload'}
            </Link>
          </div>
          {isLoading && !data ? (
            <Skeleton className="mt-4 h-20" />
          ) : hasResume ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {data.profile.topSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                    {skill}
                  </span>
                ))}
              </div>
              {data.profile.focusAreas.length > 0 && (
                <p className="text-sm text-ink-600">
                  <span className="font-medium text-ink-800">Prepare next:</span> {data.profile.focusAreas.join(', ')}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-ink-500">
              No resume yet. Upload one in the first step so questions are built around your own projects.
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Recent interviews</h2>
            <Link to={paths.dashboard} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              Open dashboard
            </Link>
          </div>
          {isLoading && !data ? (
            <Skeleton className="mt-4 h-20" />
          ) : recent.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {recent.map((interview) => (
                <li key={interview.id}>
                  <Link to={reportPath(interview.id)} className="flex items-center gap-3 py-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-ink-900 text-xs font-semibold text-white">
                      {interview.company.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">
                        {interview.company} · {interview.role}
                      </span>
                      <span className="text-xs text-ink-500">{formatDate(interview.completedAt)}</span>
                    </span>
                    <span
                      className={cn('text-sm font-semibold tabular-nums', scoreClasses[scoreTone(interview.score)])}
                    >
                      {interview.score}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 flex items-center gap-3 text-sm text-ink-500">
              <PlayCircle className="size-5 text-slate-300" aria-hidden="true" />
              Your completed interviews and scores will appear here.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
