import { cn } from '../../utils/cn';

function TopicRow({ topic, score, tone }) {
  return (
    <li>
      <div className="flex items-center justify-between text-sm">
        <span className="truncate text-slate-700">{topic}</span>
        <span className="font-medium text-slate-900 tabular-nums">{score}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full', tone === 'strong' ? 'bg-emerald-500' : 'bg-amber-500')}
          style={{ width: `${score}%` }}
        />
      </div>
    </li>
  );
}

function TopicGroup({ title, topics, tone, emptyText }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</p>
      {topics.length ? (
        <ul className="space-y-3">
          {topics.map((topic) => (
            <TopicRow key={topic.topic} {...topic} tone={tone} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

export function TopicPerformance({ strong, weak }) {
  return (
    <div className="space-y-6">
      <TopicGroup title="Strong" topics={strong} tone="strong" emptyText="No topics above 70% yet." />
      <TopicGroup title="Needs work" topics={weak} tone="weak" emptyText="No topics below 60%. Nice." />
    </div>
  );
}
