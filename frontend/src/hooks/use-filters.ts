import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export interface FilterDef {
  /** Query param aceito pelo backend (ver FILTROS em dashboard/api/filters.py). */
  key: string;
  label: string;
  /** Rótulo curto de um valor (ex.: "E10 Diabetes mellitus..." -> "E10"). */
  short?: (value: string) => string;
}

/** Filtros globais, na ordem da barra. */
export const FILTERS: FilterDef[] = [
  { key: "ano", label: "Ano" },
  { key: "sexo", label: "Gênero" },
  { key: "raca", label: "Raça/Cor" },
  { key: "regiao", label: "Região" },
  { key: "uf", label: "UF residencial" },
  { key: "municipio", label: "Município de atendimento" },
  { key: "faixa", label: "Faixa etária" },
  { key: "cid", label: "Tipo de diabetes", short: (v) => v.slice(0, 3) },
];

const KEYS = FILTERS.map((f) => f.key);

/**
 * Estado dos filtros globais, guardado na URL (`?uf=SP&uf=MG&faixa=60-64a`):
 * vale para todas as páginas, sobrevive ao recarregar e pode ser
 * compartilhado por link. `query` é a parte que vai para a API.
 */
export function useFilters() {
  const [params, setParams] = useSearchParams();

  const selected = useMemo(
    () => Object.fromEntries(KEYS.map((k) => [k, params.getAll(k)])) as Record<string, string[]>,
    [params],
  );

  const query = useMemo(() => {
    const q = new URLSearchParams();
    for (const k of KEYS) for (const v of params.getAll(k)) q.append(k, v);
    return q.toString();
  }, [params]);

  const setFilter = useCallback(
    (key: string, values: string[]) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(key);
          for (const v of values) next.append(key, v);
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  const clearAll = useCallback(
    () =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const k of KEYS) next.delete(k);
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  const activeCount = KEYS.reduce((n, k) => n + selected[k].length, 0);

  return { selected, query, setFilter, clearAll, activeCount };
}
