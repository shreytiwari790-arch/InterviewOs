import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/cn';

const groupStyles = {
  strong: { icon: TrendingUp, iconClass: 'bg-brand-50 text-brand-600', bar: 'bg-brand-500' },
  weak: { icon: TrendingDown, iconClass: 'bg-amber-50 text-amber-600', bar: 'bg-amber-400' },
};

function TopicGroup({ title, topics, tone, emptyText }) {
  const { icon: Icon, iconClass, bar } = groupStyles[tone];
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-ink-500 uppercase">
        <span className={cn('flex size-6 items-center justify-center rounded-lg', iconClass)}>
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        {title}
      </p>
      {topics.length ? (
        <ul className="space-y-3.5">
          {topics.map(({ topic, score }) => (
            <li key={topic}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-ink-700">{topic}</span>
                <span className="font-semibold text-ink-900 tabular-nums">{score}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={cn('h-full rounded-full', bar)} style={{ width: `${score}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-500">{emptyText}</p>
      )}
    </div>
  );
}

export function TopicPerformance({ strong, weak }) {
  return (
    <div className="space-y-6">
      <TopicGroup title="Needs work" topics={weak} tone="weak" emptyText="No topics below 60%. Nice." />
      <TopicGroup title="Strong" topics={strong} tone="strong" emptyText="No topics above 70% yet." />
    </div>
  );
}
