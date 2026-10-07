import { useEffect, useRef, useState, type ReactNode } from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";
import type { Data, Layout } from "plotly.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import type { Figure, FigureLayout, Trace } from "@/types/api";
import { cn } from "@/utils/cn";
import { PLOT_CONFIG, themedData, themedLayout } from "@/utils/plotly-theme";

function traceColor(trace: Trace) {
  const color = trace.line?.color ?? trace.marker?.color;
  return typeof color === "string" ? color : undefined;
}

interface ChartLegendProps {
  traces: Trace[];
  hidden: Set<string>;
  onToggle: (name: string) => void;
}

/**
 * Legenda em HTML no lugar da do Plotly: fica alinhada com o título do
 * card e quebra linha naturalmente. Clicar num item esconde/mostra a
 * série, como na legenda original.
 */
function ChartLegend({ traces, hidden, onToggle }: ChartLegendProps) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {traces.map((trace) => {
        const name = trace.name ?? "";
        const off = hidden.has(name);
        const color = traceColor(trace);
        return (
          <li key={name}>
            <button
              type="button"
              onClick={() => onToggle(name)}
              aria-pressed={!off}
              className={cn(
                "flex items-center gap-2 rounded text-[11px] text-muted transition-opacity outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/40",
                off && "opacity-40",
              )}
            >
              {trace.type === "scatter" ? (
                <span className="relative h-0.5 w-4 rounded-full" style={{ backgroundColor: color }}>
                  <span
                    className="absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </span>
              ) : (
                <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
              )}
              {name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface ChartCardProps {
  title: string;
  description?: string;
  /** Conteúdo extra à direita do título (ex.: abas). */
  action?: ReactNode;
  /** Figura do backend (`fig.to_plotly_json()`). */
  figure: Figure;
  /** Traços ajustados que substituem `figure.data`. */
  data?: Trace[];
  /** Ajustes de layout aplicados por cima do tema. */
  layout?: FigureLayout;
  /** Altura mínima do gráfico em px. */
  height?: number;
  className?: string;
}

/**
 * Card com um gráfico Plotly. Recebe a figura do backend e aplica o tema
 * do dashboard. O gráfico ocupa todo o espaço livre do card (no mínimo
 * `height`), então cards lado a lado terminam o eixo x na mesma altura
 * mesmo quando um deles tem legenda ou descrição maior.
 *
 * Com mais de uma série nomeada, a legenda é desenhada em HTML (pizza
 * mantém a legenda do Plotly, que lista as fatias).
 */
export function ChartCard({
  title,
  description,
  action,
  figure,
  data,
  layout,
  height = 320,
  className,
}: ChartCardProps) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const boxRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLElement | null>(null);

  // Redimensiona o Plotly quando o espaço do card muda (grid esticando,
  // legenda quebrando linha, janela redimensionada).
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => {
      if (graphRef.current) void Plotly.Plots.resize(graphRef.current);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const traces = themedData(data ?? figure.data);
  const plotLayout = themedLayout(figure.layout, layout);
  const htmlLegend =
    traces.length > 1 &&
    traces.every((t) => t.type !== "pie" && t.name) &&
    plotLayout.showlegend !== false;

  const toggle = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const plotData = htmlLegend
    ? traces.map((t) => ({ ...t, visible: hidden.has(t.name ?? "") ? false : t.visible }))
    : traces;

  return (
    <Card className={cn("flex min-w-0 flex-col", className)}>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {htmlLegend && <ChartLegend traces={traces} hidden={hidden} onToggle={toggle} />}
        <div ref={boxRef} className="relative flex-1" style={{ minHeight: height }}>
          <Plot
            data={plotData as Data[]}
            layout={(htmlLegend ? { ...plotLayout, showlegend: false } : plotLayout) as Partial<Layout>}
            config={PLOT_CONFIG}
            onInitialized={(_, graphDiv) => {
              graphRef.current = graphDiv;
            }}
            className="absolute inset-0"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartCardSkeleton({ height = 320, className }: { height?: number; className?: string }) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full rounded-xl" style={{ height }} />
      </CardContent>
    </Card>
  );
}
