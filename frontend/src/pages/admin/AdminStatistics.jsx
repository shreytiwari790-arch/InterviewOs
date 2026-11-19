import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, CheckCircle2, FileText, Gauge, ShieldAlert, Users } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/ui/StatCard';
import { useApi } from '../../hooks/useApi';
import { adminContentService } from '../../services/adminContentService';
import { formatShortDate } from '../../utils/format';
import { categoryLabels, integrityEventLabels, interviewStatusLabels } from '../../utils/labels';

const axisProps = { tick: { fontSize: 12, fill: '#5b6274' }, axisLine: false, tickLine: false };

function IntegrityDetailDialog({ interviewId, onClose }) {
  const { data, error } = useApi(
    (signal) => adminContentService.getInterviewIntegrity(interviewId, signal),
    [interviewId],
  );
  return (
    <Dialog
      isOpen
      onClose={onClose}
      title="Integrity timeline"
      description="Signals only. They are not proof of misconduct and never affect the score."
    >
      {error && <Alert tone="error">{error.message}</Alert>}
      {!data ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <p className="text-sm font-medium text-ink-900">
            {data.interview.candidate.name} · {data.interview.company.name} {data.interview.role.name}
          </p>
          <p className="text-xs text-ink-500">{data.interview.candidate.email}</p>
          <ol className="mt-5 space-y-2 border-l-2 border-slate-100 pl-4">
            {data.integrity.timeline.map((event, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium text-ink-800">{integrityEventLabels[event.type] ?? event.type}</span>
                <span className="ml-2 text-xs text-ink-500">
                  {new Date(event.occurredAt).toLocaleTimeString()}
                  {event.questionNumber ? ` · Q${event.questionNumber}` : ''}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </Dialog>
  );
}

export default function AdminStatistics() {
  const { data, error, isLoading } = useApi((signal) => adminContentService.getStatistics(signal));
  const [selectedInterview, setSelectedInterview] = useState(null);
  const isInitialLoad = isLoading && !data;
  const totals = data?.totals;

  return (
    <>
      <PageHeader
        title="Platform statistics"
        description="Usage, performance and integrity signals across all candidates."
      />
      {error && (
        <Alert tone="error" className="mb-6">
          {error.message}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Candidates" icon={Users} isLoading={isInitialLoad} value={totals?.candidates ?? 0} />
        <StatCard
          label="Resumes analysed"
          icon={FileText}
          isLoading={isInitialLoad}
          value={totals?.resumesAnalyzed ?? 0}
        />
        <StatCard
          label="Interviews"
          icon={Activity}
          isLoading={isInitialLoad}
          value={totals?.interviews ?? 0}
          hint={`${totals?.completed ?? 0} completed`}
        />
        <StatCard
          label="Completion rate"
          icon={CheckCircle2}
          isLoading={isInitialLoad}
          value={totals?.completionRate != null ? `${totals.completionRate}%` : '—'}
          hint="Of interviews that were started"
        />
        <StatCard
          label="Average score"
          icon={Gauge}
          isLoading={isInitialLoad}
          value={totals?.averageScore != null ? `${totals.averageScore}%` : '—'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Interview activity" description="Interviews created per day, last 30 days" />
          <CardBody>
            {isInitialLoad ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={data.activity} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickFormatter={formatShortDate} minTickGap={28} {...axisProps} />
                    <YAxis allowDecimals={false} {...axisProps} />
                    <Tooltip
                      labelFormatter={formatShortDate}
                      cursor={{ fill: '#ecfdf7' }}
                      contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="started" name="Created" fill="#a3efd6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#0a9a78" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Score distribution" description="Completed interviews" />
          <CardBody>
            {isInitialLoad ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={data.scoreDistribution} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis allowDecimals={false} {...axisProps} />
                    <Tooltip
                      cursor={{ fill: '#ecfdf7' }}
                      contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }}
                    />
                    <Bar dataKey="count" name="Interviews" fill="#12b38b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Most practised role tracks" />
          <CardBody>
            {data?.topTracks.length ? (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-ink-500">
                  <tr>
                    <th className="pb-2 font-medium">Track</th>
                    <th className="pb-2 text-right font-medium">Interviews</th>
                    <th className="pb-2 text-right font-medium">Avg score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.topTracks.map((track) => (
                    <tr key={`${track.company}-${track.role}`}>
                      <td className="py-2.5 font-medium text-ink-800">
                        {track.company} · {track.role}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{track.interviews}</td>
                      <td className="py-2.5 text-right tabular-nums">
                        {track.averageScore != null ? `${track.averageScore}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState icon={Activity} title="No interviews yet" />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Category averages" description="Weakest first, across all reports" />
          <CardBody className="space-y-4">
            {data?.categoryAverages.length ? (
              data.categoryAverages.map(({ category, average }) => (
                <div key={category}>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-700">{categoryLabels[category]}</span>
                    <span className="font-semibold tabular-nums">{average}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${average}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-500">Appears after the first report.</p>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            title="Integrity signals"
            description="Tab switches, focus loss and fullscreen exits during interviews. These are signals, not proof, and never affect scores."
          />
          <CardBody>
            {data?.integrity.recentSignals.length ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-ink-500">
                      <tr>
                        <th className="pb-2 font-medium">Candidate</th>
                        <th className="pb-2 font-medium">Interview</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 text-right font-medium">Signals</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.integrity.recentSignals.map((row) => (
                        <tr key={row.interviewId}>
                          <td className="py-2.5 font-medium text-ink-800">{row.candidate}</td>
                          <td className="py-2.5 text-ink-600">
                            {row.company} · {row.role}
                          </td>
                          <td className="py-2.5">
                            <Badge tone={interviewStatusLabels[row.status].tone}>
                              {interviewStatusLabels[row.status].label}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-right font-semibold tabular-nums">{row.signals}</td>
                          <td className="py-2.5 text-right">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedInterview(row.interviewId)}>
                              Timeline
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="space-y-2">
                  {data.integrity.eventsByType.map(({ type, count }) => (
                    <li
                      key={type}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span className="text-ink-700">{integrityEventLabels[type] ?? type}</span>
                      <span className="font-semibold tabular-nums">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="No integrity signals recorded"
                description="Signals appear when candidates leave the interview window."
              />
            )}
          </CardBody>
        </Card>
      </div>

      {selectedInterview && (
        <IntegrityDetailDialog interviewId={selectedInterview} onClose={() => setSelectedInterview(null)} />
      )}
    </>
  );
}
