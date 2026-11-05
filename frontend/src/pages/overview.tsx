import { ChartCard } from "@/components/chart-card";
import { Conclusion, joinPt } from "@/components/conclusion";
import { DataTable, ShareBar, type Column } from "@/components/data-table";
import type { ChartInfo } from "@/components/info-popover";
import { KpiCard } from "@/components/kpi-card";
import { GRID, PageState } from "@/components/page-state";
import { useFilteredApi } from "@/hooks/use-api";
import type { OverviewResponse } from "@/types/api";
import { formatMoney, formatNumber, formatPercent } from "@/utils/format";
import { maxBy, minBy, points, sum } from "@/utils/stats";

type Row = OverviewResponse["municipios"][number];

const COLUMNS: Column<Row>[] = [
  { key: "municipio", header: "Município de atendimento", render: (r) => `${r.municipio} · ${r.uf}`, sortValue: (r) => r.municipio },
  { key: "aihs", header: "AIHs diabetes", align: "right", render: (r) => formatNumber(r.aihs), sortValue: (r) => r.aihs },
  {
    key: "pct_graves",
    header: "% Graves",
    align: "right",
    render: (r) => <ShareBar value={formatPercent(r.pct_graves)} fraction={r.pct_graves ?? 0} color="var(--color-blue)" />,
    sortValue: (r) => r.pct_graves,
  },
  { key: "obitos", header: "Óbitos", align: "right", render: (r) => formatNumber(r.obitos), sortValue: (r) => r.obitos },
  { key: "custo_medio", header: "Custo / AIH", align: "right", render: (r) => formatMoney(r.custo_medio), sortValue: (r) => r.custo_medio },
];

function evolutionInfo(data: OverviewResponse): ChartInfo {
  const [aihs, graves, obitos] = data.fig_evolucao.data.map(points);
  const peak = maxBy(aihs ?? [], (p) => p.y);
  const low = minBy(aihs ?? [], (p) => p.y);
  const shares = (aihs ?? []).map((p, i) => ({ x: p.x, share: p.y ? (graves?.[i]?.y ?? 0) / p.y : 0 }));
  const worst = maxBy(shares, (s) => s.share);
  const deaths = maxBy(obitos ?? [], (p) => p.y);
  return {
    how: "Linhas mensais de AIHs por diabetes, AIHs graves (coma, cetoacidose ou amputação) e óbitos. Os óbitos usam o eixo da direita, por serem bem menos numerosos.",
    insights: [
      peak && low && (aihs?.length ?? 0) > 1 && (
        <>
          O volume foi de {formatNumber(low.y)} AIHs ({low.x}) a {formatNumber(peak.y)} ({peak.x}).
        </>
      ),
      worst && (
        <>
          A maior proporção de casos graves foi em <strong>{worst.x}</strong> ({formatPercent(worst.share)}); no período todo,{" "}
          {formatPercent(data.kpis.pct_graves)}.
        </>
      ),
      deaths && deaths.y > 0 && (
        <>
          Pico de óbitos em {deaths.x}, com {formatNumber(deaths.y)}.
        </>
      ),
    ].filter(Boolean),
    caveat: "Com poucos casos por mês (filtros muito restritos), as linhas oscilam por acaso; olhe a tendência, não um mês isolado.",
  };
}

function mapInfo(data: OverviewResponse): ChartInfo {
  const rows = data.municipios;
  const top = rows[0];
  const top5 = sum(rows.slice(0, 5).map((r) => r.aihs)) / (data.kpis.aihs || 1);
  return {
    how: "Cada bolha é um município onde houve internação (o hospital, não a casa do paciente). Bolhas grandes indicam polos de atendimento.",
    insights: [
      top && (
        <>
          <strong>{top.municipio}</strong> atendeu {formatPercent(top.aihs / (data.kpis.aihs || 1))} das internações do recorte.
        </>
      ),
      <>
        Os 5 principais polos concentram {formatPercent(top5)} dos atendimentos, em {formatNumber(rows.length)} municípios com internação.
      </>,
    ].filter(Boolean),
  };
}

function tableInfo(data: OverviewResponse): ChartInfo {
  const relevant = data.municipios.filter((r) => r.aihs >= 100);
  const severe = maxBy(relevant, (r) => r.pct_graves ?? 0);
  const mild = minBy(relevant, (r) => r.pct_graves ?? 0);
  return {
    how: "Volume, gravidade e óbitos por município de atendimento. Ordene pelas colunas para comparar os polos.",
    insights: [
      severe && (
        <>
          Entre os polos com 100+ AIHs, <strong>{severe.municipio}</strong> tem a maior proporção de casos graves (
          {formatPercent(severe.pct_graves)}), contra {formatPercent(data.kpis.pct_graves)} no geral.
        </>
      ),
      mild && mild !== severe && (
        <>
          A menor é em <strong>{mild.municipio}</strong> ({formatPercent(mild.pct_graves)}).
        </>
      ),
    ].filter(Boolean),
    caveat: "Hospitais de referência recebem casos mais graves de outras cidades; % de graves alto não significa pior atendimento.",
  };
}

