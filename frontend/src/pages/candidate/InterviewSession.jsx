import { useCallback, useEffect } from 'react';
import { Navigate, useParams } from 'react-router';
import { InterviewRoom } from '../../components/interview/InterviewRoom';
import {
  EvaluatingScreen,
  FailedScreen,
  FocusShell,
  GeneratingScreen,
  ReadyScreen,
} from '../../components/interview/SessionScreens';
import { Alert } from '../../components/ui/Alert';
import { FullPageLoader } from '../../components/ui/FullPageLoader';
import { useApi } from '../../hooks/useApi';
import { usePolling } from '../../hooks/usePolling';
import { interviewService } from '../../services/interviewService';
import { reportPath } from '../../utils/paths';

const POLLING_STATUSES = new Set(['generating', 'evaluating']);

export default function InterviewSession() {
  const { interviewId } = useParams();
  const { data, error, reload } = useApi((signal) => interviewService.getSession(interviewId, signal), [interviewId]);
  const status = data?.interview.status;

  usePolling(reload, POLLING_STATUSES.has(status), 2500);

  const leaveFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);
  useEffect(() => {
    if (status === 'evaluating' || status === 'completed') leaveFullscreen();
  }, [status, leaveFullscreen]);

  if (error && !data) {
    return (
      <FocusShell>
        <Alert tone="error" className="max-w-md">
          {error.message}
        </Alert>
      </FocusShell>
    );
  }
  if (!data) return <FullPageLoader label="Loading interview" />;
  if (status === 'completed') return <Navigate to={reportPath(interviewId)} replace />;
  if (status === 'in_progress') return <InterviewRoom session={data} onSubmitted={reload} />;

  return (
    <FocusShell>
      {status === 'generating' && <GeneratingScreen interview={data.interview} />}
      {status === 'evaluating' && <EvaluatingScreen />}
      {status === 'failed' && (
        <FailedScreen
          interview={data.interview}
          onRetry={async () => {
            await interviewService.retry(interviewId);
            reload();
          }}
        />
      )}
      {status === 'ready' && (
        <ReadyScreen
          interview={data.interview}
          onStart={async () => {
            await interviewService.start(interviewId);
            reload();
          }}
        />
      )}
    </FocusShell>
  );
}
