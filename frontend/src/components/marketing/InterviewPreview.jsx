import { Clock3, FileText, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

const options = [
  'First normal form (1NF)',
  'Second normal form (2NF)',
  'Third normal form (3NF)',
  'Boyce–Codd normal form (BCNF)',
];
const SELECTED_OPTION = 2;
const detectedSkills = ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Git'];

/**
 * Illustrative, non-interactive preview of the interview room used on marketing
 * and auth screens. It is decorative, so it is hidden from assistive technology.
 */
export function InterviewPreview({ className, showResumeCard = true }) {
  return (
    <div className={cn('relative', className)} aria-hidden="true">
      <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-20px_rgba(30,27,75,0.25)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white">
              TCS
            </span>
            <span className="text-xs font-medium text-slate-500">Digital · Fresher</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 tabular-nums">
            <Clock3 className="size-3.5 text-slate-400" />
            18:42
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-900">Question 4 of 20</span>
            <span className="text-slate-500">DBMS · Multiple choice</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/5 rounded-full bg-brand-600" />
          </div>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed font-medium text-slate-900">
          Which normal form removes transitive dependencies between non-key attributes?
        </p>

        <ul className="mt-4 space-y-2">
          {options.map((option, index) => {
            const isSelected = index === SELECTED_OPTION;
            return (
              <li
                key={option}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm',
                  isSelected ? 'border-brand-500 bg-brand-50/70 text-slate-900' : 'border-slate-200 text-slate-600',
                )}
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border',
                    isSelected ? 'border-brand-600' : 'border-slate-300',
                  )}
                >
                  {isSelected && <span className="size-2 rounded-full bg-brand-600" />}
                </span>
                {option}
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">Draft saved</span>
          <span className="rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-medium text-white">Submit answer</span>
        </div>
      </div>

      {showResumeCard && (
        <div className="absolute -bottom-8 -left-10 hidden w-64 rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_16px_40px_-16px_rgba(30,27,75,0.3)] backdrop-blur xl:block [@media(max-height:760px)]:hidden">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-900">
            <span className="flex size-6 items-center justify-center rounded-md bg-brand-50">
              <FileText className="size-3.5 text-brand-600" />
            </span>
            Resume analysed
            <Sparkles className="ml-auto size-3.5 text-violet-500" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {detectedSkills.map((skill) => (
              <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