function conclusion(data: OverviewResponse) {
  const { kpis, municipios } = data;
  const [aihs, graves] = data.fig_evolucao.data.map(points);
  const peak = maxBy(aihs ?? [], (p) => p.y);
  const shares = (aihs ?? []).map((p, i) => ({ x: p.x, share: p.y ? (graves?.[i]?.y ?? 0) / p.y : 0 }));
  const worst = maxBy(shares, (s) => s.share);
  const top5 = municipios.slice(0, 5);
  const severe = maxBy(
    municipios.filter((r) => r.aihs >= 100),
    (r) => r.pct_graves ?? 0,
  );
  return {
    lead: (
      <>
        Foram <strong>{formatNumber(kpis.aihs)} internações por diabetes</strong>, das quais {formatNumber(kpis.graves)} (
        {formatPercent(kpis.pct_graves)}) foram graves e <strong>{formatNumber(kpis.obitos)} terminaram em óbito</strong> (letalidade de{" "}
        {formatPercent(kpis.letalidade, 2)}). A permanência média foi de {formatNumber(kpis.permanencia_media, { maximumFractionDigits: 1 })} dias,
        com custo total de {formatMoney(kpis.custo_total)}.
      </>
    ),
    points: [
      <>
        Os {top5.length} principais polos de atendimento foram {joinPt(top5.map((r) => <strong>{r.municipio}</strong>))}, que concentraram{" "}
        {formatPercent(sum(top5.map((r) => r.aihs)) / (kpis.aihs || 1))} das internações.
      </>,
      peak && (
        <>
          O mês de maior volume foi <strong>{peak.x}</strong>, com {formatNumber(peak.y)} AIHs.
        </>
      ),
      worst && (
        <>
          A gravidade foi maior em <strong>{worst.x}</strong>: {formatPercent(worst.share)} das internações do mês foram graves.
        </>
      ),
      severe && (
        <>
          Entre os polos com 100+ AIHs, <strong>{severe.municipio}</strong> teve a maior proporção de casos graves ({formatPercent(severe.pct_graves)}).
        </>
      ),
    ].filter(Boolean),
  };
}

/** Página 2 — Panorama epidemiológico do Diabetes Mellitus. */
export default function Overview() {
  const state = useFilteredApi<OverviewResponse>("/overview/");

  return (
    <PageState {...state} isEmpty={(d) => d.kpis.aihs === 0}>
      {({ kpis, ...data }) => (
        <>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 wide:grid-cols-6">
            <KpiCard label="AIHs diabetes" value={formatNumber(kpis.aihs)} />
            <KpiCard
              label="% Graves"
              value={formatPercent(kpis.pct_graves)}
              trend={`${formatNumber(kpis.graves)} AIHs`}
            />
            <KpiCard label="Óbitos" value={formatNumber(kpis.obitos)} trend={`letalidade ${formatPercent(kpis.letalidade, 2)}`} />
            <KpiCard
              label="Média de permanência"
              value={`${formatNumber(kpis.permanencia_media, { maximumFractionDigits: 2 })} dias`}
            />
            <KpiCard
              label="Custo total"
              value={formatMoney(kpis.custo_total, { compact: true })}
              fullValue={formatMoney(kpis.custo_total)}
            />
            <KpiCard label="Custo por AIH" value={formatMoney(kpis.custo_medio)} />
          </div>

          <div className={GRID.full}>
            <ChartCard
              title="Evolução de casos e severidade"
              description="AIHs por diabetes, AIHs graves (coma, cetoacidose, amputação) e óbitos (eixo à direita) por competência"
              figure={data.fig_evolucao}
              layout={{ xaxis: { showgrid: false } }}
              height={300}
              info={evolutionInfo({ kpis, ...data })}
            />
          </div>

          <div className={GRID.two}>
            <ChartCard
              title="Polos de atendimento"
              description="AIHs por município onde a internação ocorreu"
              figure={data.fig_mapa}
              height={440}
              info={mapInfo({ kpis, ...data })}
            />
            <DataTable
              title="AIHs por município de atendimento"
              description="Volume, gravidade e desfecho em cada polo"
              rows={data.municipios}
              columns={COLUMNS}
              searchText={(r) => `${r.municipio} ${r.uf}`}
              searchPlaceholder="Buscar município"
              initialSort={{ key: "aihs", desc: true }}
              maxHeight={400}
              info={tableInfo({ kpis, ...data })}
            />
          </div>
          <Conclusion {...conclusion({ kpis, ...data })} />
        </>
      )}
    </PageState>
  );
}
