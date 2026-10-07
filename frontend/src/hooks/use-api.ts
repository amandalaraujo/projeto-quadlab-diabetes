import { useCallback, useEffect, useState } from "react";
import api from "@/api/client";

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** GET em `endpoint` com estados de carregamento/erro e `reload()` para tentar de novo. */
export function useApi<T>(endpoint: string) {
  const [state, setState] = useState<ApiState<T>>({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, error: null, loading: true });
    api
      .get<T>(endpoint)
      .then((res) => {
        if (!cancelled) setState({ data: res.data, error: null, loading: false });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, error: err.message, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, reload };
}
