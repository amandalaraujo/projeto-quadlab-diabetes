import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Conclusion, joinPt } from "@/components/conclusion";
import { ChartCard } from "@/components/chart-card";
import { InfoPopover, type ChartInfo } from "@/components/info-popover";
import { KpiCard } from "@/components/kpi-card";
import { GRID, PageState } from "@/components/page-state";
import { useFilteredApi } from "@/hooks/use-api";
import type { GeneralResponse } from "@/types/api";
import { formatCompact, formatNumber, formatPercent } from "@/utils/format";
import { minBy, points, sum } from "@/utils/stats";

function evolutionInfo(data: GeneralResponse): ChartInfo {
  const series = points(data.fig_evolucao.data[0]);
  const low = minBy(series, (p) => p.y);
  const { pico } = data.kpis;
  const mean = series.length ? sum(series.map((p) => p.y)) / series.length : 0;
  return {
    how: "Número de internações por competência (mês de processamento da AIH). A barra destacada é o mês de maior volume.",
    insights: [
      pico && low && series.length > 1 && (
        <>
          <strong>{pico.periodo}</strong> teve o maior volume ({formatNumber(pico.aihs)} AIHs), {formatPercent(pico.aihs / low.y - 1, 0)} acima do
          menor mês ({low.x}).
        </>
      ),
      series.length > 0 && <>Média de {formatNumber(mean, { maximumFractionDigits: 0 })} AIHs por mês.</>,
    ].filter(Boolean),
    caveat: "A competência é o mês em que a AIH foi processada, que pode ser posterior à data da internação.",
  };
}

function sexInfo(data: GeneralResponse): ChartInfo {
  const fem = data.kpis.sexo["Feminino"];
  const masc = data.kpis.sexo["Masculino"];
  const more = (masc?.aihs ?? 0) >= (fem?.aihs ?? 0) ? "masculino" : "feminino";
  return {
    how: "Participação de cada sexo no total de internações do recorte.",
    insights:
      fem && masc
        ? [
            <>
              O sexo <strong>{more}</strong> tem mais internações: {formatPercent(Math.max(fem.pct ?? 0, masc.pct ?? 0))} contra{" "}
              {formatPercent(Math.min(fem.pct ?? 0, masc.pct ?? 0))}.
            </>,
          ]
        : [<>O recorte atual tem apenas um sexo (filtro de gênero ativo).</>],
  };
}

function rankingInfo(data: GeneralResponse): ChartInfo {
  const rows = data.ranking_faixas;
  const top3 = sum(rows.slice(0, 3).map((r) => r.aihs)) / (data.kpis.aihs || 1);
  return {
    how: "As 10 faixas etárias (de 5 anos) com mais internações, da maior para a menor.",
    insights: rows[0]
      ? [
          <>
            <strong>{rows[0].faixa}</strong> lidera com {formatNumber(rows[0].aihs)} AIHs; as 3 primeiras faixas somam {formatPercent(top3)} do total.
          </>,
        ]
      : [],
    caveat: "Faixas mais populosas tendem a ter mais internações; sem a população de cada faixa não dá para comparar risco.",
  };
}

