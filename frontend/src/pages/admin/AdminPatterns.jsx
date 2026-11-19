import { Link } from 'react-router';
import { ListChecks, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { adminContentService } from '../../services/adminContentService';
import { formatDate } from '../../utils/format';
import { categoryLabels, difficultyLabels, difficultyTones } from '../../utils/labels';
import { adminRoleEditorPath } from '../../utils/paths';

export default function AdminPatterns() {
  const { data, error, isLoading } = useApi((signal) => adminContentService.listAllBlueprints(signal));
  const blueprints = data?.blueprints ?? [];
  const unverified = blueprints.filter((blueprint) => !blueprint.lastVerifiedAt).length;

  return (
    <>
      <PageHeader
        title="Interview patterns"
        description="Every role track across all companies. Open one to edit its question mix, topics and sources."
      />
      {error && (
        <Alert tone="error" className="mb-6">
          {error.message}
        </Alert>
      )}
      {unverified > 0 && (
        <Alert
          tone="info"
          className="mb-6"
          title={`${unverified} pattern${unverified === 1 ? ' is' : 's are'} not yet verified`}
        >
          Add sources and a verification date in each pattern once you have checked it.
        </Alert>
      )}

      <Card className="overflow-hidden">
        {isLoading && !data ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((key) => (
              <Skeleton key={key} className="h-10" />
            ))}
          </div>
        ) : blueprints.length === 0 ? (
          <EmptyState icon={ListChecks} title="No patterns yet" description="Create a company and add role tracks." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Company · role</th>
                  <th className="px-5 py-3 font-medium">Difficulty</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Format</th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">Largest categories</th>
                  <th className="px-5 py-3 font-medium">Verification</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blueprints.map((blueprint) => {
                  const top = [...blueprint.categoryDistribution].sort((a, b) => b.weight - a.weight).slice(0, 2);
                  return (
                    <tr key={blueprint.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <Link
                          to={adminRoleEditorPath(blueprint.company.id, blueprint.id)}
                          className="font-medium text-ink-900 hover:text-brand-700"
                        >
                          {blueprint.company.name} · {blueprint.roleName}
                        </Link>
                        <p className="text-xs text-ink-500">{blueprint.track}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={difficultyTones[blueprint.difficulty]}>
                          {difficultyLabels[blueprint.difficulty]}
                        </Badge>
                      </td>
                      <td className="hidden px-5 py-3 text-ink-600 md:table-cell">
                        {blueprint.totalQuestions} Q · {blueprint.durationMinutes} min
                      </td>
                      <td className="hidden px-5 py-3 text-ink-600 lg:table-cell">
                        {top.map((entry) => categoryLabels[entry.category]).join(', ')}
                      </td>
                      <td className="px-5 py-3">
                        {blueprint.lastVerifiedAt ? (
                          <span className="flex items-center gap-1.5 text-xs text-brand-700">
                            <ShieldCheck className="size-4" />
                            {formatDate(blueprint.lastVerifiedAt)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-amber-700">
                            <ShieldAlert className="size-4" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={blueprint.isActive ? 'success' : 'neutral'}>
                          {blueprint.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
