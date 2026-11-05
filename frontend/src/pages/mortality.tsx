import { ChartCard } from "@/components/chart-card";
import { Conclusion, joinPt } from "@/components/conclusion";
import { DataTable, ShareBar, type Column } from "@/components/data-table";
import type { ChartInfo } from "@/components/info-popover";
import { KpiCard } from "@/components/kpi-card";
import { GRID, PageState } from "@/components/page-state";
import { useFilteredApi } from "@/hooks/use-api";
import type { MortalityResponse } from "@/types/api";
import { formatNumber, formatPercent } from "@/utils/format";
import { maxBy, points } from "@/utils/stats";

function tableInfo(data: MortalityResponse): ChartInfo {
  const top = data.procedimentos[0];
  const deadliest = maxBy(
    data.procedimentos.filter((p) => p.aihs >= 30),
    (p) => p.letalidade ?? 0,
  );
  const amputations = data.procedimentos.filter((p) => /AMPUTACAO|PE DIABETICO/.test(p.solicitado)).reduce((n, p) => n + p.obitos, 0);
  return {
    how: "Para cada procedimento solicitado na AIH: quantos pacientes morreram, em quantas internações e a letalidade (óbitos ÷ AIHs). A última coluna mostra o procedimento efetivamente realizado mais comum nesses óbitos.",
    insights: [
      top && (
        <>
          <strong>{top.solicitado.toLowerCase()}</strong> reúne {formatPercent(top.obitos / (data.kpis.obitos || 1))} dos óbitos.
        </>
      ),
      amputations > 0 && (
        <>
          Amputações e pé diabético somam {formatNumber(amputations)} óbitos ({formatPercent(amputations / (data.kpis.obitos || 1))}).
        </>
      ),
      deadliest && (
        <>
          Maior letalidade (entre procedimentos com 30+ AIHs): <strong>{deadliest.solicitado.toLowerCase()}</strong>, com{" "}
          {formatPercent(deadliest.letalidade)}.
        </>
      ),
    ].filter(Boolean),
    caveat: "O procedimento registrado não é necessariamente a causa do óbito, apenas o que consta na internação.",
  };
}

function lethalityInfo(data: MortalityResponse): ChartInfo {
  const bars = points(data.fig_letalidade_complicacao.data[0]);
  const top = maxBy(bars, (b) => b.y);
  const none = bars.find((b) => b.x.startsWith("Sem complicação"));
  return {
    how: "Percentual das internações de cada tipo de complicação grave que terminaram em óbito, comparado às internações sem complicação grave (cinza).",
    insights: [
      top && (
        <>
          <strong>{top.x}</strong> tem a maior letalidade: {formatPercent(top.y / 100)}.
        </>
      ),
      top && none && none.y > 0 && top !== none && (
        <>
          Isso é {formatNumber(top.y / none.y, { maximumFractionDigits: 1 })}x a letalidade das internações sem complicação grave ({formatPercent(none.y / 100)}).
        </>
      ),
    ].filter(Boolean),
  };
}

type Row = MortalityResponse["procedimentos"][number];

function columns(maxObitos: number): Column<Row>[] {
  return [
    { key: "solicitado", header: "Procedimento solicitado", render: (r) => r.solicitado, sortValue: (r) => r.solicitado, className: "min-w-64" },
    {
      key: "obitos",
      header: "Óbitos",
      align: "right",
      render: (r) => <ShareBar value={formatNumber(r.obitos)} fraction={r.obitos / maxObitos} color="var(--color-coral)" />,
      sortValue: (r) => r.obitos,
    },
    { key: "aihs", header: "AIHs", align: "right", render: (r) => formatNumber(r.aihs), sortValue: (r) => r.aihs },
    { key: "letalidade", header: "Letalidade", align: "right", render: (r) => formatPercent(r.letalidade), sortValue: (r) => r.letalidade },
    {
      key: "realizado",
      header: "Procedimento realizado nos óbitos (mais frequente)",
      render: (r) => (
        <span className="text-muted">
          {r.realizado} <span className="text-faint">({formatNumber(r.obitos_realizado)})</span>
        </span>
      ),
      sortValue: (r) => r.realizado,
      className: "min-w-64",
    },
  ];
}

