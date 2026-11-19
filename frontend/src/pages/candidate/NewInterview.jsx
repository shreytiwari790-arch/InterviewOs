import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  FileText,
  Info,
  ListChecks,
  Search,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { companyService } from '../../services/companyService';
import { dashboardService } from '../../services/dashboardService';
import { interviewService } from '../../services/interviewService';
import { cn } from '../../utils/cn';
import { categoryLabels, difficultyLabels, difficultyTones, experienceLabels } from '../../utils/labels';
import { interviewPath } from '../../utils/paths';
import { ResumeStep } from '../../components/interview/ResumeStep';

const STEPS = ['Resume', 'Company', 'Role', 'Prepare'];
const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90];

function Stepper({ step }) {
  return (
    <ol className="mb-8 flex items-center gap-3">
      {STEPS.map((label, index) => {
        const state = index < step ? 'done' : index === step ? 'current' : 'upcoming';
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                state === 'done' && 'bg-brand-500 text-white',
                state === 'current' && 'bg-ink-900 text-white',
                state === 'upcoming' && 'bg-slate-100 text-ink-500',
              )}
            >
              {state === 'done' ? <Check className="size-4" strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={cn(
                'hidden text-sm font-medium sm:block',
                state === 'upcoming' ? 'text-ink-500' : 'text-ink-900',
              )}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && <span className="h-px w-8 bg-slate-200 sm:w-14" />}
          </li>
        );
      })}
    </ol>
  );
}

