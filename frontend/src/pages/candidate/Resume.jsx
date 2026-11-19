import { useCallback, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  Lock,
  RotateCcw,
  ScanText,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ResumeAnalysis } from '../../components/resume/ResumeAnalysis';
import { ResumeDropzone } from '../../components/resume/ResumeDropzone';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApi } from '../../hooks/useApi';
import { usePolling } from '../../hooks/usePolling';
import { resumeService } from '../../services/resumeService';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/format';
import { experienceLabels } from '../../utils/labels';
import { paths } from '../../utils/paths';

const MAX_RESUMES = 5;

const statusBadges = {
  analyzing: { label: 'Analysing', tone: 'brand' },
  analyzed: { label: 'Analysed', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  uploaded: { label: 'Uploaded', tone: 'neutral' },
};

const fileTypeLabel = (resume) => (resume.fileName.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF');
const fileSizeLabel = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Interviews use the most recently analysed resume, matching the backend's getLatestProfile. */
function findInUseId(resumes) {
  return resumes
    .filter((resume) => resume.status === 'analyzed')
    .sort((a, b) => new Date(b.analyzedAt ?? b.updatedAt) - new Date(a.analyzedAt ?? a.updatedAt))[0]?.id;
}

function AnalysingState() {
  const steps = [
    { icon: ScanText, text: 'Reading your resume' },
    { icon: FileText, text: 'Identifying skills, projects and experience' },
    { icon: Sparkles, text: 'Suggesting topics to prepare' },
  ];
  return (
    <div className="flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-6 py-16 text-center">
      <span className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-lg shadow-brand-700/25">
        <Sparkles className="size-7 text-white" aria-hidden="true" />
        <Loader2
          className="absolute -right-2 -bottom-2 size-6 animate-spin rounded-full bg-white p-0.5 text-brand-500"
          aria-hidden="true"
        />
      </span>
      <p className="mt-6 text-lg font-semibold text-ink-900">Analysing your resume</p>
      <p className="mt-1 text-sm text-ink-500">This usually takes 10–30 seconds. You can stay on this page.</p>
      <ul className="mt-8 w-full max-w-sm space-y-2 text-left">
        {steps.map(({ icon: Icon, text }, index) => (
          <li key={text} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-ink-700">
            <Icon
              className="size-4 animate-pulse text-brand-600"
              style={{ animationDelay: `${index * 0.3}s` }}
              aria-hidden="true"
            />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResumeOverview({ resume, profile, isInUse, onRetry, onDelete }) {
  const badge = statusBadges[resume.status];
  const isAnalysing = resume.status === 'analyzing';

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
      <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-brand-50 via-brand-50/40 to-white px-6 py-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-brand-100">
          <FileText className="size-6 text-brand-600" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="max-w-full truncate text-base font-semibold text-ink-900">{resume.fileName}</p>
            <Badge tone={badge.tone}>{badge.label}</Badge>
            {isInUse && (
              <Badge tone="brand">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                Used for interviews
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-500">
            {fileTypeLabel(resume)} · {fileSizeLabel(resume.sizeBytes)} · Uploaded {formatDate(resume.createdAt)}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          {resume.status === 'failed' && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Retry analysis
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isAnalysing}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>

      {profile && (
        <div className="border-t border-slate-100 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-ink-900">Profile summary</h2>
            {profile.estimatedExperienceLevel && (
              <span className="rounded-full bg-ink-900 px-2.5 py-0.5 text-xs font-medium text-white">
                {experienceLabels[profile.estimatedExperienceLevel]}
              </span>
            )}
          </div>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink-600">{profile.summary}</p>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-500">
            <Info className="size-3.5 shrink-0" aria-hidden="true" />
            Extracted by AI from your resume. These details are your own claims and have not been verified.
          </p>
        </div>
      )}
    </section>
  );
}

function ResumeList({ resumes, activeId, inUseId, onSelect }) {
  return (
    <Panel
      title="Your resumes"
      action={
        <span className="text-xs font-medium text-ink-500 tabular-nums">
          {resumes.length} of {MAX_RESUMES}
        </span>
      }
      bodyClassName="px-3 pt-3 pb-3"
    >
      <ul className="space-y-1">
        {resumes.map((resume, index) => {
          const badge = statusBadges[resume.status];
          const isActive = resume.id === activeId;
          return (
            <li key={resume.id}>
              <button
                type="button"
                onClick={() => onSelect(resume.id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors',
                  isActive ? 'border-brand-200 bg-brand-50/70' : 'border-transparent hover:bg-slate-50',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 shrink-0 flex-col items-center justify-center rounded-xl text-[10px] font-bold tracking-wide',
                    isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-600',
                  )}
                >
                  {fileTypeLabel(resume)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-ink-900">{resume.fileName}</span>
                    {resume.id === inUseId && (
                      <CheckCircle2 className="size-3.5 shrink-0 text-brand-600" aria-label="Used for interviews" />
                    )}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
                    <span className="whitespace-nowrap">
                      v{resumes.length - index} · {formatDate(resume.createdAt)}
                    </span>
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
    </Panel>
  );
}

function PrivacyNote() {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
      <Lock className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-ink-500">
        Only the extracted text is kept, never the original file. Your newest analysed resume personalises every new
        interview. Delete any version at any time.
      </p>
    </div>
  );
}

function FirstUpload({ onFile, isUploading, error }) {
  const points = [
    { icon: ScanText, title: 'We read it', text: 'Text PDFs, DOCX and scanned PDFs.' },
    { icon: Sparkles, title: 'AI analyses it', text: 'Skills, projects, experience and focus areas.' },
    { icon: CheckCircle2, title: 'Interviews use it', text: 'Questions about your own work.' },
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
          Step 1 of your preparation
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">Upload your resume</h1>
        <p className="mx-auto mt-2 max-w-lg text-ink-500">
          We use it to write questions about your own projects and skills, just like a real interviewer would.
        </p>
      </div>
      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}
      <ResumeDropzone onFile={onFile} isUploading={isUploading} />
      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {points.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
              <Icon className="size-4 text-brand-600" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">
                {index + 1}. {title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
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
  const inUseId = findInUseId(resumes);

  const detail = useApi(
    (signal) => (activeId ? resumeService.get(activeId, signal) : Promise.resolve(null)),
    [activeId],
  );
  const activeResume = detail.data?.resume ?? resumes.find((resume) => resume.id === activeId);
  const isAnalysing = activeResume?.status === 'analyzing';
  const isAtLimit = resumes.length >= MAX_RESUMES;

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
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </>
    );
  }

  if (resumes.length === 0) {
    return <FirstUpload onFile={handleUpload} isUploading={isUploading} error={actionError} />;
  }

  return (
    <>
      <PageHeader
        title="Resume"
        description="Your newest analysed resume personalises every new interview."
        actions={
          inUseId && (
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

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ResumeList resumes={resumes} activeId={activeId} inUseId={inUseId} onSelect={setSelectedId} />
          {isAtLimit ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
              You have {MAX_RESUMES} resumes, the maximum. Delete an older version to upload a new one.
            </div>
          ) : (
            <ResumeDropzone onFile={handleUpload} isUploading={isUploading} compact />
          )}
          <PrivacyNote />
        </aside>

        <div className="min-w-0 space-y-6">
          {activeResume && (
            <ResumeOverview
              resume={activeResume}
              profile={activeResume.status === 'analyzed' ? detail.data?.profile : null}
              isInUse={activeResume.id === inUseId}
              onRetry={handleRetry}
              onDelete={() => setPendingDelete(activeResume)}
            />
          )}

          {isAnalysing ? (
            <AnalysingState />
          ) : activeResume?.status === 'failed' ? (
            <div className="flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle className="size-6 text-red-500" aria-hidden="true" />
              </span>
              <p className="mt-5 font-semibold text-ink-900">We could not analyse this resume</p>
              <p className="mt-1 max-w-md text-sm text-ink-500">{activeResume.failureReason}</p>
            </div>
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
