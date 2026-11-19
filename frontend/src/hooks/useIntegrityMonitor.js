import { useEffect, useRef } from 'react';
import { interviewService } from '../services/interviewService';

const FLUSH_EVERY_MS = 5000;
const MAX_BATCH = 50;

/**
 * Records browser integrity signals (tab visibility, window focus, fullscreen, connectivity)
 * while the interview is open. Signals only: nothing is captured from camera or microphone.
 */
export function useIntegrityMonitor(interviewId, { isActive, currentQuestionNumber }) {
  const queueRef = useRef([]);
  const questionRef = useRef(currentQuestionNumber);

  useEffect(() => {
    questionRef.current = currentQuestionNumber;
  }, [currentQuestionNumber]);

  useEffect(() => {
    if (!isActive) return undefined;

    const record = (type) =>
      queueRef.current.push({ type, occurredAt: new Date().toISOString(), questionNumber: questionRef.current });
    const flush = () => {
      if (!navigator.onLine || queueRef.current.length === 0) return;
      const batch = queueRef.current.splice(0, MAX_BATCH);
      interviewService.recordIntegrityEvents(interviewId, batch).catch(() => {
        queueRef.current.unshift(...batch); // Keep them for the next attempt.
      });
    };

    const onVisibility = () => record(document.visibilityState === 'hidden' ? 'tab_hidden' : 'tab_visible');
    const onBlur = () => record('window_blurred');
    const onFocus = () => record('window_focused');
    const onFullscreen = () => record(document.fullscreenElement ? 'fullscreen_entered' : 'fullscreen_exited');
    const onOffline = () => record('went_offline');
    const onOnline = () => {
      record('came_online');
      flush();
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    const timer = setInterval(flush, FLUSH_EVERY_MS);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      clearInterval(timer);
      flush();
    };
  }, [interviewId, isActive]);
}