/** Top 10 faixas etárias em barras horizontais. */
function AgeRanking({ rows, info }: { rows: GeneralResponse["ranking_faixas"]; info: ChartInfo }) {
  const max = Math.max(1, ...rows.map((r) => r.aihs));
  return (
    <Card className="flex min-w-0 flex-col">
      <CardHeader>
        <div>
          <CardTitle>Ranking por faixa etária</CardTitle>
          <CardDescription>Top 10 faixas com maior volume de AIHs</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {rows[0] && (
            <span className="rounded-lg bg-blue-soft px-2.5 py-1.5 text-[11px] font-bold text-blue">
              {rows[0].faixa} · maior volume
            </span>
          )}
          <InfoPopover title="Ranking por faixa etária" info={info} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-2.5">
        {rows.map((r, i) => (
          <div key={r.faixa} className="flex items-center gap-3 text-xs">
            <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-canvas text-[10px] font-extrabold text-muted">
              {i + 1}
            </span>
            <span className="w-14 shrink-0 font-bold text-ink">{r.faixa}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#edf1f5]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${(r.aihs / max) * 100}%`, backgroundColor: i < 3 ? "#1e3a8a" : "#4f7cff" }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-semibold text-muted tabular-nums">{formatNumber(r.aihs)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function conclusion(data: GeneralResponse) {
  const { kpis, ranking_faixas: faixas } = data;
  const sexes = Object.entries(kpis.sexo).sort((a, b) => b[1].aihs - a[1].aihs);
  const top3 = faixas.slice(0, 3);
  return {
    lead: (
      <>
        O recorte reúne <strong>{formatNumber(kpis.aihs)} AIHs</strong>, uma média de{" "}
        {formatNumber(kpis.media_diaria, { maximumFractionDigits: 1 })} internações por dia
        {kpis.pico && (
          <>
            , com pico em <strong>{kpis.pico.periodo}</strong> ({formatNumber(kpis.pico.aihs)} AIHs)
          </>
        )}
        .
      </>
    ),
    points: [
      sexes.length > 1 && (
        <>
          O sexo <strong>{sexes[0][0].toLowerCase()}</strong> respondeu por {formatPercent(sexes[0][1].pct)} das internações, contra{" "}
          {formatPercent(sexes[1][1].pct)} do {sexes[1][0].toLowerCase()}.
        </>
      ),
      top3.length > 0 && (
        <>
          As faixas etárias que mais internaram foram {joinPt(top3.map((f) => <><strong>{f.faixa}</strong> ({formatNumber(f.aihs)})</>))}, somando{" "}
          {formatPercent(sum(top3.map((f) => f.aihs)) / (kpis.aihs || 1))} do total.
        </>
      ),
    ].filter(Boolean),
  };
}

/** Página 4 — Panorama geral das AIHs. */
export default function General() {
  const state = useFilteredApi<GeneralResponse>("/general/");

  return (
    <PageState {...state} isEmpty={(d) => d.kpis.aihs === 0}>
      {({ kpis, ...data }) => {
        const fem = kpis.sexo["Feminino"];
        const masc = kpis.sexo["Masculino"];
        return (
          <>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 wide:grid-cols-5">
              <KpiCard label="Total de AIHs" value={formatNumber(kpis.aihs)} trend="total de internações" />
              <KpiCard label="Feminino" value={formatNumber(fem?.aihs ?? 0)} trend={formatPercent(fem?.pct ?? 0, 2)} />
              <KpiCard label="Masculino" value={formatNumber(masc?.aihs ?? 0)} trend={formatPercent(masc?.pct ?? 0, 2)} />
              <KpiCard
                label="Média diária"
                value={formatNumber(kpis.media_diaria, { maximumFractionDigits: 1 })}
                trend="AIHs por dia"
              />
              <KpiCard
                label="Período de maior volume"
                value={kpis.pico?.periodo ?? "—"}
                trend={kpis.pico ? `${formatCompact(kpis.pico.aihs)} AIHs` : undefined}
              />
            </div>

            <div className={GRID.wideLeft}>
              <ChartCard
                title="Evolução das AIHs"
                description="Internações por competência; o mês de maior volume aparece destacado"
                figure={data.fig_evolucao}
                layout={{ xaxis: { showgrid: false } }}
                height={300}
                info={evolutionInfo({ kpis, ...data })}
              />
              <ChartCard
                title="Distribuição por sexo"
                description="Participação no total de AIHs"
                figure={data.fig_sexo}
                height={300}
                info={sexInfo({ kpis, ...data })}
              />
            </div>

            <div className={GRID.full}>
              <AgeRanking rows={data.ranking_faixas} info={rankingInfo({ kpis, ...data })} />
            </div>
            <Conclusion {...conclusion({ kpis, ...data })} />
          </>
        );
      }}
    </PageState>
  );
}
