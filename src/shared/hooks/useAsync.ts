import { useState, useEffect, useCallback } from "react";

type AsyncState<T> = {
  loading: boolean;
  error: Error | null;
  data: T | null;
};

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: any[] = [],
  immediate = true,
): AsyncState<T> & { execute: () => Promise<void> } {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, deps); // re-run if any dep changes

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute]);

  return { loading, error, data, execute };
}
