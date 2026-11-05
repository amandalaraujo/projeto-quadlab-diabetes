import { ChartCard } from "@/components/chart-card";
import { Conclusion, joinPt } from "@/components/conclusion";
import { DataTable, ShareBar, type Column } from "@/components/data-table";
import type { ChartInfo } from "@/components/info-popover";
import { KpiCard } from "@/components/kpi-card";
import { GRID, PageState } from "@/components/page-state";
import { useFilteredApi } from "@/hooks/use-api";
import type { TerritoryResponse } from "@/types/api";
import { formatMoney, formatNumber, formatPercent } from "@/utils/format";
import { maxBy, minBy, points, sum } from "@/utils/stats";

type Row = TerritoryResponse["municipios"][number];

const COLUMNS: Column<Row>[] = [
  { key: "municipio", header: "Município de residência", render: (r) => `${r.municipio} · ${r.uf}`, sortValue: (r) => r.municipio },
  { key: "aihs", header: "AIHs", align: "right", render: (r) => formatNumber(r.aihs), sortValue: (r) => r.aihs },
  {
    key: "pct_aihs",
    header: "% AIHs",
    align: "right",
    render: (r) => <ShareBar value={formatPercent(r.pct_aihs, 2)} fraction={(r.pct_aihs ?? 0) * 4} />,
    sortValue: (r) => r.pct_aihs,
  },
  { key: "custo", header: "Custo", align: "right", render: (r) => formatMoney(r.custo, { compact: true }), sortValue: (r) => r.custo },
  {
    key: "pct_custo",
    header: "% Custo",
    align: "right",
    render: (r) => (
      <ShareBar value={formatPercent(r.pct_custo, 2)} fraction={(r.pct_custo ?? 0) * 4} color="var(--color-amber)" />
    ),
    sortValue: (r) => r.pct_custo,
  },
  { key: "custo_medio", header: "Custo / AIH", align: "right", render: (r) => formatMoney(r.custo_medio), sortValue: (r) => r.custo_medio },
];

function mapInfo(data: TerritoryResponse): ChartInfo {
  const rows = data.municipios;
  const top = rows[0];
  const top5 = sum(rows.slice(0, 5).map((r) => r.pct_aihs ?? 0));
  return {
    how: "Cada bolha é um município de residência dos pacientes; a área é proporcional ao número de AIHs. Use a busca para localizar uma cidade.",
    insights: [
      top && (
        <>
          <strong>{top.municipio}</strong> concentra {formatPercent(top.pct_aihs)} das internações do recorte.
        </>
      ),
      <>
        Os 5 maiores municípios somam {formatPercent(top5)} das AIHs, espalhadas por {formatNumber(rows.length)} municípios.
      </>,
    ].filter(Boolean),
    caveat: "Volume alto costuma acompanhar população grande; compare taxas antes de apontar um município como problema.",
  };
}

function costInfo(data: TerritoryResponse): ChartInfo {
  const series = points(data.fig_custo_periodo.data[0]);
  const max = maxBy(series, (p) => p.y);
  const min = minBy(series, (p) => p.y);
  return {
    how: "Custo médio de uma internação (valor total da AIH ÷ número de AIHs) em cada competência.",
    insights:
      max && min && series.length > 1
        ? [
            <>
              O custo por AIH variou de <strong>{formatMoney(min.y)}</strong> ({min.x}) a <strong>{formatMoney(max.y)}</strong> ({max.x}),
              uma diferença de {formatPercent(max.y / min.y - 1, 0)}.
            </>,
            <>Média do período: {formatMoney(data.kpis.custo_medio)} por internação.</>,
          ]
        : [<>Custo médio de {formatMoney(data.kpis.custo_medio)} por internação.</>],
    caveat: "Meses com poucas AIHs oscilam mais: uma única internação cara pesa muito na média.",
  };
}

function tableInfo(data: TerritoryResponse): ChartInfo {
  const relevant = data.municipios.filter((r) => (r.pct_aihs ?? 0) >= 0.01);
  const pricier = maxBy(relevant, (r) => (r.pct_custo ?? 0) - (r.pct_aihs ?? 0));
  const cheaper = minBy(relevant, (r) => (r.pct_custo ?? 0) - (r.pct_aihs ?? 0));
  return {
    how: "Compare as colunas % AIHs e % Custo: quando o peso no custo é maior que no volume, as internações daquele município são, em média, mais caras.",
    insights: [
      pricier && (pricier.pct_custo ?? 0) > (pricier.pct_aihs ?? 0) && (
        <>
          <strong>{pricier.municipio}</strong> tem {formatPercent(pricier.pct_aihs)} das AIHs, mas {formatPercent(pricier.pct_custo)} do custo
          ({formatMoney(pricier.custo_medio)} por AIH).
        </>
      ),
      cheaper && cheaper !== pricier && (cheaper.pct_custo ?? 0) < (cheaper.pct_aihs ?? 0) && (
        <>
          Já <strong>{cheaper.municipio}</strong> pesa menos no custo ({formatPercent(cheaper.pct_custo)}) do que no volume (
          {formatPercent(cheaper.pct_aihs)}).
        </>
      ),
    ].filter(Boolean),
    caveat: "Considera municípios com pelo menos 1% das AIHs do recorte.",
  };
}

