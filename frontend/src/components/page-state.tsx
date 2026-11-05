import type { ReactNode } from "react";
import { FilterX } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ChartCardSkeleton } from "@/components/chart-card";
import { ErrorState } from "@/components/error-state";
import { KpiCardSkeleton } from "@/components/kpi-card";
import { useFilters } from "@/hooks/use-filters";
import { cn } from "@/utils/cn";

function PageSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 wide:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="mt-3.5 grid grid-cols-1 gap-3.5 nav:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </>
  );
}

function EmptyFilters() {
  const { clearAll } = useFilters();
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-amber-soft text-amber">
        <FilterX className="size-5" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-ink">Nenhuma AIH para os filtros selecionados</h3>
      <p className="mt-1 max-w-md text-xs text-muted">Remova algum filtro para ver os dados.</p>
      <Button variant="outline" size="sm" className="mt-5" onClick={clearAll}>
        Limpar filtros
      </Button>
    </Card>
  );
}

interface PageStateProps<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
  /** true quando os filtros não retornaram nenhuma AIH. */
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}

/**
 * Estados comuns das páginas: esqueleto no primeiro carregamento, erro,
 * vazio (filtros sem resultado) e, ao trocar filtros, o conteúdo anterior
 * esmaecido até a nova resposta chegar.
 */
export function PageState<T>({ data, error, loading, reload, isEmpty, children }: PageStateProps<T>) {
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <PageSkeleton />;
  if (isEmpty?.(data)) return <EmptyFilters />;
  return (
    <div className={cn("transition-opacity duration-200", loading && "pointer-events-none opacity-55")} aria-busy={loading}>
      {children(data)}
    </div>
  );
}

/** Grades usadas pelas páginas. */
export const GRID = {
  kpis: "grid grid-cols-2 gap-3.5 wide:grid-cols-4",
  kpis3: "grid grid-cols-1 gap-3.5 sm:grid-cols-3",
  two: "mt-3.5 grid grid-cols-1 gap-3.5 nav:grid-cols-2",
  wideLeft: "mt-3.5 grid grid-cols-1 gap-3.5 nav:grid-cols-[1.6fr_1fr]",
  full: "mt-3.5 grid grid-cols-1 gap-3.5",
};
