import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Building2, Plus } from 'lucide-react';
import { CompanyFormDialog } from '../../components/admin/CompanyFormDialog';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { adminContentService } from '../../services/adminContentService';
import { adminCompanyPath } from '../../utils/paths';

export default function AdminCompanies() {
  const { data, error, isLoading, reload } = useApi((signal) => adminContentService.listCompanies(signal));
  const [isCreating, setIsCreating] = useState(false);
  const companies = data?.companies ?? [];

  return (
    <>
      <PageHeader
        title="Companies"
        description="Manage companies and their interview role tracks without changing code."
        actions={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New company
          </Button>
        }
      />
      {error && (
        <Alert tone="error" className="mb-6">
          {error.message}
        </Alert>
      )}

      {isLoading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-36 rounded-3xl" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Create a company, then add its role tracks."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              to={adminCompanyPath(company.id)}
              className="group rounded-3xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5"
            >
              <div className="flex items-center gap-4">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white"
                  style={{ backgroundColor: company.accentColor }}
                >
                  {company.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900">{company.name}</p>
                  <p className="text-xs text-ink-500">{company.industry || 'No industry set'}</p>
                </div>
                <ArrowRight
                  className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-ink-600">
                  {company.roleCount.active} active of {company.roleCount.total} role track
                  {company.roleCount.total === 1 ? '' : 's'}
                </span>
                <Badge tone={company.isActive ? 'success' : 'neutral'}>{company.isActive ? 'Visible' : 'Hidden'}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isCreating && (
        <CompanyFormDialog
          isOpen
          onClose={() => setIsCreating(false)}
          onSaved={() => {
            setIsCreating(false);
            reload();
          }}
        />
      )}
    </>
  );
}
