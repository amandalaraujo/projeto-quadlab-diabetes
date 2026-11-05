import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Conclusion, joinPt } from "@/components/conclusion";
import { ChartCard } from "@/components/chart-card";
import { InfoPopover, type ChartInfo } from "@/components/info-popover";
import { KpiCard } from "@/components/kpi-card";
import { GRID, PageState } from "@/components/page-state";
import { useFilteredApi } from "@/hooks/use-api";
import type { DemographicResponse } from "@/types/api";
import { formatNumber, formatPercent } from "@/utils/format";
import { maxBy } from "@/utils/stats";

function pyramidInfo(data: DemographicResponse): ChartInfo {
  const [fem, masc] = data.fig_piramide.data;
  const faixas = ((fem?.y ?? masc?.y ?? []) as unknown as string[]).map((faixa, i) => ({
    faixa,
    fem: Math.abs(Number(fem?.x?.[i] ?? 0)),
    masc: Math.abs(Number(masc?.x?.[i] ?? 0)),
  }));
  const peak = maxBy(faixas, (f) => f.fem + f.masc);
  const femMajority = faixas.filter((f) => f.fem > f.masc && f.fem + f.masc >= 50).map((f) => f.faixa);
  return {
    how: "Pirâmide etária: à esquerda (vermelho) as internações femininas, à direita (azul) as masculinas, por faixa de 5 anos.",
    insights: [
      peak && (
        <>
          A faixa com mais internações é <strong>{peak.faixa}</strong> ({formatNumber(peak.fem + peak.masc)} AIHs).
        </>
      ),
      femMajority.length > 0 ? (
        <>Mulheres são maioria nas faixas {femMajority.join(", ")}.</>
      ) : (
        faixas.length > 0 && <>Homens são maioria em todas as faixas com volume relevante.</>
      ),
      data.kpis.idade_media != null && (
        <>Idade média de {formatNumber(data.kpis.idade_media, { maximumFractionDigits: 1 })} anos.</>
      ),
    ].filter(Boolean),
    caveat: "O padrão reflete também a composição da população atendida pelo SUS em cada faixa.",
  };
}

function sexInfo(data: DemographicResponse): ChartInfo {
  const fem = data.kpis.sexo["Feminino"];
  const masc = data.kpis.sexo["Masculino"];
  return {
    how: "% das AIHs de cada sexo que foram graves (coma, cetoacidose ou amputação) e número de óbitos, com a letalidade (óbitos ÷ AIHs).",
    insights:
      fem && masc
        ? [
            <>
              Casos graves: {formatPercent(fem.pct_graves)} entre mulheres e {formatPercent(masc.pct_graves)} entre homens.
            </>,
            <>
              Letalidade {(fem.letalidade ?? 0) > (masc.letalidade ?? 0) ? "maior entre mulheres" : "maior entre homens"} (
              {formatPercent(fem.letalidade, 2)} x {formatPercent(masc.letalidade, 2)}), mesmo{" "}
              {masc.obitos > fem.obitos ? "com mais óbitos absolutos entre homens" : "com mais óbitos absolutos entre mulheres"}.
            </>,
          ]
        : [<>O recorte atual tem apenas um sexo (filtro de gênero ativo).</>],
    caveat: "Diferenças de poucos pontos percentuais podem ser acaso quando há poucas AIHs no recorte.",
  };
}

function raceInfo(data: DemographicResponse): ChartInfo {
  const bars = (data.fig_obitos_raca.data[0]?.y ?? []).map((name, i) => ({
    name: String(name),
    obitos: Number(data.fig_obitos_raca.data[0]?.x?.[i] ?? 0),
  }));
  const top = maxBy(bars, (b) => b.obitos);
  return {
    how: "Óbitos por diabetes em cada grupo de raça/cor declarado na AIH, com a participação no total de óbitos.",
    insights: top
      ? [
          <>
            <strong>{top.name}</strong> concentra {formatPercent(top.obitos / (data.kpis.obitos || 1))} dos óbitos ({formatNumber(top.obitos)}).
          </>,
        ]
      : [],
    caveat: "Para falar em desigualdade, compare com a participação de cada grupo nas internações e na população (use o filtro Raça/Cor).",
  };
}

const SEX_COLORS: Record<string, string> = { Feminino: "#f04461", Masculino: "#4f7cff" };

type BySex = DemographicResponse["kpis"]["sexo"];

