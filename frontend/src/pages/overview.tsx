import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { ChartCard, ChartCardSkeleton } from "@/components/chart-card";
import { ErrorState } from "@/components/error-state";
import { KpiCard, KpiCardSkeleton } from "@/components/kpi-card";
import { Skeleton } from "@/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { useApi } from "@/hooks/use-api";
import type { Figure, OverviewResponse, Trace } from "@/types/api";
import { BRAND, complicationColor, isNoComplication } from "@/utils/complications";
import { formatMoney, formatNumber, formatPercent, monthLabel } from "@/utils/format";

type EvolutionView = "complicacao" | "total";

function EvolutionChart({ figure }: { figure: Figure }) {
  const [view, setView] = useState<EvolutionView>("complicacao");

  const traces = useMemo<Trace[]>(() => {
    const series = figure.data.map((s) => ({ ...s, x: (s.x ?? []).map(monthLabel) }));
    if (view === "total") {
      const x = series[0]?.x ?? [];
      const y = x.map((_, i) => series.reduce((sum, s) => sum + (s.y?.[i] ?? 0), 0));
      return [
        {
          type: "scatter",
          mode: "lines+markers",
          name: "Total",
          x,
          y,
          line: { color: BRAND, width: 2.5, shape: "spline" },
          marker: { size: 6, color: BRAND },
          fill: "tozeroy",
          fillcolor: "rgba(18, 184, 166, 0.08)",
          hovertemplate: "<b>%{y:,} AIHs</b><extra></extra>",
        },
      ];
    }
    return series.map((s) => {
      const color = complicationColor(s.name ?? "", s.line?.color);
      return {
        ...s,
        line: { color, width: 2.5, shape: "spline" },
        marker: { size: 5, color },
        hovertemplate: `${s.name}: <b>%{y:,}</b><extra></extra>`,
      };
    });
  }, [figure, view]);

  return (
    <ChartCard
      title="Evolução das internações (Mês a Mês)"
      figure={figure}
      data={traces}
      height={260}
      layout={{
        xaxis: { showgrid: false },
        yaxis: { rangemode: "tozero" },
        hovermode: "x unified",
        showlegend: view !== "total",
      }}
      action={
        <Tabs value={view} onValueChange={(v) => setView(v as EvolutionView)}>
          <TabsList aria-label="Visualização da série">
            <TabsTrigger value="complicacao">Por complicação</TabsTrigger>
            <TabsTrigger value="total">Total</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    />
  );
}

/** Ranking no estilo `.rank` do protótipo original: nome · barra · valor. */
function ComplicationsRanking({ figure, total }: { figure: Figure; total: number }) {
  const [bar] = figure.data;
  const values = bar.y ?? [];
  const baseColor = bar.marker?.color;
  const rows = (bar.x ?? []).map(String).map((name, i) => ({
    name,
    value: values[i],
    share: values[i] / total,
    color: complicationColor(name, Array.isArray(baseColor) ? baseColor[i] : baseColor),
  }));
  const max = Math.max(...rows.map((r) => r.value));
  const complicated = rows.filter((r) => !isNoComplication(r.name));
  const topComplication = complicated[0];
  const withComplication = complicated.reduce((sum, r) => sum + r.share, 0);

  return (
    <Card className="flex min-w-0 flex-col">
      <CardHeader>
        <CardTitle>Distribuição por Complicação</CardTitle>
        <small className="rounded-full bg-canvas px-2 py-1.25 text-[9px] font-extrabold text-faint uppercase">
          % das AIHs
        </small>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-1">
        {rows.map((row) => (
          <div key={row.name} className="my-3.5 flex items-center gap-2.5 text-[11px] font-semibold">
            <span className="w-27.5 shrink-0 leading-tight text-ink">{row.name}</span>
            <div className="h-1.75 flex-1 overflow-hidden rounded-full bg-[#edf1f5]">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${(row.value / max) * 100}%`, backgroundColor: row.color }}
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-10.5 shrink-0 cursor-default text-right font-bold text-muted tabular-nums">
                  {formatPercent(row.share, 0)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                {formatNumber(row.value)} AIHs · {formatPercent(row.share)}
              </TooltipContent>
            </Tooltip>
          </div>
        ))}

        {topComplication && (
          <div className="mt-auto rounded-[10px] border border-[#d8efeb] border-l-[3px] border-l-brand bg-[#f7fbfa] p-3.25 text-[11px] leading-relaxed text-[#52606d]">
            <strong className="text-ink">{formatPercent(withComplication)}</strong> das
            internações tiveram complicação grave registrada.{" "}
            <strong className="text-ink">{topComplication.name}</strong> é a mais frequente, com{" "}
            {formatPercent(topComplication.share)} do total.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SummaryRow {
  label: string;
  value: string;
  /** Com `to`, o valor vira link para a página da análise. */
  to?: string;
}

/** Cards de resumo do rodapé (`.bottom-panels` / `.mini` do template original). */
function SummaryCard({ title, rows }: { title: string; rows: SummaryRow[] }) {
  return (
    <Card className="p-5">
      <h3 className="mb-3 text-[10px] font-extrabold tracking-[1px] text-faint uppercase">{title}</h3>
      {rows.map(({ label, value, to }) => (
        <div
          key={label}
          className="flex justify-between gap-3 border-b border-dashed border-line py-2 text-[11px] font-semibold text-ink last:border-0 last:pb-0"
        >
          <span>{label}</span>
          {to ? (
            <Link to={to} className="hover:text-brand-strong hover:underline">
              {value}
            </Link>
          ) : (
            <span className="tabular-nums">{value}</span>
          )}
        </div>
      ))}
    </Card>
  );
}

// Mesma grade do original: 4 KPIs por linha acima de 1050px (2 abaixo),
// painéis 1.5fr / 1fr e 3 cards de resumo acima de 850px.
const KPI_GRID = "grid grid-cols-2 gap-3.5 wide:grid-cols-4";
const PANELS_GRID = "mt-3.5 grid grid-cols-1 gap-3.5 nav:grid-cols-[1.5fr_1fr]";
const BOTTOM_GRID = "mt-3.5 grid grid-cols-1 gap-3.5 nav:grid-cols-3";

function OverviewSkeleton() {
  return (
    <>
      <div className={KPI_GRID}>
        {Array.from({ length: 4 }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className={PANELS_GRID}>
        <ChartCardSkeleton height={260} />
        <Card className="p-5">
          <Skeleton className="h-4 w-40" />
          <div className="mt-6 space-y-6">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </Card>
      </div>
      <div className={BOTTOM_GRID}>
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="space-y-4 p-5">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </Card>
        ))}
      </div>
    </>
  );
}

export default function Overview() {
  const { data, error, loading, reload } = useApi<OverviewResponse>("/overview/");

  if (loading) return <OverviewSkeleton />;
  if (error || !data) return <ErrorState message={error} onRetry={reload} />;

  const { kpis } = data;

  return (
    <>
      <div className={KPI_GRID}>
        <KpiCard label="AIHs diabetes" value={formatNumber(kpis.total_aihs)} trend="↑ indicador principal" />
        <KpiCard
          label="Óbitos"
          value={formatNumber(kpis.obitos)}
          trend={`letalidade ${formatPercent(kpis.obitos / kpis.total_aihs, 2)}`}
        />
        <KpiCard
          label="Custo total"
          value={formatMoney(kpis.custo_total, { compact: true })}
          fullValue={formatMoney(kpis.custo_total)}
          trend={`${formatMoney(kpis.custo_medio)} por AIH`}
        />
        <KpiCard
          label="Permanência média"
          value={`${formatNumber(kpis.permanencia_media, { maximumFractionDigits: 1 })} dias`}
          trend="indicador hospitalar"
        />
      </div>

      <div className={PANELS_GRID}>
        <EvolutionChart figure={data.fig_evolucao} />
        <ComplicationsRanking figure={data.fig_complicacoes} total={kpis.total_aihs} />
      </div>

      <div className={BOTTOM_GRID}>
        <SummaryCard
          title="Permanência"
          rows={[
            {
              label: "Média",
              value: `${formatNumber(kpis.permanencia_media, { maximumFractionDigits: 2 })} dias`,
            },
            { label: "Indicador", value: "Hospitalar" },
          ]}
        />
        <SummaryCard
          title="Mortalidade"
          rows={[
            { label: "Óbitos", value: formatNumber(kpis.obitos) },
            { label: "Análise", value: "Por território", to: "/mortalidade" },
          ]}
        />
        <SummaryCard
          title="Custo"
          rows={[
            { label: "Médio / AIH", value: formatMoney(kpis.custo_medio) },
            { label: "Análise", value: "Por período", to: "/economico" },
          ]}
        />
      </div>
    </>
  );
}
