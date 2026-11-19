import { useCallback, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePolling } from '../../hooks/usePolling';
import { resumeService } from '../../services/resumeService';
import { experienceLabels } from '../../utils/labels';
import { ResumeDropzone } from '../resume/ResumeDropzone';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

function SkipLink({ onSkip }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="text-sm font-medium text-ink-500 underline-offset-4 hover:text-ink-800 hover:underline"
    >
      Continue without a resume
    </button>
  );
}

/** Step 1 of the guided flow: use the latest analysed resume, or upload one and wait for analysis. */
export function ResumeStep({ onContinue }) {
  const list = useApi((signal) => resumeService.list(signal));
  const latest = list.data?.resumes[0];
  const [isUploading, setIsUploading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [error, setError] = useState('');

  const detail = useApi(
    (signal) => (latest?.status === 'analyzed' ? resumeService.get(latest.id, signal) : Promise.resolve(null)),
    [latest?.id, latest?.status],
  );
  const { reload: reloadList } = list;
  const refresh = useCallback(() => reloadList(), [reloadList]);
  usePolling(refresh, latest?.status === 'analyzing', 2500);

  async function upload(file) {
    setIsUploading(true);
    setError('');
    try {
      await resumeService.upload(file);
      setIsReplacing(false);
      reloadList();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function retry() {
    setError('');
    try {
      await resumeService.retryAnalysis(latest.id);
      reloadList();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (list.isLoading && !list.data) return <Skeleton className="h-72 rounded-3xl" />;

  const showUpload = !latest || isReplacing;

  return (
    <div className="max-w-3xl">
      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}

      {showUpload ? (
        <>
          <ResumeDropzone onFile={upload} isUploading={isUploading} />
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-ink-500">We keep only the extracted text. You can delete it any time.</p>
            {isReplacing ? (
              <Button variant="ghost" onClick={() => setIsReplacing(false)}>
                Cancel
              </Button>
            ) : (
              <SkipLink onSkip={onContinue} />
            )}
          </div>
        </>
      ) : latest.status === 'analyzing' ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <span className="relative flex size-16 items-center justify-center rounded-2xl bg-brand-50">
            <Sparkles className="size-7 text-brand-600" aria-hidden="true" />
            <Loader2
              className="absolute -right-2 -bottom-2 size-6 animate-spin rounded-full bg-white p-0.5 text-brand-500"
              aria-hidden="true"
            />
          </span>
          <p className="mt-6 text-lg font-semibold text-ink-900">Analysing {latest.fileName}</p>
          <p className="mt-1 text-sm text-ink-500">
            Reading your skills, projects and experience. This usually takes 10–30 seconds.
          </p>
        </Card>
      ) : latest.status === 'failed' ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="size-6 text-red-500" aria-hidden="true" />
          </span>
          <p className="mt-5 font-semibold text-ink-900">We could not analyse {latest.fileName}</p>
          <p className="mt-1 max-w-md text-sm text-ink-500">{latest.failureReason}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={retry}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Retry analysis
            </Button>
            <Button variant="secondary" onClick={() => setIsReplacing(true)}>
              Upload another file
            </Button>
          </div>
          <div className="mt-6">
            <SkipLink onSkip={onContinue} />
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 border-b border-slate-100 bg-brand-50/60 px-6 py-5">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-xs">
              <FileText className="size-6 text-brand-600" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold text-ink-900">
                <CheckCircle2 className="size-4 text-brand-600" aria-hidden="true" />
                Resume ready
              </p>
              <p className="truncate text-sm text-ink-600">{latest.fileName}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsReplacing(true)}>
              Use a different file
            </Button>
          </div>
          <div className="space-y-5 p-6">
            {detail.data?.profile ? (
              <>
                <p className="text-sm leading-relaxed text-ink-600">{detail.data.profile.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...detail.data.profile.programmingLanguages,
                    ...detail.data.profile.frameworks,
                    ...detail.data.profile.tools,
                  ]
                    .slice(0, 12)
                    .map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
                <p className="text-xs text-ink-500">
                  {experienceLabels[detail.data.profile.estimatedExperienceLevel]} · Questions will reference your
                  projects and skills.
                </p>
              </>
            ) : (
              <Skeleton className="h-20" />
            )}
            <Button size="lg" variant="dark" className="w-full sm:w-auto" onClick={onContinue}>
              Continue to company
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
