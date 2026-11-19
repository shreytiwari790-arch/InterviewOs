import { useCallback, useState } from 'react';
import { AlertTriangle, ArrowRight, FileText, Loader2, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { ResumeAnalysis } from '../../components/resume/ResumeAnalysis';
import { ResumeDropzone } from '../../components/resume/ResumeDropzone';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { usePolling } from '../../hooks/usePolling';
import { resumeService } from '../../services/resumeService';
import { formatDate } from '../../utils/format';
import { paths } from '../../utils/paths';

const statusBadges = {
  analyzing: { label: 'Analysing', tone: 'brand' },
  analyzed: { label: 'Analysed', tone: 'success' },
  failed: { label: 'Analysis failed', tone: 'danger' },
  uploaded: { label: 'Uploaded', tone: 'neutral' },
};

function AnalysingState() {
  const steps = ['Reading your resume', 'Identifying skills and projects', 'Suggesting topics to prepare'];
  return (
    <Card className="flex flex-col items-center px-6 py-16 text-center">
      <span className="relative flex size-16 items-center justify-center rounded-2xl bg-brand-50">
        <Sparkles className="size-7 text-brand-600" aria-hidden="true" />
        <Loader2
          className="absolute -right-2 -bottom-2 size-6 animate-spin rounded-full bg-white p-0.5 text-brand-500"
          aria-hidden="true"
        />
      </span>
      <p className="mt-6 text-lg font-semibold text-ink-900">Analysing your resume</p>
      <p className="mt-1 text-sm text-ink-500">This usually takes 10–30 seconds. You can stay on this page.</p>
      <ul className="mt-8 space-y-2.5 text-left">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-3 text-sm text-ink-600">
            <span
              className="size-2 animate-pulse rounded-full bg-brand-500"
              style={{ animationDelay: `${index * 0.3}s` }}
            />
            {step}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function Resume() {
  const [selectedId, setSelectedId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const list = useApi((signal) => resumeService.list(signal));
  const resumes = list.data?.resumes ?? [];
  const activeId = selectedId ?? resumes[0]?.id;

  const detail = useApi(
    (signal) => (activeId ? resumeService.get(activeId, signal) : Promise.resolve(null)),
    [activeId],
  );
  const activeResume = detail.data?.resume ?? resumes.find((resume) => resume.id === activeId);
  const isAnalysing = activeResume?.status === 'analyzing';

  const { reload: reloadDetail } = detail;
  const { reload: reloadList } = list;
  const refresh = useCallback(() => {
    reloadDetail();
    reloadList();
  }, [reloadDetail, reloadList]);
  usePolling(refresh, isAnalysing, 2500);

  async function handleUpload(file) {
    setIsUploading(true);
    setActionError('');
    try {
      const { resume } = await resumeService.upload(file);
      setSelectedId(resume.id);
      list.reload();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRetry() {
    setActionError('');
    try {
      await resumeService.retryAnalysis(activeResume.id);
      refresh();
    } catch (error) {
      setActionError(error.message);
    }
  }

  async function confirmDelete() {
    setIsDeleting(true);
    try {
      await resumeService.remove(pendingDelete.id);
      setSelectedId(null);
      setPendingDelete(null);
      list.reload();
    } catch (error) {
      setActionError(error.message);
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  if (list.isLoading && !list.data) {
    return (
      <>
        <PageHeader
          title="Resume"
          description="Upload your resume so every interview is built around your experience."
        />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Upload your resume"
          description="We use it to write questions about your own projects and skills."
        />
        {actionError && (
          <Alert tone="error" className="mb-6">
            {actionError}
          </Alert>
        )}
        <ResumeDropzone onFile={handleUpload} isUploading={isUploading} />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Private', 'Your resume is never shared with employers.'],
            ['Text only', 'We keep the extracted text, not the original file.'],
            ['Deletable', 'Remove it any time from this page.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-ink-900">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Resume"
        description="Your latest analysed resume personalises every new interview."
        actions={
          activeResume?.status === 'analyzed' && (
            <ButtonLink to={paths.newInterview}>
              Start an interview
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          )
        }
      />

      {actionError && (
        <Alert tone="error" className="mb-6">
          {actionError}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <Card className="p-2">
            <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wider text-ink-500 uppercase">Your resumes</p>
            <ul>
              {resumes.map((resume) => {
                const badge = statusBadges[resume.status];
                const isActive = resume.id === activeId;
                return (
                  <li key={resume.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(resume.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${isActive ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                    >
                      <FileText
                        className={`mt-0.5 size-5 shrink-0 ${isActive ? 'text-brand-600' : 'text-ink-500'}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{resume.fileName}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-ink-500">
                          {formatDate(resume.createdAt)}
                          <Badge tone={badge.tone} className="py-0 text-[11px]">
                            {badge.label}
                          </Badge>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
          <ResumeDropzone onFile={handleUpload} isUploading={isUploading} compact />
        </aside>

        <div className="min-w-0">
          {activeResume && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">{activeResume.fileName}</p>
                <p className="text-xs text-ink-500">
                  Uploaded {formatDate(activeResume.createdAt)} · {(activeResume.sizeBytes / 1024).toFixed(0)} KB
                </p>
              </div>
              <div className="flex gap-2">
                {activeResume.status === 'failed' && (
                  <Button variant="secondary" size="sm" onClick={handleRetry}>
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Retry analysis
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(activeResume)}
                  disabled={isAnalysing}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {isAnalysing ? (
            <AnalysingState />
          ) : activeResume?.status === 'failed' ? (
            <Card className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle className="size-6 text-red-500" aria-hidden="true" />
              </span>
              <p className="mt-5 font-semibold text-ink-900">We could not analyse this resume</p>
              <p className="mt-1 max-w-md text-sm text-ink-500">{activeResume.failureReason}</p>
            </Card>
          ) : detail.data?.profile ? (
            <ResumeAnalysis profile={detail.data.profile} />
          ) : (
            <Skeleton className="h-72 w-full rounded-3xl" />
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete this resume?"
        description="The extracted text and analysis will be removed. Past interviews and reports are kept."
        confirmLabel="Delete resume"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => !isDeleting && setPendingDelete(null)}
      />
    </>
  );
}
