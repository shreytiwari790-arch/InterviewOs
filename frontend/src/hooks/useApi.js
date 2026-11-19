import { useCallback, useEffect, useState } from 'react';

/**
 * Loads data from the API and re-runs whenever `deps` change or reload() is called.
 * Previous data stays visible while a new request is in flight (useful for pagination).
 */
export function useApi(fetcher, deps = []) {
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = JSON.stringify([...deps, reloadCount]);
  const [result, setResult] = useState({ key: null, data: undefined, error: null });

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => setResult({ key: requestKey, data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResult((previous) => ({ key: requestKey, data: previous.data, error }));
      });
    return () => controller.abort();
    // `fetcher` is usually an inline function; its inputs are captured by `deps` via requestKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const setData = useCallback(
    (update) =>
      setResult((previous) => ({ ...previous, data: typeof update === 'function' ? update(previous.data) : update })),
    [],
  );

  return { data: result.data, error: result.error, isLoading: result.key !== requestKey, reload, setData };
}
