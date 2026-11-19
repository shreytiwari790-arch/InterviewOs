import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Clock3,
  CloudOff,
  Flag,
  Loader2,
  Lock,
  Wifi,
} from 'lucide-react';
import { formatCountdown, useCountdown } from '../../hooks/useCountdown';
import { useAnswerAutosave } from '../../hooks/useAnswerAutosave';
import { useIntegrityMonitor } from '../../hooks/useIntegrityMonitor';
import { interviewService } from '../../services/interviewService';
import { cn } from '../../utils/cn';
import { categoryLabels, difficultyLabels, typeLabels } from '../../utils/labels';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Logo } from '../ui/Logo';

const MAX_ANSWER_LENGTH = 5000;
const LOW_TIME_MS = 5 * 60 * 1000;

const isChoice = (question) => question.type === 'single_choice' || question.type === 'multi_select';
const hasAnswer = (answer) => Boolean(answer?.answerText?.trim() || answer?.selectedOptionIds?.length);

function SaveIndicator({ status }) {
  const states = {
    pending: { icon: Circle, text: 'Unsaved changes', tone: 'text-ink-500' },
    saving: { icon: Loader2, text: 'Saving…', spin: true, tone: 'text-ink-500' },
    saved: { icon: Check, text: 'All changes saved', tone: 'text-brand-700' },
    offline: { icon: CloudOff, text: 'Offline – will save when reconnected', tone: 'text-amber-700' },
    error: { icon: AlertTriangle, text: 'Could not save. Retrying on next change', tone: 'text-red-600' },
  };
  const state = states[status];
  if (!state) return null;
  const Icon = state.icon;
  return (
    <span className={cn('flex items-center gap-1.5 text-xs font-medium', state.tone)} role="status">
      <Icon className={cn('size-3.5', state.spin && 'animate-spin')} aria-hidden="true" />
      {state.text}
    </span>
  );
}

function OptionList({ question, selected, onChange, disabled }) {
  const multiple = question.type === 'multi_select';
  return (
    <div className="space-y-3" role={multiple ? 'group' : 'radiogroup'} aria-label="Answer options">
      {question.options.map((option, index) => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() =>
              onChange(
                multiple
                  ? isSelected
                    ? selected.filter((id) => id !== option.id)
                    : [...selected, option.id]
                  : [option.id],
              )
            }
            className={cn(
              'flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] transition-all duration-150',
              isSelected
                ? 'border-brand-500 bg-brand-50/70 text-ink-900'
                : 'border-slate-200 bg-white text-ink-700 hover:border-slate-300',
              disabled && 'cursor-not-allowed opacity-75',
            )}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center border-2 text-sm font-semibold transition-colors',
                multiple ? 'rounded-lg' : 'rounded-full',
                isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-ink-500',
              )}
            >
              {isSelected ? <Check className="size-4" strokeWidth={3} /> : String.fromCharCode(65 + index)}
            </span>
            {option.text}
          </button>
        );
      })}
    </div>
  );
}

