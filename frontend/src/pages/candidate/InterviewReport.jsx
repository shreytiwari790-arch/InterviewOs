import { useState } from 'react';
import { useParams } from 'react-router';
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Lightbulb,
  Download,
  Printer,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { interviewService } from '../../services/interviewService';
import { cn } from '../../utils/cn';
import { formatDate, scoreTone } from '../../utils/format';
import { categoryLabels, difficultyLabels, integrityEventLabels, scoreVerdict, typeLabels } from '../../utils/labels';
import { paths } from '../../utils/paths';

const toneClasses = {
  success: { bar: 'bg-brand-500', text: 'text-brand-700' },
  warning: { bar: 'bg-amber-500', text: 'text-amber-700' },
  danger: { bar: 'bg-red-500', text: 'text-red-600' },
};

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-40 shrink-0">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-1000"
        />
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#69e0bd" />
            <stop offset="1" stopColor="#12b38b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold text-white tabular-nums">{score}%</span>
        <span className="text-xs font-medium text-brand-200">{scoreVerdict(score)}</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }) {
  const tone = toneClasses[scoreTone(score)];
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink-700">{label}</span>
        <span className={cn('font-semibold tabular-nums', tone.text)}>{score}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full transition-[width] duration-700', tone.bar)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function ListCard({ icon: Icon, title, items, tone = 'brand', emptyText }) {
  const iconClasses = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    ink: 'bg-slate-100 text-ink-700',
  };
  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className={cn('flex size-8 items-center justify-center rounded-xl', iconClasses[tone])}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            {title}
          </span>
        }
      />
      <CardBody>
        {items.length ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-700">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-500" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-500">{emptyText}</p>
        )}
      </CardBody>
    </Card>
  );
}

