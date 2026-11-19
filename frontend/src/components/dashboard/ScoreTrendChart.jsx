import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatShortDate } from '../../utils/format';

function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-900">
        {point.company} · {point.score}%
      </p>
      <p className="mt-0.5 text-slate-500">{formatShortDate(point.completedAt)}</p>
    </div>
  );
}

export function ScoreTrendChart({ points }) {
  const data = points.map((point, index) => ({ ...point, attempt: index + 1 }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="score-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="completedAt"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#c7d2fe' }} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="url(#score-fill)"
            dot={{ r: 3, fill: '#fff', stroke: '#4f46e5', strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
