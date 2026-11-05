import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Conclusion, joinPt } from "@/components/conclusion";
import { ChartCard } from "@/components/chart-card";
import { InfoPopover, type ChartInfo } from "@/components/info-popover";
import { KpiCard } from "@/components/kpi-card";
import { GRID, PageState } from "@/components/page-state";
import { useFilteredApi } from "@/hooks/use-api";
import type { CriticalityResponse } from "@/types/api";
import { formatMoney, formatNumber, formatPercent } from "@/utils/format";
import { maxBy, minBy, points } from "@/utils/stats";

type Point = { x: string; y: number; name: string };

/** Barras por categoria CID com o nome completo (customdata) junto. */
const categoryPoints = (data: CriticalityResponse["fig_categorias"]): Point[] =>
  points(data.data[0]).map((p, i) => ({ ...p, name: String((data.data[0].customdata as string[] | undefined)?.[i] ?? p.x) }));

function categoriesInfo(data: CriticalityResponse): ChartInfo {
  const cats = categoryPoints(data.fig_categorias);
  const top = maxBy(cats, (c) => c.y);
  return {
    how: "AIHs por categoria CID-10 do diagnóstico principal: E10 (insulino-dependente), E11 (não insulino-dependente), E12 (relacionado à desnutrição), E13 (outros tipos) e E14 (não especificado).",
    insights: [
      top && (
        <>
          <strong>{top.x}</strong> responde por {formatPercent(top.y / (data.kpis.aihs || 1))} das internações ({top.name.slice(4)}).
        </>
      ),
      cats.find((c) => c.x === "E14") && (
        <>
          E14 (diabetes não especificado) soma {formatPercent((cats.find((c) => c.x === "E14")?.y ?? 0) / (data.kpis.aihs || 1))}: indica quanto do
          registro não detalha o tipo de diabetes.
        </>
      ),
    ].filter(Boolean),
  };
}

function costInfo(data: CriticalityResponse): ChartInfo {
  const cats = categoryPoints(data.fig_custo_categoria);
  const max = maxBy(cats, (c) => c.y);
  const min = minBy(cats, (c) => c.y);
  return {
    how: "Custo médio de uma internação em cada categoria CID-10.",
    insights:
      max && min && max !== min
        ? [
            <>
              Uma internação por <strong>{max.x}</strong> custa em média {formatMoney(max.y)}, {formatPercent(max.y / min.y - 1, 0)} a mais
              que por {min.x} ({formatMoney(min.y)}).
            </>,
          ]
        : [],
    caveat: "Categorias com poucas AIHs (como E12) têm média instável.",
  };
}

function flowInfo(data: CriticalityResponse): ChartInfo {
  return {
    how: "Duas camadas: em verde, onde os pacientes moram; em roxo, onde foram internados. Clique na legenda para ver uma de cada vez e use a busca para achar uma cidade.",
    insights: [
      <>
        <strong>{formatPercent(data.kpis.pct_fora_do_municipio)}</strong> das internações ({formatNumber(data.kpis.fora_do_municipio)}) aconteceram fora do
        município de residência do paciente.
      </>,
      <>Bolhas roxas maiores que as verdes no mesmo lugar indicam polos que recebem pacientes de outras cidades.</>,
    ],
  };
}

function matrixInfo(data: CriticalityResponse): ChartInfo {
  return {
    how: "Cada ponto é um município de atendimento: mais à direita, mais AIHs (escala log); mais acima, maior % de casos graves. O tamanho é o número de óbitos e a cor, a letalidade. As linhas tracejadas são as medianas.",
    insights: [
      <>
        Mediana de {formatNumber(data.corte.aihs)} AIHs e de {formatPercent(data.corte.pct_graves)} de casos graves entre os municípios com{" "}
        {data.corte.min_aihs}+ AIHs.
      </>,
      data.criticos[0] && (
        <>
          O quadrante superior direito (alto volume e alta gravidade) é liderado por <strong>{data.criticos[0].municipio}</strong>.
        </>
      ),
    ].filter(Boolean),
    caveat: "Municípios com menos de 30 AIHs ficam de fora para não distorcer os percentuais.",
  };
}