function CompanyMonogram({ company, size = 'md' }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl font-semibold text-white shadow-sm',
        size === 'lg' ? 'size-14 text-lg' : 'size-12 text-base',
      )}
      style={{ backgroundColor: company.accentColor }}
      aria-hidden="true"
    >
      {company.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function SegmentedControl({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-700">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              value === option.value
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-slate-200 bg-white text-ink-700 hover:border-slate-300',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Mirrors the backend's largest-remainder split so the preview matches the generated interview. */
function previewPlan(distribution, total, hasProfile) {
  const usable = distribution.filter(
    (entry) => entry.weight > 0 && (hasProfile || entry.category !== 'resume_project'),
  );
  const totalWeight = usable.reduce((sum, entry) => sum + entry.weight, 0);
  const plan = usable.map(({ category, weight }) => {
    const value = (weight / totalWeight) * total;
    return { category, count: Math.floor(value), remainder: value % 1 };
  });
  let remaining = total - plan.reduce((sum, entry) => sum + entry.count, 0);
  [...plan]
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((entry) => {
      if (remaining-- > 0) entry.count += 1;
    });
  return plan.filter((entry) => entry.count > 0);
}

function CompanyStep({ onSelect }) {
  const [search, setSearch] = useState('');
  const { data, error, isLoading } = useApi((signal) => companyService.list(signal));
  const companies = (data?.companies ?? []).filter((company) =>
    `${company.name} ${company.industry} ${company.roles.join(' ')}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <>
      <div className="relative mb-6 max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-500"
          aria-hidden="true"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search companies or roles"
          aria-label="Search companies"
          className="h-12 w-full rounded-full border border-slate-200 bg-white pr-4 pl-11 text-sm shadow-xs transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
      </div>
      {error && <Alert tone="error">{error.message}</Alert>}
      {isLoading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <Skeleton key={key} className="h-40 rounded-3xl" />
          ))}
        </div>
      ) : companies.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <button
              key={company.id}
              type="button"
              onClick={() => onSelect(company)}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
            >
              <div className="flex items-center gap-4">
                <CompanyMonogram company={company} />
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{company.name}</p>
                  <p className="text-xs text-ink-500">{company.industry}</p>
                </div>
                <ArrowRight
                  className="ml-auto size-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-600">{company.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {company.roles.map((role) => (
                  <span key={role} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-ink-600">
                    {role}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon={Search} title="No companies match your search" description="Try another name or role." />
      )}
    </>
  );
}

function RoleStep({ company, onSelect }) {
  const { data, error, isLoading } = useApi((signal) => companyService.get(company.slug, signal), [company.slug]);

  return (
    <>
      <div className="mb-6 flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5">
        <CompanyMonogram company={company} size="lg" />
        <div>
          <p className="text-lg font-semibold text-ink-900">{company.name}</p>
          <p className="max-w-2xl text-sm text-ink-600">{company.description}</p>
        </div>
      </div>
      {error && <Alert tone="error">{error.message}</Alert>}
      {isLoading && !data ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-56 rounded-3xl" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelect(role)}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-ink-900">{role.roleName}</p>
                  <p className="text-sm text-ink-500">{role.track}</p>
                </div>
                <Badge tone={difficultyTones[role.difficulty]}>{difficultyLabels[role.difficulty]}</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{role.summary}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-600">
                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-4 text-ink-500" aria-hidden="true" />
                  {role.durationMinutes} min
                </span>
                <span className="flex items-center gap-1.5">
                  <ListChecks className="size-4 text-ink-500" aria-hidden="true" />
                  {role.totalQuestions} questions
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {role.topics.slice(0, 5).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                Choose this role
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-6 flex items-start gap-2 text-xs text-ink-500">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Role tracks are preparation profiles based on available information, not official interview patterns.
      </p>
    </>
  );
}

function ConfigureStep({ company, role, onAddResume }) {
  const navigate = useNavigate();
  const { data: dashboard } = useApi((signal) => dashboardService.getCandidateDashboard(signal));
  const [config, setConfig] = useState({
    experienceLevel: role.experienceLevel,
    difficulty: role.difficulty,
    durationMinutes: role.durationMinutes,
    totalQuestions: role.totalQuestions,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const hasProfile = Boolean(dashboard?.profile);
  const plan = useMemo(
    () => previewPlan(role.categoryDistribution, config.totalQuestions, hasProfile),
    [role.categoryDistribution, config.totalQuestions, hasProfile],
  );
  const update = (field) => (value) => setConfig((current) => ({ ...current, [field]: value }));

  async function generate() {
    setIsSubmitting(true);
    setError('');
    try {
      const { interview } = await interviewService.create({ blueprintId: role.id, ...config });
      navigate(interviewPath(interview.id));
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
  }

  const facts = [
    ['Experience', experienceLabels[config.experienceLevel]],
    ['Difficulty', difficultyLabels[config.difficulty]],
    ['Duration', `${config.durationMinutes} minutes`],
    ['Questions', config.totalQuestions],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden">
        <div className="relative overflow-hidden bg-ink-900 px-6 py-7 sm:px-8">
          <div
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-brand-500/25 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex items-center gap-4">
            <CompanyMonogram company={company} size="lg" />
            <div>
              <p className="text-xs font-semibold tracking-wider text-brand-300 uppercase">Your interview</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {company.name} · {role.roleName}
              </p>
              <p className="text-sm text-slate-400">{role.track}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map(([term, value]) => (
              <div key={term} className="rounded-2xl bg-slate-50 px-4 py-3">
                <dt className="text-xs text-ink-500">{term}</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-ink-500 uppercase">Question mix</p>
            <div className="flex flex-wrap gap-2">
              {plan.map(({ category, count }) => (
                <span
                  key={category}
                  className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800"
                >
                  {categoryLabels[category]} · {count}
                </span>
              ))}
            </div>
          </div>

          <div
            className={cn(
              'flex gap-3 rounded-2xl p-4 text-sm',
              hasProfile ? 'bg-brand-50 text-brand-900' : 'bg-amber-50 text-amber-900',
            )}
          >
            <FileText className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {hasProfile ? (
              <span>Personalised with your analysed resume. Expect questions about your own projects.</span>
            ) : (
              <span>
                No analysed resume, so resume questions are skipped.{' '}
                <button type="button" onClick={onAddResume} className="font-semibold underline underline-offset-2">
                  Add one
                </button>
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setShowSettings((open) => !open)}
              aria-expanded={showSettings}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-ink-800"
            >
              Adjust settings (optional)
              <ChevronDown
                className={cn('size-4 text-ink-500 transition-transform', showSettings && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
            {showSettings && (
              <div className="space-y-7 border-t border-slate-100 px-5 py-6">
                <SegmentedControl
                  label="Experience level"
                  value={config.experienceLevel}
                  onChange={update('experienceLevel')}
                  options={Object.entries(experienceLabels).map(([value, label]) => ({ value, label }))}
                />
                <SegmentedControl
                  label="Difficulty"
                  value={config.difficulty}
                  onChange={update('difficulty')}
                  options={Object.entries(difficultyLabels).map(([value, label]) => ({ value, label }))}
                />
                <SegmentedControl
                  label="Duration"
                  value={config.durationMinutes}
                  onChange={update('durationMinutes')}
                  options={DURATION_OPTIONS.map((minutes) => ({ value: minutes, label: `${minutes} min` }))}
                />
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="question-count" className="text-sm font-medium text-ink-700">
                      Number of questions
                    </label>
                    <span className="rounded-full bg-ink-900 px-3 py-0.5 text-sm font-semibold text-white tabular-nums">
                      {config.totalQuestions}
                    </span>
                  </div>
                  <input
                    id="question-count"
                    type="range"
                    min={5}
                    max={30}
                    value={config.totalQuestions}
                    onChange={(event) => update('totalQuestions')(Number(event.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>
              </div>
            )}
          </div>

          {error && <Alert tone="error">{error}</Alert>}
          <Button size="lg" variant="dark" className="w-full text-base" onClick={generate} isLoading={isSubmitting}>
            <Sparkles className="size-4" aria-hidden="true" />
            Prepare my interview
          </Button>
          <p className="text-center text-xs text-ink-500">
            We write your questions, answer keys and rubrics. It usually takes under a minute.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function NewInterview() {
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState(null);
  const [role, setRole] = useState(null);

  const titles = [
    ['Start with your resume', 'Questions are built around the projects and skills on your resume.'],
    ['Choose a company', 'Pick the company you are preparing for.'],
    ['Choose a role', 'Each role follows its own interview preparation profile.'],
    ['Ready to prepare your interview', 'Check the details, then we will prepare everything for you.'],
  ];

  return (
    <>
      <Stepper step={step} />
      <PageHeader
        title={titles[step][0]}
        description={titles[step][1]}
        actions={
          step > 0 && (
            <Button variant="secondary" onClick={() => setStep((current) => current - 1)}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Button>
          )
        }
      />
      {step === 0 && <ResumeStep onContinue={() => setStep(1)} />}
      {step === 1 && (
        <CompanyStep
          onSelect={(selected) => {
            setCompany(selected);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <RoleStep
          company={company}
          onSelect={(selected) => {
            setRole(selected);
            setStep(3);
          }}
        />
      )}
      {step === 3 && <ConfigureStep company={company} role={role} onAddResume={() => setStep(0)} />}
    </>
  );
}