function conclusion(data: MortalityResponse) {
  const { kpis, procedimentos } = data;
  const top3 = procedimentos.slice(0, 3);
  const amputations = procedimentos.filter((p) => /AMPUTACAO|PE DIABETICO/.test(p.solicitado)).reduce((n, p) => n + p.obitos, 0);
  const bars = points(data.fig_letalidade_complicacao.data[0]);
  const deadliest = maxBy(bars, (b) => b.y);
  return {
    lead: (
      <>
        Foram <strong>{formatNumber(kpis.obitos)} óbitos por diabetes</strong>, uma letalidade hospitalar de{" "}
        {formatPercent(kpis.letalidade, 2)}. Quem morreu tinha em média {formatNumber(kpis.idade_obitos, { maximumFractionDigits: 1 })} anos
        (contra {formatNumber(kpis.idade_media, { maximumFractionDigits: 1 })} no geral) e ficou{" "}
        {formatNumber(kpis.permanencia_obitos, { maximumFractionDigits: 1 })} dias internado (contra{" "}
        {formatNumber(kpis.permanencia_media, { maximumFractionDigits: 1 })}).
      </>
    ),
    points: [
      top3.length > 0 && (
        <>
          Os procedimentos com mais óbitos foram{" "}
          {joinPt(top3.map((p) => <><strong>{p.solicitado.toLowerCase()}</strong> ({formatNumber(p.obitos)})</>))}.
        </>
      ),
      amputations > 0 && (
        <>
          Amputações e pé diabético somaram {formatNumber(amputations)} óbitos ({formatPercent(amputations / (kpis.obitos || 1))} do total).
        </>
      ),
      deadliest && (
        <>
          A complicação mais letal foi <strong>{deadliest.x}</strong>, com {formatPercent(deadliest.y / 100)} das internações terminando em óbito.
        </>
      ),
    ].filter(Boolean),
  };
}

/** Página 8 — Mortalidade por diabetes: procedimentos e desfechos. */
export default function Mortality() {
  const state = useFilteredApi<MortalityResponse>("/mortality/");

  return (
    <PageState {...state} isEmpty={(d) => d.kpis.aihs === 0}>
      {({ kpis, ...data }) => (
        <>
          <div className={GRID.kpis}>
            <KpiCard label="Óbitos por diabetes" value={formatNumber(kpis.obitos)} />
            <KpiCard label="Letalidade hospitalar" value={formatPercent(kpis.letalidade, 2)} trend="óbitos / AIHs" />
            <KpiCard
              label="Idade média nos óbitos"
              value={`${formatNumber(kpis.idade_obitos, { maximumFractionDigits: 1 })} anos`}
              trend={`${formatNumber(kpis.idade_media, { maximumFractionDigits: 1 })} anos no geral`}
            />
            <KpiCard
              label="Permanência nos óbitos"
              value={`${formatNumber(kpis.permanencia_obitos, { maximumFractionDigits: 1 })} dias`}
              trend={`${formatNumber(kpis.permanencia_media, { maximumFractionDigits: 1 })} dias no geral`}
            />
          </div>

          <div className={GRID.full}>
            <DataTable
              title="Procedimentos e desfechos"
              description="Óbitos por procedimento solicitado na AIH. O procedimento registrado não é necessariamente a causa do óbito."
              rows={data.procedimentos}
              columns={columns(Math.max(1, ...data.procedimentos.map((p) => p.obitos)))}
              searchText={(r) => `${r.solicitado} ${r.realizado}`}
              searchPlaceholder="Buscar procedimento"
              initialSort={{ key: "obitos", desc: true }}
              maxHeight={480}
              info={tableInfo({ kpis, ...data })}
            />
          </div>

          <div className={GRID.full}>
            <ChartCard
              title="Letalidade por tipo de complicação"
              description="% das AIHs que terminaram em óbito; em vermelho as complicações graves"
              figure={data.fig_letalidade_complicacao}
              layout={{ xaxis: { showgrid: false } }}
              height={260}
              info={lethalityInfo({ kpis, ...data })}
            />
          </div>
          <Conclusion {...conclusion({ kpis, ...data })} />
        </>
      )}
    </PageState>
  );
}
