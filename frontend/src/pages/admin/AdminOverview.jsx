import { CheckCircle2, Gauge, UserPlus, Users } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/ui/StatCard';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/format';
import { paths } from '../../utils/paths';

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-ink-900 tabular-nums">{value}</span>
    </div>
  );
}

export default function AdminOverview() {
  const { data, error, isLoading } = useApi((signal) => adminService.getOverview(signal));
  const isInitialLoad = isLoading && !data;

  return (
    <>
      <PageHeader title="Overview" description="Platform activity at a glance." />

      {error && (
        <Alert tone="error" className="mb-6">
          {error.message}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          icon={Users}
          isLoading={isInitialLoad}
          value={data?.users.total ?? 0}
          hint={data && `${data.users.candidates} candidates · ${data.users.admins} admins`}
        />
        <StatCard
          label="New this week"
          icon={UserPlus}
          isLoading={isInitialLoad}
          value={data?.users.newThisWeek ?? 0}
          hint="Accounts created in the last 7 days"
        />
        <StatCard
          label="Interviews completed"
          icon={CheckCircle2}
          isLoading={isInitialLoad}
          value={data?.interviews.completed ?? 0}
        />
        <StatCard
          label="Average score"
          icon={Gauge}
          isLoading={isInitialLoad}
          value={data?.averageScore != null ? `${data.averageScore}%` : '—'}
          hint="Across all completed interviews"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Newest users"
            action={
              <ButtonLink to={paths.adminUsers} variant="secondary" size="sm">
                Manage users
              </ButtonLink>
            }
          />
          <CardBody>
            {isInitialLoad ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {data?.recentUsers.map((user) => (
                  <li key={user.id} className="flex items-center gap-3 py-3">
                    <Avatar name={user.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    {user.role === 'admin' && <Badge tone="brand">Admin</Badge>}
                    <span className="hidden text-xs text-slate-500 sm:block">{formatDate(user.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Activity" />
          <CardBody className="divide-y divide-slate-100 pt-2">
            {isInitialLoad ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <MetricRow label="Resumes analysed" value={data?.resumesAnalyzed ?? 0} />
                <MetricRow label="Interviews created" value={data?.interviews.total ?? 0} />
                <MetricRow label="In progress now" value={data?.interviews.inProgress ?? 0} />
                <MetricRow label="Pro waitlist sign-ups" value={data?.proWaitlist ?? 0} />
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
