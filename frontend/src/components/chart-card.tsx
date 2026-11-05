import { useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject, type ReactNode } from "react";
import Plotly from "plotly.js-dist-min";
import type { Data, Layout } from "plotly.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { InfoPopover, type ChartInfo } from "@/components/info-popover";
import { MapSearch } from "@/components/map-search";
import { Skeleton } from "@/components/skeleton";
import type { Figure, FigureLayout, Trace } from "@/types/api";
import { cn } from "@/utils/cn";
import { PLOT_CONFIG, themedData, themedLayout } from "@/utils/plotly-theme";

interface PlotProps {
  data: Trace[];
  layout: FigureLayout;
  className?: string;
  style?: CSSProperties;
  /** Recebe o div do gráfico (para redimensionar). */
  graphRef: MutableRefObject<HTMLDivElement | null>;
  /** Eventos do Plotly (ex.: `plotly_sunburstclick`) -> handler. */
  events?: PlotEvents;
}

export type PlotEvents = Record<string, (event: PlotEvent) => boolean | void>;
// Dados de evento do Plotly (pontos clicados etc.); o formato varia por tipo de traço.
// `nextLevel` vem no próprio evento (não nos pontos) no clique do sunburst.
export type PlotEvent = { points?: Array<Record<string, unknown>>; nextLevel?: string };

type GraphDiv = HTMLDivElement & { on?: (name: string, fn: (e: PlotEvent) => boolean | void) => void };

/**
 * Desenha a figura com `Plotly.react` quando `data`/`layout` mudam e faz `purge` ao desmontar.
 * Substitui o <Plot> do react-plotly, que enfileira as chamadas numa promise:
 * quando o StrictMode desmonta/remonta o gráfico no meio da inicialização
 * (assíncrona) de um mapa, essa fila trava e o gráfico fica em branco.
 */
function Plot({ data, layout, className, style, graphRef, events }: PlotProps) {
  const ref = useRef<GraphDiv>(null);
  // Handlers mais recentes; cada evento é registrado uma vez só no div.
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const bound = useRef(new Set<string>());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    graphRef.current = el;
    Plotly.react(el, data as Data[], layout as Partial<Layout>, PLOT_CONFIG)
      .then(() => {
        for (const name of Object.keys(eventsRef.current ?? {})) {
          if (bound.current.has(name)) continue;
          el.on?.(name, (e) => eventsRef.current?.[name]?.(e));
          bound.current.add(name);
        }
      })
      .catch((err: unknown) => console.error("Plotly:", err));
  }, [data, layout, graphRef]);

  useEffect(() => {
    const el = ref.current;
    const names = bound.current;
    return () => {
      if (el) Plotly.purge(el);
      names.clear();
    };
  }, []);

  return <div ref={ref} className={className} style={style} />;
}

function traceColor(trace: Trace) {
  const color = trace.line?.color ?? trace.marker?.color;
  if (typeof color === "string") return color;
  // Cor por escala (ex.: bolhas dos mapas): usa o tom do meio da escala.
  const scale = trace.marker?.colorscale as Array<[number, string]> | undefined;
  return scale?.[Math.floor(scale.length / 2)]?.[1];
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
  /** Informativo do botão "?" (como ler + interpretação com os filtros atuais). */
  info?: ChartInfo;
  /** Eventos do Plotly repassados ao gráfico. */
  events?: PlotEvents;
  /** Ref para o div do gráfico, quando a página precisa chamar o Plotly direto (ex.: animar). */
  plotRef?: MutableRefObject<HTMLDivElement | null>;
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
  info,
  events,
  plotRef,
}: ChartCardProps) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const boxRef = useRef<HTMLDivElement>(null);
  const ownGraphRef = useRef<HTMLDivElement | null>(null);
  const graphRef = plotRef ?? ownGraphRef;

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

  // Memoizados para o Plotly só redesenhar quando a figura muda de fato:
  // um redesenho desnecessário desfaria o zoom feito pela busca no mapa.
  const traces = useMemo(() => themedData(data ?? figure.data), [data, figure]);
  const baseLayout = useMemo(() => themedLayout(figure.layout, layout), [figure, layout]);
  const mapView = (figure.layout.map ?? null) as { center: { lat: number; lon: number }; zoom: number } | null;
  const htmlLegend =
    traces.length > 1 &&
    traces.every((t) => t.type !== "pie" && t.name) &&
    baseLayout.showlegend !== false;
  const plotLayout = useMemo(
    () => ({
      ...baseLayout,
      ...(htmlLegend && { showlegend: false }),
      // Preserva zoom/centro (da busca ou do usuário) ao mostrar/esconder séries;
      // muda quando os filtros trazem outro enquadramento.
      ...(mapView && { uirevision: JSON.stringify(mapView.center) }),
    }),
    [baseLayout, htmlLegend, mapView],
  );

  const toggle = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  // Só marca as séries ocultas; as demais seguem como vieram do backend.
  const plotData = useMemo(
    () => (htmlLegend ? traces.map((t) => (hidden.has(t.name ?? "") ? { ...t, visible: false } : t)) : traces),
    [traces, htmlLegend, hidden],
  );

  return (
    <Card className={cn("flex min-w-0 flex-col", className)}>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {(action || info) && (
          <div className="ml-auto flex items-center gap-2">
            {action}
            {info && <InfoPopover title={title} info={info} />}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {htmlLegend && <ChartLegend traces={traces} hidden={hidden} onToggle={toggle} />}
        <div ref={boxRef} className="relative flex-1" style={{ minHeight: height }}>
          <Plot
            data={plotData}
            layout={plotLayout}
            graphRef={graphRef}
            events={events}
            className="absolute inset-0"
            style={{ width: "100%", height: "100%" }}
          />
          {mapView && <MapSearch traces={traces} graphRef={graphRef} home={mapView} />}
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
