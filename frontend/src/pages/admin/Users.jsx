import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Users as UsersIcon } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { TextField } from '../../components/ui/TextField';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/format';

const PAGE_SIZE = 20;
const roleOptions = [
  { value: '', label: 'All roles' },
  { value: 'candidate', label: 'Candidates' },
  { value: 'admin', label: 'Admins' },
];
const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Deactivated' },
];

/** Describes the confirmation shown for each admin action. */
function describeAction({ type, user }) {
  if (type === 'role') {
    const makeAdmin = user.role !== 'admin';
    return {
      title: makeAdmin ? `Make ${user.name} an admin?` : `Remove admin access from ${user.name}?`,
      description: makeAdmin
        ? 'Admins can manage users, companies and interview content.'
        : 'They will keep their account but lose access to the admin panel.',
      confirmLabel: makeAdmin ? 'Make admin' : 'Remove admin',
      tone: 'primary',
      changes: { role: makeAdmin ? 'admin' : 'candidate' },
    };
  }
  return user.isActive
    ? {
        title: `Deactivate ${user.name}?`,
        description: 'They will be signed out immediately and cannot sign in until reactivated. Their data is kept.',
        confirmLabel: 'Deactivate',
        tone: 'danger',
        changes: { isActive: false },
      }
    : {
        title: `Reactivate ${user.name}?`,
        description: 'They will be able to sign in again.',
        confirmLabel: 'Reactivate',
        tone: 'primary',
        changes: { isActive: true },
      };
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '', role: '', status: '', page: 1 });
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Debounce typing so we query once the user pauses.
  useEffect(() => {
    const timer = setTimeout(() => setFilters((current) => ({ ...current, search: searchInput.trim(), page: 1 })), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, error, isLoading, setData } = useApi(
    (signal) => adminService.listUsers({ ...filters, limit: PAGE_SIZE }, signal),
    [filters],
  );

  const updateFilter = (name) => (event) =>
    setFilters((current) => ({ ...current, [name]: event.target.value, page: 1 }));
  const goToPage = (page) => setFilters((current) => ({ ...current, page }));
  const action = pendingAction && describeAction(pendingAction);

  async function confirmAction() {
    setIsSaving(true);
    setActionError('');
    try {
      const { user: updatedUser } = await adminService.updateUser(pendingAction.user.id, action.changes);
      setData((current) => ({
        ...current,
        users: current.users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      }));
      setPendingAction(null);
    } catch (requestError) {
      setActionError(requestError.message);
      setPendingAction(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Users" description="Search accounts, manage admin access and deactivate users." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <TextField
          aria-label="Search users"
          placeholder="Search by name or email"
          icon={Search}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="flex-1 [&_input]:h-10"
        />
        <Select
          aria-label="Filter by role"
          options={roleOptions}
          value={filters.role}
          onChange={updateFilter('role')}
          className="sm:w-40"
        />
        <Select
          aria-label="Filter by status"
          options={statusOptions}
          value={filters.status}
          onChange={updateFilter('status')}
          className="sm:w-44"
        />
      </div>

      {(error || actionError) && (
        <Alert tone="error" className="mb-4">
          {error?.message || actionError}
        </Alert>
      )}

      <Card className="overflow-hidden">
        {isLoading && !data ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-10 w-full" />
            ))}
          </div>
        ) : data?.users.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-medium text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    User
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Role
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">
                    Joined
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">
                    Last sign-in
                  </th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-100 ${isLoading ? 'opacity-60' : ''}`}>
                {data.users.map((user) => {
                  const isSelf = user.id === currentUser.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {user.name} {isSelf && <span className="font-normal text-slate-400">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'} className="capitalize">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="hidden px-5 py-3 text-slate-600 md:table-cell">{formatDate(user.createdAt)}</td>
                      <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">{formatDate(user.lastLoginAt)}</td>
                      <td className="px-5 py-3">
                        {!isSelf && (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setPendingAction({ type: 'role', user })}>
                              {user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPendingAction({ type: 'status', user })}
                              className={user.isActive ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : ''}
                            >
                              {user.isActive ? 'Deactivate' : 'Reactivate'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={UsersIcon} title="No users found" description="Try a different search or filter." />
        )}

        {data?.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} users
            </span>
            <div className="flex gap-1">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => goToPage(filters.page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page >= data.pagination.totalPages}
                onClick={() => goToPage(filters.page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={action?.title}
        description={action?.description}
        confirmLabel={action?.confirmLabel}
        tone={action?.tone}
        isLoading={isSaving}
        onConfirm={confirmAction}
        onClose={() => !isSaving && setPendingAction(null)}
      />
    </>
  );
}
