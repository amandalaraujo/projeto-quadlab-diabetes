import { useCallback, useEffect, useState } from "react";
import api from "@/api/client";
import { useFilters } from "./use-filters";

/**
 * Cache em memória das respostas por URL (endpoint + filtros). Os dados
 * da base só mudam quando o ETL roda de novo, então não expiram: voltar
 * a uma página ou a um filtro já visto é instantâneo. Requisições iguais
 * em andamento são compartilhadas.
 */
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();
const MAX_ENTRIES = 80;

export function fetchCached<T>(url: string): Promise<T> {
  if (cache.has(url)) return Promise.resolve(cache.get(url) as T);
  let request = inflight.get(url) as Promise<T> | undefined;
  if (!request) {
    request = api
      .get<T>(url)
      .then((res) => {
        cache.set(url, res.data);
        // Descarta a entrada mais antiga quando o cache enche.
        if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value!);
        return res.data;
      })
      .finally(() => inflight.delete(url));
    inflight.set(url, request);
  }
  return request;
}

/** Monta a URL usada como chave do cache. */
export const apiUrl = (endpoint: string, query = "") => (query ? `${endpoint}?${query}` : endpoint);

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * GET em `endpoint` com estados de carregamento/erro e `reload()` para tentar de novo.
 * Ao trocar de endpoint/query, os dados anteriores continuam em `data` até a
 * nova resposta chegar (`loading` fica true), para a tela não piscar a cada filtro.
 */
export function useApi<T>(endpoint: string, query = "") {
  const url = apiUrl(endpoint, query);
  const [state, setState] = useState<ApiState<T>>(() =>
    cache.has(url)
      ? { data: cache.get(url) as T, error: null, loading: false }
      : { data: null, error: null, loading: true },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache.has(url)) {
      setState({ data: cache.get(url) as T, error: null, loading: false });
      return;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, error: null, loading: true }));
    fetchCached<T>(url)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, error: err.message, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [url, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, reload };
}

/** `useApi` com os filtros globais da barra (lidos da URL) aplicados. */
export function useFilteredApi<T>(endpoint: string) {
  const { query } = useFilters();
  return useApi<T>(endpoint, query);
}