function conclusion(data: TerritoryResponse) {
  const { kpis, municipios } = data;
  const top5 = municipios.slice(0, 5);
  const series = points(data.fig_custo_periodo.data[0]);
  const max = maxBy(series, (p) => p.y);
  const min = minBy(series, (p) => p.y);
  const relevant = municipios.filter((r) => (r.pct_aihs ?? 0) >= 0.01);
  const pricier = maxBy(relevant, (r) => (r.pct_custo ?? 0) - (r.pct_aihs ?? 0));
  return {
    lead: (
      <>
        O panorama identificou <strong>{formatNumber(kpis.aihs)} internações por diabetes</strong>, com custo total de{" "}
        <strong>{formatMoney(kpis.custo_total)}</strong> — em média {formatMoney(kpis.custo_medio)} por internação.
      </>
    ),
    points: [
      <>
        Os {top5.length} municípios de residência com maior participação foram{" "}
        {joinPt(top5.map((r) => <><strong>{r.municipio}</strong> ({formatPercent(r.pct_aihs)})</>))}; juntos, somam{" "}
        {formatPercent(sum(top5.map((r) => r.pct_aihs ?? 0)))} das AIHs e {formatPercent(sum(top5.map((r) => r.pct_custo ?? 0)))} do custo.
      </>,
      pricier && (pricier.pct_custo ?? 0) > (pricier.pct_aihs ?? 0) && (
        <>
          <strong>{pricier.municipio}</strong> pesa mais no custo ({formatPercent(pricier.pct_custo)}) do que no volume (
          {formatPercent(pricier.pct_aihs)}), com {formatMoney(pricier.custo_medio)} por internação.
        </>
      ),
      max && min && series.length > 1 && (
        <>
          O custo por AIH foi maior em <strong>{max.x}</strong> ({formatMoney(max.y)}) e menor em {min.x} ({formatMoney(min.y)}).
        </>
      ),
      <>Os pacientes internados residiam em {formatNumber(municipios.length)} municípios diferentes.</>,
    ].filter(Boolean),
  };
}

/** Página 1 — Distribuição territorial e impacto econômico. */
export default function Territory() {
  const state = useFilteredApi<TerritoryResponse>("/territory/");

  return (
    <PageState {...state} isEmpty={(d) => d.kpis.aihs === 0}>
      {(data) => (
        <>
          <div className={GRID.kpis3}>
            <KpiCard label="Total de AIHs" value={formatNumber(data.kpis.aihs)} trend="internações por diabetes" />
            <KpiCard
              label="Custo total"
              value={formatMoney(data.kpis.custo_total, { compact: true })}
              fullValue={formatMoney(data.kpis.custo_total)}
              trend="valor total das AIHs"
            />
            <KpiCard label="Custo por AIH" value={formatMoney(data.kpis.custo_medio)} trend="média por internação" />
          </div>

          <div className={GRID.wideLeft}>
            <ChartCard
              title="Localização residencial das internações"
              description="AIHs por município de residência do paciente (área da bolha = volume)"
              figure={data.fig_mapa}
              height={460}
              info={mapInfo(data)}
            />
            <ChartCard
              title="Custo por AIH por período"
              description="Valor médio por internação em cada competência (R$)"
              figure={data.fig_custo_periodo}
              layout={{ xaxis: { showgrid: false } }}
              height={460}
              info={costInfo(data)}
            />
          </div>

          <div className={GRID.full}>
            <DataTable
              title="Participação por município"
              description="Peso de cada município de residência no volume de AIHs e no custo total"
              rows={data.municipios}
              columns={COLUMNS}
              searchText={(r) => `${r.municipio} ${r.uf}`}
              searchPlaceholder="Buscar município"
              initialSort={{ key: "aihs", desc: true }}
              info={tableInfo(data)}
            />
          </div>
          <Conclusion {...conclusion(data)} />
        </>
      )}
    </PageState>
  );
}
