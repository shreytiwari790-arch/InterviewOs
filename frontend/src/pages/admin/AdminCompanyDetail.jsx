import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Clock3, FileQuestion, ListChecks, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { CompanyFormDialog } from '../../components/admin/CompanyFormDialog';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { adminContentService } from '../../services/adminContentService';
import { formatDate } from '../../utils/format';
import { difficultyLabels, difficultyTones } from '../../utils/labels';
import { adminRoleEditorPath, paths } from '../../utils/paths';

export default function AdminCompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading, reload } = useApi(
    (signal) => adminContentService.listCompanyBlueprints(companyId, signal),
    [companyId],
  );
  const [isEditing, setIsEditing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { kind: 'company' | 'blueprint', item }
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  async function confirmDelete() {
    setIsDeleting(true);
    setActionError('');
    try {
      if (pendingDelete.kind === 'company') {
        await adminContentService.deleteCompany(companyId);
        navigate(paths.adminCompanies);
        return;
      }
      await adminContentService.deleteBlueprint(pendingDelete.item.id);
      reload();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  async function toggleBlueprint(blueprint) {
    setActionError('');
    try {
      await adminContentService.updateBlueprint(blueprint.id, { isActive: !blueprint.isActive });
      reload();
    } catch (requestError) {
      setActionError(requestError.message);
    }
  }

  if (error) return <Alert tone="error">{error.message}</Alert>;
  if (isLoading && !data) return <Skeleton className="h-64 rounded-3xl" />;

  const { company, blueprints } = data;

  return (
    <>
      <Link
        to={paths.adminCompanies}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All companies
      </Link>

      <section className="mb-8 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <span
          className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white"
          style={{ backgroundColor: company.accentColor }}
        >
          {company.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
            <Badge tone={company.isActive ? 'success' : 'neutral'}>
              {company.isActive ? 'Visible to candidates' : 'Hidden'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {company.industry} · /{company.slug}
          </p>
          {company.description && <p className="mt-2 max-w-3xl text-sm text-ink-600">{company.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setPendingDelete({ kind: 'company', item: company })}
            aria-label="Delete company"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </section>

      {actionError && (
        <Alert tone="error" className="mb-6">
          {actionError}
        </Alert>
      )}

      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Role tracks</h2>
          <p className="text-sm text-ink-500">
            Each track is a preparation profile: question mix, topics, difficulty and duration.
          </p>
        </div>
        <ButtonLink to={adminRoleEditorPath(companyId)}>
          <Plus className="size-4" aria-hidden="true" />
          New role track
        </ButtonLink>
      </div>

      {blueprints.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No role tracks yet"
          description="Add a role so candidates can practise for this company."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {blueprints.map((blueprint) => {
            const totalWeight = blueprint.categoryDistribution.reduce((sum, c) => sum + c.weight, 0);
            const isVerified = Boolean(blueprint.lastVerifiedAt);
            return (
              <article
                key={blueprint.id}
                className={`rounded-3xl border bg-white p-6 ${blueprint.isActive ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-75'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink-900">{blueprint.roleName}</p>
                    <p className="text-sm text-ink-500">{blueprint.track}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge tone={difficultyTones[blueprint.difficulty]}>{difficultyLabels[blueprint.difficulty]}</Badge>
                    {!blueprint.isActive && <Badge>Inactive</Badge>}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-600">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="size-4 text-ink-500" />
                    {blueprint.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ListChecks className="size-4 text-ink-500" />
                    {blueprint.totalQuestions} questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileQuestion className="size-4 text-ink-500" />
                    {blueprint.bankQuestionCount} bank questions
                  </span>
                </div>
                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100" aria-label="Question mix">
                  {blueprint.categoryDistribution
                    .filter((c) => c.weight > 0)
                    .map((entry, index) => (
                      <span
                        key={entry.category}
                        className="h-full"
                        style={{
                          width: `${(entry.weight / totalWeight) * 100}%`,
                          backgroundColor: ['#0a9a78', '#2cc9a0', '#69e0bd', '#0c624f', '#a3efd6', '#353b4b'][
                            index % 6
                          ],
                        }}
                      />
                    ))}
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
                  <ShieldCheck
                    className={`size-3.5 ${isVerified ? 'text-brand-600' : 'text-amber-500'}`}
                    aria-hidden="true"
                  />
                  {isVerified
                    ? `Last verified ${formatDate(blueprint.lastVerifiedAt)}`
                    : 'Not yet verified against sources'}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <ButtonLink to={adminRoleEditorPath(companyId, blueprint.id)} variant="secondary" size="sm">
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit pattern
                  </ButtonLink>
                  <ButtonLink to={`${paths.adminQuestions}?blueprint=${blueprint.id}`} variant="ghost" size="sm">
                    Question bank
                  </ButtonLink>
                  <Button variant="ghost" size="sm" onClick={() => toggleBlueprint(blueprint)}>
                    {blueprint.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-red-600 hover:bg-red-50"
                    onClick={() => setPendingDelete({ kind: 'blueprint', item: blueprint })}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {isEditing && (
        <CompanyFormDialog
          key={company.id}
          company={company}
          isOpen
          onClose={() => setIsEditing(false)}
          onSaved={() => {
            setIsEditing(false);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title={
          pendingDelete?.kind === 'company' ? `Delete ${company.name}?` : `Delete ${pendingDelete?.item.roleName}?`
        }
        description={
          pendingDelete?.kind === 'company'
            ? 'Only companies without role tracks can be deleted. To hide a company, deactivate it instead.'
            : 'Tracks that candidates have already used cannot be deleted; deactivate them instead. Its bank questions are deleted too.'
        }
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => !isDeleting && setPendingDelete(null)}
      />
    </>
  );
}
