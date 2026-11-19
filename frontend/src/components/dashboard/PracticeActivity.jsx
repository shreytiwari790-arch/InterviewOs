import { Flame } from 'lucide-react';
import { cn } from '../../utils/cn';

const DAYS = 28;

const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

/** Groups completion times into local calendar days and works out the current streak. */
function buildActivity(timestamps, today = new Date()) {
  const counts = new Map();
  for (const value of timestamps) {
    const key = dayKey(new Date(value));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days = Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (DAYS - 1 - index));
    return { date, count: counts.get(dayKey(date)) ?? 0 };
  });

  // A streak stays alive until the end of today, so start from yesterday when today is empty.
  let streak = 0;
  let index = days.at(-1).count > 0 ? DAYS - 1 : DAYS - 2;
  while (index >= 0 && days[index].count > 0) {
    streak += 1;
    index -= 1;
  }

  return {
    days,
    streak,
    activeDays: days.filter((day) => day.count > 0).length,
    thisWeek: days.slice(-7).reduce((sum, day) => sum + day.count, 0),
  };
}

const dayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export function PracticeActivity({ timestamps }) {
  const { days, streak, activeDays, thisWeek } = buildActivity(timestamps);

  return (
    <div>
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-white p-4 ring-1 ring-amber-100">
        <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100">
          <Flame className="size-5 text-amber-600" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg leading-none font-semibold text-ink-900 tabular-nums">
            {streak} day{streak === 1 ? '' : 's'}
          </p>
          <p className="mt-1 text-xs text-ink-500">Current practice streak</p>
        </div>
      </div>

      <div
        className="mt-5 grid grid-cols-7 gap-1.5"
        role="img"
        aria-label={`${activeDays} active days in the last 4 weeks`}
      >
        {days.map(({ date, count }) => (
          <span
            key={date.toISOString()}
            title={`${dayFormatter.format(date)}: ${count} interview${count === 1 ? '' : 's'}`}
            className={cn(
              'aspect-square rounded-md',
              count === 0 ? 'bg-slate-100' : count === 1 ? 'bg-brand-300' : 'bg-brand-600',
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
        <span>4 weeks ago</span>
        <span>Today</span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-100 p-3">
          <dt className="text-xs text-ink-500">This week</dt>
          <dd className="mt-0.5 font-semibold text-ink-900 tabular-nums">
            {thisWeek} interview{thisWeek === 1 ? '' : 's'}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-100 p-3">
          <dt className="text-xs text-ink-500">Active days</dt>
          <dd className="mt-0.5 font-semibold text-ink-900 tabular-nums">{activeDays} of 28</dd>
        </div>
      </dl>
    </div>
  );
}