export function InterviewRoom({ session, onSubmitted }) {
  const { interview, questions } = session;
  const remaining = useCountdown(interview.expiresAt, session.clockOffsetMs);

  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(session.responses.map((response) => [response.questionId, response])),
  );
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstOpen = questions.findIndex(
      (question) => !session.responses.find((r) => r.questionId === question.id)?.submittedAt,
    );
    return firstOpen === -1 ? questions.length - 1 : firstOpen;
  });
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isConfirmingFinish, setIsConfirmingFinish] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState('');
  const hasAutoFinished = useRef(false);

  const handleTimeUp = useCallback(() => onSubmitted(), [onSubmitted]);
  const autosave = useAnswerAutosave(interview.id, { onTimeUp: handleTimeUp });

  useIntegrityMonitor(interview.id, { isActive: !isFinishing, currentQuestionNumber: currentIndex + 1 });

  const question = questions[currentIndex];
  const answer = answers[question.id] ?? { answerText: '', selectedOptionIds: [] };
  const isLocked = Boolean(answer.submittedAt);
  const submittedCount = questions.filter((q) => answers[q.id]?.submittedAt).length;
  const unansweredCount = questions.filter((q) => !hasAnswer(answers[q.id])).length;

  function updateAnswer(changes) {
    const next = { answerText: '', selectedOptionIds: [], ...answer, ...changes };
    setAnswers((current) => ({ ...current, [question.id]: next }));
    autosave.queue(question.id, { answerText: next.answerText, selectedOptionIds: next.selectedOptionIds });
  }

  const finish = useCallback(async () => {
    setIsFinishing(true);
    try {
      await autosave.flush();
      await interviewService.finish(interview.id);
      onSubmitted();
    } catch (requestError) {
      setError(requestError.message);
      setIsFinishing(false);
      setIsConfirmingFinish(false);
    }
  }, [autosave, interview.id, onSubmitted]);

  // Submit automatically when the timer reaches zero.
  useEffect(() => {
    if (remaining === 0 && !hasAutoFinished.current) {
      hasAutoFinished.current = true;
      finish();
    }
  }, [remaining, finish]);

  async function submitAnswer() {
    setIsSubmittingAnswer(true);
    setError('');
    try {
      await autosave.flush();
      const { response } = await interviewService.saveAnswer(interview.id, question.id, {
        answerText: answer.answerText,
        selectedOptionIds: answer.selectedOptionIds,
        submit: true,
      });
      setAnswers((current) => ({ ...current, [question.id]: response }));
      const nextOpen = questions.findIndex((q, index) => index > currentIndex && !answers[q.id]?.submittedAt);
      if (nextOpen !== -1) setCurrentIndex(nextOpen);
    } catch (requestError) {
      if (requestError.status === 409 && /time is up/i.test(requestError.message)) return onSubmitted();
      setError(requestError.message);
    } finally {
      setIsSubmittingAnswer(false);
    }
  }

  const isLowTime = remaining !== null && remaining < LOW_TIME_MS;

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50/70">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo className="hidden sm:inline-flex" />
          <div className="min-w-0 border-slate-200 sm:border-l sm:pl-4">
            <p className="truncate text-sm font-semibold text-ink-900">
              {interview.company.name} · {interview.role.name}
            </p>
            <p className="text-xs text-ink-500">
              {submittedCount} of {questions.length} submitted
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {!autosave.isOnline && (
              <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 sm:flex">
                <Wifi className="size-3.5" aria-hidden="true" />
                Reconnecting…
              </span>
            )}
            <span
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tabular-nums',
                isLowTime ? 'bg-red-50 text-red-700' : 'bg-ink-900 text-white',
              )}
              aria-label="Time remaining"
            >
              <Clock3 className="size-4" aria-hidden="true" />
              {remaining === null ? '--:--' : formatCountdown(remaining)}
            </span>
            <Button variant="secondary" size="sm" onClick={() => setIsConfirmingFinish(true)}>
              <Flag className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Finish</span>
            </Button>
          </div>
        </div>
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-brand-500 transition-[width] duration-500"
            style={{ width: `${(submittedCount / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:py-10">
        <nav aria-label="Questions" className="order-2 lg:order-1">
          <p className="mb-3 text-xs font-semibold tracking-wider text-ink-500 uppercase">Questions</p>
          <ol className="grid grid-cols-8 gap-2 sm:grid-cols-10 lg:grid-cols-4">
            {questions.map((item, index) => {
              const itemAnswer = answers[item.id];
              const state = itemAnswer?.submittedAt ? 'submitted' : hasAnswer(itemAnswer) ? 'draft' : 'empty';
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-current={index === currentIndex ? 'step' : undefined}
                    aria-label={`Question ${index + 1}, ${state}`}
                    className={cn(
                      'flex aspect-square w-full items-center justify-center rounded-xl text-sm font-semibold transition-all',
                      state === 'submitted' && 'bg-brand-500 text-white',
                      state === 'draft' && 'bg-brand-100 text-brand-800',
                      state === 'empty' && 'border border-slate-200 bg-white text-ink-600 hover:border-slate-300',
                      index === currentIndex && 'ring-2 ring-ink-900 ring-offset-2',
                    )}
                  >
                    {index + 1}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 hidden space-y-2 text-xs text-ink-500 lg:block">
            <p className="flex items-center gap-2">
              <span className="size-3 rounded bg-brand-500" /> Submitted
            </p>
            <p className="flex items-center gap-2">
              <span className="size-3 rounded bg-brand-100" /> Draft saved
            </p>
            <p className="flex items-center gap-2">
              <span className="size-3 rounded border border-slate-300 bg-white" /> Not answered
            </p>
          </div>
        </nav>

        <main className="order-1 min-w-0 lg:order-2">
          {error && (
            <Alert tone="error" className="mb-4">
              {error}
            </Alert>
          )}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-full bg-ink-900 px-3 py-1 text-white">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-800">
                {categoryLabels[question.category]}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-ink-600">{question.topic}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-ink-600">
                {difficultyLabels[question.difficulty]}
              </span>
              <span className="ml-auto text-ink-500">
                {typeLabels[question.type]} · {question.marks} marks
              </span>
            </div>

            <h1 className="mt-6 text-xl leading-relaxed font-semibold text-ink-900 sm:text-[22px]">
              {question.prompt}
            </h1>

            {question.codeSnippet && (
              <pre className="mt-5 overflow-x-auto rounded-2xl bg-ink-950 p-5 text-sm leading-relaxed text-slate-100">
                {question.codeLanguage && (
                  <span className="mb-3 block text-xs font-semibold tracking-wider text-brand-300 uppercase">
                    {question.codeLanguage}
                  </span>
                )}
                <code>{question.codeSnippet}</code>
              </pre>
            )}

            <div className="mt-8">
              {isChoice(question) ? (
                <>
                  {question.type === 'multi_select' && (
                    <p className="mb-3 text-sm text-ink-500">Select all that apply.</p>
                  )}
                  <OptionList
                    question={question}
                    selected={answer.selectedOptionIds ?? []}
                    onChange={(selectedOptionIds) => updateAnswer({ selectedOptionIds })}
                    disabled={isLocked}
                  />
                </>
              ) : (
                <div>
                  <textarea
                    value={answer.answerText ?? ''}
                    onChange={(event) => updateAnswer({ answerText: event.target.value.slice(0, MAX_ANSWER_LENGTH) })}
                    disabled={isLocked}
                    rows={question.type === 'long_answer' ? 12 : 7}
                    placeholder="Type your answer. Explain your reasoning as you would to an interviewer."
                    aria-label="Your answer"
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[15px] leading-relaxed text-ink-900 shadow-xs transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none disabled:bg-slate-50 disabled:text-ink-600"
                  />
                  <p className="mt-2 text-right text-xs text-ink-500 tabular-nums">
                    {(answer.answerText ?? '').length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentIndex((index) => index - 1)}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Previous
                </Button>
                <SaveIndicator status={isLocked ? null : autosave.status} />
              </div>
              <div className="flex items-center gap-2">
                {isLocked ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
                    <Lock className="size-4" aria-hidden="true" />
                    Answer submitted
                  </span>
                ) : (
                  <Button onClick={submitAnswer} isLoading={isSubmittingAnswer} disabled={!hasAnswer(answer)}>
                    Submit answer
                  </Button>
                )}
                {currentIndex < questions.length - 1 ? (
                  <Button variant="secondary" onClick={() => setCurrentIndex((index) => index + 1)}>
                    Next
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button variant="dark" onClick={() => setIsConfirmingFinish(true)}>
                    Finish interview
                  </Button>
                )}
              </div>
            </div>
          </article>
          <p className="mt-4 text-center text-xs text-ink-500">
            Drafts save automatically. Submitted answers are locked. Tab switches and fullscreen changes are noted as
            integrity signals; they never affect your score.
          </p>
        </main>
      </div>

      <ConfirmDialog
        isOpen={isConfirmingFinish}
        title="Finish and submit your interview?"
        description={
          unansweredCount > 0
            ? `${unansweredCount} question${unansweredCount === 1 ? ' has' : 's have'} no answer and will score zero. Saved drafts are submitted as they are.`
            : 'All questions have an answer. Saved drafts are submitted as they are.'
        }
        confirmLabel="Submit interview"
        tone="dark"
        isLoading={isFinishing}
        onConfirm={finish}
        onClose={() => !isFinishing && setIsConfirmingFinish(false)}
      />
    </div>
  );
}