function CriticalList({ data }: { data: CriticalityResponse }) {
  const { corte, criticos } = data;
  return (
    <Card className="flex min-w-0 flex-col">
      <CardHeader>
        <div>
          <CardTitle>Municípios críticos</CardTitle>
          <CardDescription>
            Acima da mediana em volume ({formatNumber(corte.aihs)} AIHs) e em gravidade (
            {formatPercent(corte.pct_graves)} graves)
          </CardDescription>
        </div>
        <InfoPopover
          title="Municípios críticos"
          info={{
            how: "Municípios do quadrante superior direito da matriz, ordenados pelo número de casos graves.",
            insights: criticos[0]
              ? [
                  <>
                    <strong>{criticos[0].municipio}</strong> lidera, com {formatNumber(criticos[0].aihs)} AIHs, {formatPercent(criticos[0].pct_graves)} graves e
                    letalidade de {formatPercent(criticos[0].letalidade)}.
                  </>,
                ]
              : [],
            caveat: "São candidatos a investigação, não um ranking de qualidade: polos de referência naturalmente recebem casos mais graves.",
          }}
        />
      </CardHeader>
      <CardContent className="flex-1">
        {criticos.length === 0 && <p className="py-6 text-center text-xs text-faint">Nenhum município no quadrante.</p>}
        <ol className="space-y-2.5">
          {criticos.map((m, i) => (
            <li key={m.municipio} className="flex items-center gap-3 text-xs">
              <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-coral-soft text-[10px] font-extrabold text-coral">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">{m.municipio}</span>
              <span className="text-right text-muted tabular-nums">
                {formatNumber(m.aihs)} AIHs · <strong className="text-ink">{formatPercent(m.pct_graves)}</strong> graves ·{" "}
                {formatNumber(m.obitos)} óbitos
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function conclusion(data: CriticalityResponse) {
  const { kpis } = data;
  const cats = categoryPoints(data.fig_categorias);
  const top = maxBy(cats, (c) => c.y);
  const costs = categoryPoints(data.fig_custo_categoria);
  const pricey = maxBy(costs, (c) => c.y);
  const cheap = minBy(costs, (c) => c.y);
  const critical = data.criticos.slice(0, 5);
  return {
    lead: (
      <>
        <strong>{formatPercent(kpis.pct_fora_do_municipio)} das internações</strong> ({formatNumber(kpis.fora_do_municipio)} de{" "}
        {formatNumber(kpis.aihs)}) aconteceram fora do município de residência do paciente, o que indica deslocamento em busca de atendimento.
      </>
    ),
    points: [
      top && (
        <>
          <strong>{top.x}</strong> foi o tipo de diabetes predominante, com {formatPercent(top.y / (kpis.aihs || 1))} das internações.
        </>
      ),
      pricey && cheap && pricey !== cheap && (
        <>
          A internação mais cara em média foi a de <strong>{pricey.x}</strong> ({formatMoney(pricey.y)}),{" "}
          {formatPercent(pricey.y / cheap.y - 1, 0)} acima da de {cheap.x} ({formatMoney(cheap.y)}).
        </>
      ),
      critical.length > 0 && (
        <>
          Os municípios mais críticos (alto volume e alta gravidade) foram {joinPt(critical.map((m) => <strong>{m.municipio}</strong>))}.
        </>
      ),
      <>
        A mediana entre os municípios de atendimento foi de {formatNumber(data.corte.aihs)} AIHs e {formatPercent(data.corte.pct_graves)} de casos
        graves.
      </>,
    ].filter(Boolean),
  };
}

/** Página 3 — Dispersão territorial e municípios críticos. */
export default function Criticality() {
  const state = useFilteredApi<CriticalityResponse>("/criticality/");

  return (
    <PageState {...state} isEmpty={(d) => d.kpis.aihs === 0}>
      {(data) => (
        <>
          <div className={GRID.kpis3}>
            <KpiCard label="AIHs diabetes" value={formatNumber(data.kpis.aihs)} />
            <KpiCard label="Custo por AIH diabética" value={formatMoney(data.kpis.custo_medio)} />
            <KpiCard
              label="Internados fora do município"
              value={formatPercent(data.kpis.pct_fora_do_municipio)}
              trend={`${formatNumber(data.kpis.fora_do_municipio)} AIHs com deslocamento`}
            />
          </div>

          <div className={GRID.two}>
            <ChartCard
              title="AIHs por tipo de diabetes"
              description="Volume por categoria CID-10 (E10–E14)"
              figure={data.fig_categorias}
              layout={{ xaxis: { showgrid: false } }}
              height={260}
              info={categoriesInfo(data)}
            />
            <ChartCard
              title="Custo por AIH por tipo de diabetes"
              description="Valor médio por internação em cada categoria CID-10"
              figure={data.fig_custo_categoria}
              layout={{ xaxis: { showgrid: false } }}
              height={260}
              info={costInfo(data)}
            />
          </div>

          <div className={GRID.two}>
            <ChartCard
              title="Residência x local de internação"
              description="Onde os pacientes moram e onde foram internados — clique na legenda para comparar"
              figure={data.fig_fluxo}
              height={480}
              info={flowInfo(data)}
            />
            <ChartCard
              title="Matriz de criticidade"
              description={`Municípios de atendimento com ${data.corte.min_aihs}+ AIHs: volume (escala log) x % graves; bolha = óbitos, cor = letalidade. Linhas tracejadas nas medianas.`}
              figure={data.fig_criticidade}
              height={480}
              info={matrixInfo(data)}
            />
          </div>

          <div className={GRID.full}>
            <CriticalList data={data} />
          </div>
          <Conclusion {...conclusion(data)} />
        </>
      )}
    </PageState>
  );
}
