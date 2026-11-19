import { useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock3,
  ListChecks,
  Loader2,
  Maximize,
  Mic,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { firstName } from '../../utils/format';
import { interviewService } from '../../services/interviewService';
import { categoryLabels, difficultyLabels } from '../../utils/labels';
import { paths } from '../../utils/paths';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export function FocusShell({ children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-brand-50/60 to-white">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
        <Link to={paths.start}>
          <Logo />
        </Link>
        <Link to={paths.start} className="text-sm font-medium text-ink-600 hover:text-ink-900">
          Back to home
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-10">{children}</main>
    </div>
  );
}

function ProgressSteps({ title, description, steps }) {
  return (
    <div className="w-full max-w-lg animate-fade-up rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-brand-900/5 sm:p-10">
      <span className="relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-50">
        <Sparkles className="size-7 text-brand-600" aria-hidden="true" />
        <Loader2
          className="absolute -right-2 -bottom-2 size-6 animate-spin rounded-full bg-white p-0.5 text-brand-500"
          aria-hidden="true"
        />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
      <ul className="mx-auto mt-8 max-w-xs space-y-3 text-left">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-3 text-sm text-ink-700">
            <span
              className="size-2 animate-pulse rounded-full bg-brand-500"
              style={{ animationDelay: `${index * 250}ms` }}
            />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GeneratingScreen({ interview }) {
  return (
    <ProgressSteps
      title="Preparing your interview"
      description={`Writing ${interview.config.totalQuestions} questions for ${interview.company.name} · ${interview.role.name}. This usually takes under a minute.`}
      steps={[
        'Reading the company preparation profile',
        'Matching questions to your resume',
        'Writing answer keys and rubrics',
      ]}
    />
  );
}

export function EvaluatingScreen() {
  return (
    <ProgressSteps
      title="Evaluating your answers"
      description="Multiple-choice answers are scored instantly. Written answers are reviewed against a rubric."
      steps={['Scoring multiple-choice answers', 'Reviewing written answers', 'Building your report']}
    />
  );
}

export function FailedScreen({ interview, onRetry }) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState('');
  async function retry() {
    setIsRetrying(true);
    setError('');
    try {
      await onRetry();
    } catch (requestError) {
      setError(requestError.message);
      setIsRetrying(false);
    }
  }
  return (
    <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="size-7 text-red-500" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        {interview.failedStage === 'evaluation' ? 'Evaluation did not finish' : 'We could not prepare this interview'}
      </h1>
      <p className="mt-2 text-sm text-ink-500">{interview.failureReason}</p>
      {interview.failedStage === 'evaluation' && (
        <p className="mt-2 text-sm text-ink-500">Your answers are saved. Retrying will evaluate them again.</p>
      )}
      {error && (
        <Alert tone="error" className="mt-6 text-left">
          {error}
        </Alert>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to={paths.start}
          className="inline-flex h-10 items-center rounded-full px-5 text-sm font-medium text-ink-600 hover:bg-slate-100"
        >
          Home
        </Link>
        <Button onClick={retry} isLoading={isRetrying}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </div>
  );
}

/**
 * Optional permission check. The stream is stopped immediately: nothing is recorded or uploaded.
 * Only the permission result is logged as an integrity signal.
 */
function DeviceCheck({ interviewId }) {
  const [status, setStatus] = useState({ camera: 'unknown', microphone: 'unknown' });
  const [isChecking, setIsChecking] = useState(false);

  async function check() {
    setIsChecking(true);
    const results = {};
    for (const [kind, constraints] of [
      ['camera', { video: true }],
      ['microphone', { audio: true }],
    ]) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((track) => track.stop());
        results[kind] = 'granted';
      } catch {
        results[kind] = 'denied';
      }
    }
    setStatus(results);
    setIsChecking(false);
    interviewService
      .recordIntegrityEvents(
        interviewId,
        Object.entries(results).map(([kind, result]) => ({
          type: `${kind}_permission_${result}`,
          occurredAt: new Date().toISOString(),
        })),
      )
      .catch(() => {});
  }

  const label = { unknown: 'Not checked', granted: 'Available', denied: 'Blocked' };
  const tone = { unknown: 'text-ink-500', granted: 'font-medium text-brand-700', denied: 'font-medium text-amber-700' };

  return (
    <li className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-ink-700">Camera & microphone (optional)</span>
        <button
          type="button"
          onClick={check}
          disabled={isChecking || !navigator.mediaDevices}
          className="text-xs font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-50"
        >
          {isChecking ? 'Checking…' : 'Test'}
        </button>
      </div>
      <div className="mt-2 flex gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <Camera className="size-3.5 text-ink-500" />
          <span className={tone[status.camera]}>{label[status.camera]}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Mic className="size-3.5 text-ink-500" />
          <span className={tone[status.microphone]}>{label[status.microphone]}</span>
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-500">Only checks access. Nothing is recorded.</p>
    </li>
  );
}

export function ReadyScreen({ interview, onStart }) {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const [wantsFullscreen, setWantsFullscreen] = useState(false);

  async function start() {
    setIsStarting(true);
    setError('');
    try {
      if (wantsFullscreen && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
      await onStart();
    } catch (requestError) {
      setError(requestError.message);
      setIsStarting(false);
    }
  }

  const rules = [
    'One question at a time. Move freely between questions until you finish.',
    'Drafts save automatically. Pressing "Submit answer" locks that answer.',
    'The timer starts when you begin and the interview submits itself when time runs out.',
    'Correct answers and feedback are shown only in your report.',
    'Tab switches, focus changes and fullscreen exits are noted as integrity signals. They never change your score.',
  ];

  return (
    <div className="w-full max-w-3xl animate-fade-up overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-brand-900/5">
      <div className="bg-ink-900 px-8 py-8 text-white sm:px-10">
        <p className="flex items-center gap-2 text-sm font-medium text-brand-300">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          All set
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Your interview is ready, {firstName(user.name)}
        </h1>
        <p className="mt-2 text-lg text-slate-300">
          {interview.company.name} · {interview.role.name}
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <ListChecks className="size-4" aria-hidden="true" />
            {interview.questionCount} questions
          </span>
          <span className="flex items-center gap-2">
            <Clock3 className="size-4" aria-hidden="true" />
            {interview.config.durationMinutes} minutes
          </span>
          <span>{difficultyLabels[interview.config.difficulty]} difficulty</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {interview.categoryPlan.map(({ category, count }) => (
            <span key={category} className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200">
              {categoryLabels[category]} · {count}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-8 p-8 sm:grid-cols-[1.3fr_1fr] sm:p-10">
        <div>
          <h2 className="text-sm font-semibold">Before you begin</h2>
          <ul className="mt-4 space-y-3">
            {rules.map((rule) => (
              <li key={rule} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Quick check</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
              {isOnline ? <Wifi className="size-4 text-brand-600" /> : <WifiOff className="size-4 text-red-500" />}
              <span className="flex-1 text-ink-700">Internet connection</span>
              <span className={isOnline ? 'font-medium text-brand-700' : 'font-medium text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </li>
            <li>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                <Maximize className="size-4 text-ink-500" aria-hidden="true" />
                <span className="flex-1 text-ink-700">Use fullscreen (optional)</span>
                <input
                  type="checkbox"
                  checked={wantsFullscreen}
                  onChange={(event) => setWantsFullscreen(event.target.checked)}
                  className="size-4 accent-brand-600"
                />
              </label>
            </li>
            <DeviceCheck interviewId={interview.id} />
          </ul>
          {error && (
            <Alert tone="error" className="mt-4">
              {error}
            </Alert>
          )}
          <Button
            size="lg"
            variant="dark"
            className="mt-6 w-full"
            onClick={start}
            isLoading={isStarting}
            disabled={!isOnline}
          >
            Start interview
          </Button>
        </div>
      </div>
    </div>
  );
}