function AnswerReview({ answer, index }) {
  const [isOpen, setIsOpen] = useState(false);
  const percent = answer.maxScore ? Math.round((answer.score / answer.maxScore) * 100) : 0;
  const isChoice = answer.type === 'single_choice' || answer.type === 'multi_select';

  return (
    <li className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-ink-700">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-ink-900">{answer.prompt}</span>
          <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
            <span>{categoryLabels[answer.category]}</span>
            <span>{answer.topic}</span>
            <span>{typeLabels[answer.type]}</span>
            <span>{difficultyLabels[answer.difficulty]}</span>
          </span>
        </span>
        <Badge tone={scoreTone(percent)} className="shrink-0 tabular-nums">
          {answer.score}/{answer.maxScore}
        </Badge>
        <ChevronDown
          className={cn('mt-1 size-4 shrink-0 text-ink-500 transition-transform', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="space-y-5 border-t border-slate-100 px-5 pt-5 pb-6 sm:pl-[68px]">
          {answer.codeSnippet && (
            <pre className="overflow-x-auto rounded-xl bg-ink-950 p-4 text-sm text-slate-100">
              <code>{answer.codeSnippet}</code>
            </pre>
          )}

          {isChoice ? (
            <ul className="space-y-2">
              {answer.options.map((option) => {
                const isCorrect = answer.correctOptionIds.includes(option.id);
                const wasSelected = answer.selectedOptionIds.includes(option.id);
                return (
                  <li
                    key={option.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm',
                      isCorrect
                        ? 'border-brand-200 bg-brand-50 text-brand-900'
                        : wasSelected
                          ? 'border-red-200 bg-red-50 text-red-800'
                          : 'border-slate-200 text-ink-600',
                    )}
                  >
                    {isCorrect ? (
                      <Check className="size-4 text-brand-600" />
                    ) : wasSelected ? (
                      <X className="size-4 text-red-500" />
                    ) : (
                      <span className="size-4" />
                    )}
                    <span className="flex-1">{option.text}</span>
                    {wasSelected && <span className="text-xs font-medium">Your choice</span>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div>
              <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">Your answer</p>
              <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-700">
                {answer.answerText || <span className="text-ink-500 italic">No answer submitted</span>}
              </p>
            </div>
          )}

          {answer.criteriaScores && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(answer.criteriaScores).map(([criterion, value]) => (
                <div key={criterion} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-ink-500 capitalize">{criterion}</p>
                  <p className="mt-0.5 text-lg font-semibold text-ink-900 tabular-nums">
                    {value}
                    <span className="text-xs text-ink-500">/10</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {answer.feedback && (
            <div className="rounded-xl border-l-4 border-brand-500 bg-brand-50/60 p-4">
              <p className="text-xs font-semibold tracking-wider text-brand-800 uppercase">Feedback</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{answer.feedback}</p>
              {answer.missedConcepts?.length > 0 && (
                <p className="mt-2 text-sm text-ink-600">
                  <span className="font-medium">Missed:</span> {answer.missedConcepts.join(', ')}
                </p>
              )}
            </div>
          )}

          {!isChoice && answer.modelAnswer && (
            <div>
              <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">Model answer</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{answer.modelAnswer}</p>
            </div>
          )}
          {answer.explanation && (
            <div>
              <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">Explanation</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{answer.explanation}</p>
            </div>
          )}
          {answer.followUpQuestions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">Likely follow-up questions</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-700">
                {answer.followUpQuestions.map((followUp) => (
                  <li key={followUp}>{followUp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function InterviewReport() {
  const { interviewId } = useParams();
  const { data, error, isLoading } = useApi((signal) => interviewService.getReport(interviewId, signal), [interviewId]);

  if (error) return <Alert tone="error">{error.message}</Alert>;
  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-[28px]" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  const { interview, report, answers, integrity } = data;
  const integrityCounts = Object.entries(integrity?.byType ?? {}).filter(([type]) => !type.endsWith('_granted'));
  const correctChoices = answers.filter((a) => a.isCorrect).length;
  const choiceCount = answers.filter((a) => a.type === 'single_choice' || a.type === 'multi_select').length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-ink-900 p-6 text-white sm:p-10">
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-500/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
          <ScoreRing score={report.overallScore} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wider text-brand-300 uppercase">Interview report</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {interview.company.name} · {interview.role.name}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Completed {formatDate(interview.completedAt)} · {answers.length} questions ·{' '}
              {difficultyLabels[interview.config.difficulty]}
            </p>
            <p className="mt-5 max-w-2xl leading-relaxed text-slate-200">{report.summary}</p>
          </div>
        </div>
        <div className="relative mt-8 flex flex-wrap gap-3 print:hidden">
          <ButtonLink to={paths.newInterview} variant="primary">
            Practise again
            <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
          <a
            href={interviewService.reportPdfUrl(interviewId)}
            className={buttonClasses({
              variant: 'secondary',
              className: 'border-white/15 bg-white/10 text-white hover:border-white/25 hover:bg-white/15',
            })}
          >
            <Download className="size-4" aria-hidden="true" />
            Download PDF
          </a>
          <Button
            variant="ghost"
            onClick={() => window.print()}
            className="text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Award, label: 'Overall score', value: `${report.overallScore}%` },
          { icon: Target, label: 'MCQs correct', value: choiceCount ? `${correctChoices} / ${choiceCount}` : '—' },
          {
            icon: TrendingUp,
            label: 'Strongest category',
            value: categoryLabels[[...report.categoryScores].sort((a, b) => b.score - a.score)[0]?.category] ?? '—',
          },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50">
              <Icon className="size-5 text-brand-600" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-ink-500">{label}</p>
              <p className="text-lg font-semibold text-ink-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Category performance" description="Score in each part of the interview" />
          <CardBody className="space-y-5">
            {report.categoryScores.map(({ category, score }) => (
              <ScoreBar key={category} label={categoryLabels[category]} score={score} />
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Topic performance" description="How you did on each topic covered" />
          <CardBody className="space-y-5">
            {[...report.topicScores]
              .sort((a, b) => b.score - a.score)
              .map(({ topic, score }) => (
                <ScoreBar key={topic} label={topic} score={score} />
              ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ListCard
          icon={Award}
          title="Strengths"
          items={report.strengths}
          emptyText="Keep practising to build clear strengths."
        />
        <ListCard
          icon={Target}
          title="Weak topics"
          items={report.weakTopics}
          tone="amber"
          emptyText="No weak topics identified."
        />
        <ListCard
          icon={Lightbulb}
          title="What to prepare next"
          items={report.recommendations}
          tone="ink"
          emptyText="No recommendations."
        />
      </div>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-ink-700">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              Integrity signals
            </span>
          }
          description="Recorded for transparency. They are not part of your score and are not proof of anything."
        />
        <CardBody>
          {integrityCounts.length ? (
            <div className="flex flex-wrap gap-2">
              {integrityCounts.map(([type, count]) => (
                <span key={type} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-ink-700">
                  {integrityEventLabels[type] ?? type}: <span className="font-semibold">{count}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-600">No integrity signals were recorded during this interview.</p>
          )}
        </CardBody>
      </Card>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <BookOpen className="size-5 text-brand-600" aria-hidden="true" />
              Answer review
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Open any question to see your answer, the correct answer and feedback.
            </p>
          </div>
        </div>
        <ol className="space-y-3">
          {answers.map((answer, index) => (
            <AnswerReview key={answer.id} answer={answer} index={index} />
          ))}
        </ol>
      </section>
    </div>
  );
}