/** Comparação feminino x masculino: % de graves e óbitos (com letalidade). */
function SexComparison({ sexo, info }: { sexo: BySex; info: ChartInfo }) {
  const entries = Object.entries(sexo);
  const maxObitos = Math.max(1, ...entries.map(([, s]) => s.obitos));

  const rows = (value: (s: BySex[string]) => number, label: (s: BySex[string]) => string, max: number) =>
    entries.map(([name, s]) => (
      <div key={name} className="flex items-center gap-3 text-xs">
        <span className="w-20 shrink-0 font-bold text-ink">{name}</span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#edf1f5]">
          <div
            className="h-full rounded-full"
            style={{ width: `${(value(s) / max) * 100}%`, backgroundColor: SEX_COLORS[name] ?? "#98a2b3" }}
          />
        </div>
        <span className="w-28 shrink-0 text-right font-semibold text-muted tabular-nums">{label(s)}</span>
      </div>
    ));

  return (
    <Card className="flex min-w-0 flex-col">
      <CardHeader>
        <div>
          <CardTitle>Gravidade e óbitos por sexo</CardTitle>
          <CardDescription>% de AIHs graves e óbitos por diabetes em cada sexo</CardDescription>
        </div>
        <InfoPopover title="Gravidade e óbitos por sexo" info={info} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-[10px] font-extrabold tracking-[0.6px] text-faint uppercase">% Graves</h4>
          {rows((s) => s.pct_graves ?? 0, (s) => formatPercent(s.pct_graves), 1)}
        </div>
        <div className="space-y-3">
          <h4 className="text-[10px] font-extrabold tracking-[0.6px] text-faint uppercase">Óbitos</h4>
          {rows(
            (s) => s.obitos,
            (s) => `${formatNumber(s.obitos)} · ${formatPercent(s.letalidade, 2)}`,
            maxObitos,
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function conclusion(data: DemographicResponse) {
  const { kpis } = data;
  const [fem, masc] = data.fig_piramide.data;
  const faixas = ((fem?.y ?? masc?.y ?? []) as unknown as string[]).map((faixa, i) => ({
    faixa,
    total: Math.abs(Number(fem?.x?.[i] ?? 0)) + Math.abs(Number(masc?.x?.[i] ?? 0)),
  }));
  const peak = maxBy(faixas, (f) => f.total);
  const f = kpis.sexo["Feminino"];
  const m = kpis.sexo["Masculino"];
  const races = (data.fig_obitos_raca.data[0]?.y ?? [])
    .map((name, i) => ({ name: String(name), obitos: Number(data.fig_obitos_raca.data[0]?.x?.[i] ?? 0) }))
    .sort((a, b) => b.obitos - a.obitos)
    .slice(0, 3);
  return {
    lead: (
      <>
        Os pacientes tinham em média <strong>{formatNumber(kpis.idade_media, { maximumFractionDigits: 1 })} anos</strong> e ficaram{" "}
        {formatNumber(kpis.permanencia_media, { maximumFractionDigits: 1 })} dias internados; {formatPercent(kpis.pct_graves)} das internações foram
        graves e <strong>{formatNumber(kpis.obitos)} terminaram em óbito</strong>.
      </>
    ),
    points: [
      peak && (
        <>
          A faixa etária com mais internações foi <strong>{peak.faixa}</strong> ({formatNumber(peak.total)} AIHs).
        </>
      ),
      f && m && (
        <>
          Casos graves: {formatPercent(f.pct_graves)} entre mulheres e {formatPercent(m.pct_graves)} entre homens.
        </>
      ),
      f && m && (
        <>
          Óbitos: {formatNumber(f.obitos)} mulheres (letalidade {formatPercent(f.letalidade, 2)}) e {formatNumber(m.obitos)} homens (
          {formatPercent(m.letalidade, 2)}).
        </>
      ),
      races.length > 0 && (
        <>
          Por raça/cor, os óbitos se concentraram em{" "}
          {joinPt(races.map((r) => <><strong>{r.name}</strong> ({formatPercent(r.obitos / (kpis.obitos || 1))})</>))}.
        </>
      ),
    ].filter(Boolean),
  };
}

/** Página 5 — Perfil demográfico e mortalidade. */
export default function Demographic() {
  const state = useFilteredApi<DemographicResponse>("/demographic/");

  return (
    <PageState {...state} isEmpty={(d) => d.kpis.aihs === 0}>
      {({ kpis, ...data }) => (
        <>
          <div className={GRID.kpis}>
            <KpiCard label="Idade média" value={`${formatNumber(kpis.idade_media, { maximumFractionDigits: 1 })} anos`} />
            <KpiCard
              label="Média de permanência"
              value={`${formatNumber(kpis.permanencia_media, { maximumFractionDigits: 1 })} dias`}
            />
            <KpiCard label="% Graves" value={formatPercent(kpis.pct_graves)} trend={`${formatNumber(kpis.graves)} AIHs`} />
            <KpiCard label="Óbitos" value={formatNumber(kpis.obitos)} trend={`letalidade ${formatPercent(kpis.letalidade, 2)}`} />
          </div>

          <div className={GRID.wideLeft}>
            <ChartCard
              title="Internações por faixa etária e sexo"
              description="Pirâmide etária das AIHs por diabetes"
              figure={data.fig_piramide}
              layout={{ yaxis: { showgrid: false }, hovermode: "y unified" }}
              height={460}
              info={pyramidInfo({ kpis, ...data })}
            />
            <SexComparison sexo={kpis.sexo} info={sexInfo({ kpis, ...data })} />
          </div>

          <div className={GRID.full}>
            <ChartCard
              title="Óbitos por raça/cor"
              description="Óbitos por diabetes e participação de cada grupo"
              figure={data.fig_obitos_raca}
              layout={{ yaxis: { showgrid: false } }}
              height={240}
              info={raceInfo({ kpis, ...data })}
            />
          </div>
          <Conclusion {...conclusion({ kpis, ...data })} />
        </>
      )}
    </PageState>
  );
}
