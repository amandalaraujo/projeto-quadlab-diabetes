import { ChartCard, ChartCardSkeleton } from "@/components/chart-card";
import { ErrorState } from "@/components/error-state";
import { useApi } from "@/hooks/use-api";
import type { FigureMeta } from "@/routes/pages";
import type { FigureResponse } from "@/types/api";
import { cn } from "@/utils/cn";
import { legendBars, monthBars, type FigureAdjustment } from "@/utils/figures";

interface FigurePageProps {
  endpoint: string;
  figures?: Record<string, FigureMeta>;
}

/**
 * Página genérica: chama `endpoint`, espera de volta um objeto cujas
 * chaves comecem com "fig_" (cada uma um fig.to_plotly_json() do backend)
 * e renderiza um ChartCard por figura. Títulos e ajustes vêm de `figures`
 * (ver routes/pages.ts). Para uma página com KPIs/layout diferente, copie
 * overview.tsx em vez desta.
 */
export default function FigurePage({ endpoint, figures = {} }: FigurePageProps) {
  const { data, error, loading, reload } = useApi<FigureResponse>(endpoint);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  const entries = data ? Object.entries(data).filter(([k]) => k.startsWith("fig_")) : [];
  // Uma figura só ocupa a largura toda; duas ou mais ficam lado a lado.
  const single = (data ? entries.length : Object.keys(figures).length) <= 1;
  const grid = cn("grid grid-cols-1 gap-3.5", !single && "nav:grid-cols-2");

  if (loading) {
    return (
      <div className={grid}>
        {Object.entries(figures).map(([key, meta]) => (
          <ChartCardSkeleton
            key={key}
            height={meta.height ?? 320}
            className={cn(meta.wide && "nav:col-span-2")}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={grid}>
      {entries.map(([key, fig]) => {
        const meta: FigureMeta = figures[key] ?? { title: key };
        const adjusted: FigureAdjustment = meta.legendBars
          ? legendBars(fig, meta.unit)
          : meta.months
            ? monthBars(fig)
            : {};
        return (
          <ChartCard
            key={key}
            title={meta.title}
            description={meta.description}
            figure={fig}
            data={adjusted.data}
            layout={adjusted.layout}
            height={meta.height ?? 320}
            className={cn(meta.wide && !single && "nav:col-span-2")}
          />
        );
      })}
    </div>
  );
}
