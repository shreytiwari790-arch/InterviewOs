import { useEffect, useState } from 'react';

/** Milliseconds left until `endTime`, corrected by the server/client clock offset. Ticks every second. */
export function useCountdown(endTime, clockOffsetMs = 0) {
  const target = endTime ? new Date(endTime).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  return target ? Math.max(0, target - (now + clockOffsetMs)) : null;
}

export function formatCountdown(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
