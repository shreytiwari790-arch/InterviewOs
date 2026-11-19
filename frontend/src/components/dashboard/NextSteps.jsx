import { Link } from 'react-router';
import { ArrowRight, BookOpen, FileUp, PlayCircle, RotateCcw } from 'lucide-react';
import { interviewPath, paths, upcomingPaths } from '../../utils/paths';

const stepConfig = {
  upload_resume: { icon: FileUp, to: () => paths.resume },
  start_interview: { icon: PlayCircle, to: () => paths.newInterview },
  resume_interview: { icon: RotateCcw, to: (step) => interviewPath(step.interviewId) },
  review_topic: { icon: BookOpen, to: () => paths.newInterview },
};

export function NextSteps({ steps }) {
  return (
    <ol className="space-y-2">
      {steps.map((step) => {
        const { icon: Icon, to } = stepConfig[step.action];
        const target = to(step);
        const isAvailable = !upcomingPaths.has(target);
        const content = (
          <>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
              <Icon className="size-4 text-brand-600" aria-hidden="true" />
            </span>
            <span className="flex-1 text-sm font-medium text-ink-800">{step.title}</span>
            {isAvailable ? (
              <ArrowRight
                className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
                aria-hidden="true"
              />
            ) : (
              <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">Soon</span>
            )}
          </>
        );
        const classes =
          'group flex items-center gap-3 rounded-lg border border-slate-200/80 px-3 py-2.5 transition-colors';

        return (
          <li key={`${step.action}-${step.topic ?? step.interviewId ?? ''}`}>
            {isAvailable ? (
              <Link to={target} className={`${classes} hover:border-slate-300 hover:bg-slate-50`}>
                {content}
              </Link>
            ) : (
              <div className={classes}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
