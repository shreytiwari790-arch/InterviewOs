import { useCallback, useEffect, useRef, useState } from 'react';
import { interviewService } from '../services/interviewService';
import { useOnlineStatus } from './useOnlineStatus';

const SAVE_DELAY_MS = 900;

/**
 * Queues answer drafts and saves them shortly after the candidate stops typing.
 * Drafts survive brief connection loss: they stay queued and are sent when the browser is back online.
 * `onTimeUp` is called if the server reports the interview has already been submitted.
 */
export function useAnswerAutosave(interviewId, { onTimeUp }) {
  const pendingRef = useRef(new Map());
  const timerRef = useRef(null);
  const isFlushingRef = useRef(false);
  const [status, setStatus] = useState('idle'); // idle | pending | saving | saved | offline | error
  const isOnline = useOnlineStatus();

  const flush = useCallback(async () => {
    clearTimeout(timerRef.current);
    if (isFlushingRef.current || pendingRef.current.size === 0) return;
    if (!navigator.onLine) return setStatus('offline');

    isFlushingRef.current = true;
    setStatus('saving');
    try {
      while (pendingRef.current.size > 0) {
        const [questionId, answer] = pendingRef.current.entries().next().value;
        pendingRef.current.delete(questionId);
        try {
          await interviewService.saveAnswer(interviewId, questionId, answer);
        } catch (error) {
          if (error.status === 0) {
            if (!pendingRef.current.has(questionId)) pendingRef.current.set(questionId, answer);
            setStatus('offline');
            return;
          }
          if (error.status === 409 && /time is up|not in progress/i.test(error.message)) {
            onTimeUp?.();
            return;
          }
          throw error;
        }
      }
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      isFlushingRef.current = false;
    }
  }, [interviewId, onTimeUp]);

  const queue = useCallback(
    (questionId, answer) => {
      pendingRef.current.set(questionId, answer);
      setStatus('pending');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, SAVE_DELAY_MS);
    },
    [flush],
  );

  useEffect(() => {
    if (isOnline && pendingRef.current.size > 0) flush();
  }, [isOnline, flush]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { queue, flush, status: !isOnline && status !== 'idle' ? 'offline' : status, isOnline };
}
