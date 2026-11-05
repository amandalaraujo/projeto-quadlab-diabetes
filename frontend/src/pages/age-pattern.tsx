import { useMemo, useState } from "react";
import { Conclusion } from "@/components/conclusion";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { InfoPopover, type ChartInfo } from "@/components/info-popover";
import { PageState } from "@/components/page-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { useFilteredApi } from "@/hooks/use-api";
import type { AgePatternResponse } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatNumber, formatPercent } from "@/utils/format";

type Mode = "aihs" | "linha";

/** Faixa etária com mais AIHs entre os diagnósticos que contêm `term`. */
function peakFor(data: AgePatternResponse, term: string) {
  const rows = data.diagnosticos.filter((d) => d.diagnostico.toLowerCase().includes(term));
  if (!rows.length) return null;
  const totals = data.faixas.map((_, i) => rows.reduce((n, d) => n + d.valores[i], 0));
  const i = totals.indexOf(Math.max(...totals));
  return { faixa: data.faixas[i], total: rows.reduce((n, d) => n + d.total, 0) };
}

function matrixInfo(data: AgePatternResponse): ChartInfo {
  const i = data.totais.indexOf(Math.max(...data.totais));
  const top = data.diagnosticos[0];
  const keto = peakFor(data, "cetoacidose");
  const circ = peakFor(data, "circulatorias");
  return {
    how: 'Linhas: diagnóstico principal (subcategoria CID-10). Colunas: faixa etária. Em "AIHs" a cor compara todas as células; em "% do diagnóstico" cada linha soma 100% e mostra em que idade aquele diagnóstico se concentra.',
    insights: [
      <>
        A faixa com mais internações é <strong>{data.faixas[i]}</strong> ({formatNumber(data.totais[i])} AIHs).
      </>,
      top && (
        <>
          O diagnóstico mais frequente é <strong>{top.diagnostico}</strong> ({formatNumber(top.total)} AIHs).
        </>
      ),
      keto && circ && keto.faixa !== circ.faixa && (
        <>
          Cetoacidose se concentra em <strong>{keto.faixa}</strong>, enquanto complicações circulatórias (pé diabético) pesam em{" "}
          <strong>{circ.faixa}</strong>: perfis clínicos diferentes por idade.
        </>
      ),
    ].filter(Boolean),
    caveat: "Faixas etárias têm populações de tamanhos diferentes; o volume absoluto não mede risco.",
  };
}

/** Cor da célula: escala log para que valores pequenos ainda apareçam ao lado de grandes. */
function cellStyle(value: number, max: number) {
  if (!value) return undefined;
  const t = Math.log1p(value) / Math.log1p(max);
  return {
    backgroundColor: `rgba(18, 184, 166, ${0.08 + t * 0.82})`,
    color: t > 0.6 ? "#fff" : undefined,
  };
}

function Matrix({ data }: { data: AgePatternResponse }) {
  const [term, setTerm] = useState("");
  const [mode, setMode] = useState<Mode>("aihs");

  const rows = useMemo(() => {
    const t = term.trim().toLocaleLowerCase("pt-BR");
    return t
      ? data.diagnosticos.filter((d) => `${d.diagnostico} ${d.categoria}`.toLocaleLowerCase("pt-BR").includes(t))
      : data.diagnosticos;
  }, [data, term]);

  // Em "% da linha" cada diagnóstico é comparado com ele mesmo: mostra em que idade ele se concentra.
  const cell = (d: AgePatternResponse["diagnosticos"][number], v: number) => (mode === "linha" ? v / d.total : v);
  const max = Math.max(1e-9, ...rows.flatMap((d) => d.valores.map((v) => cell(d, v))));
  const scale = mode === "linha" ? 1000 : 1;
  const maxTotal = Math.max(1, ...rows.map((d) => d.total));

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div>
          <CardTitle>Diagnóstico principal x faixa etária</CardTitle>
          <CardDescription>
            {formatNumber(data.total)} AIHs. Quanto mais escura a célula, maior a concentração.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InfoPopover title="Diagnóstico principal x faixa etária" info={matrixInfo(data)} />
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList aria-label="Valor das células">
              <TabsTrigger value="aihs">AIHs</TabsTrigger>
              <TabsTrigger value="linha">% do diagnóstico</TabsTrigger>
            </TabsList>
          </Tabs>
          <label className="flex items-center gap-2 rounded-lg border border-line px-2.5">
            <Search className="size-3.5 text-faint" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar diagnóstico (ex.: E10, coma)"
              className="h-8 w-56 bg-transparent text-xs outline-none placeholder:text-faint"
            />
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[620px] overflow-auto rounded-lg border border-line">
          <table className="w-full border-separate border-spacing-0 text-[11px] tabular-nums">
            <thead className="sticky top-0 z-20 bg-subtle">
              <tr>
                <th className="sticky left-0 z-10 min-w-56 border-b border-line bg-subtle px-3 py-2 text-left text-[10px] font-extrabold text-faint uppercase">
                  Diagnóstico principal
                </th>
                {data.faixas.map((f) => (
                  <th key={f} className="border-b border-line px-1.5 py-2 text-center font-bold whitespace-nowrap text-muted">
                    {f}
                  </th>
                ))}
                <th className="border-b border-line px-3 py-2 text-right font-extrabold text-ink">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.diagnostico}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-line/70 bg-surface px-3 py-1.5 text-left font-semibold whitespace-nowrap text-ink"
                  >
                    {d.diagnostico}
                  </th>
                  {d.valores.map((v, i) => (
                    <td
                      key={data.faixas[i]}
                      className="border-b border-line/70 px-1.5 py-1.5 text-center"
                      style={cellStyle(cell(d, v) * scale, max * scale)}
                      title={`${d.diagnostico} · ${data.faixas[i]}: ${formatNumber(v)} AIHs (${formatPercent(v / d.total)} do diagnóstico)`}
                    >
                      {v ? (mode === "linha" ? formatPercent(v / d.total, 0) : formatNumber(v)) : ""}
                    </td>
                  ))}
                  <td className="border-b border-line/70 px-3 py-1.5 text-right font-bold text-ink">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-10 overflow-hidden rounded-full bg-[#edf1f5]">
                        <div className="h-full bg-brand" style={{ width: `${(d.total / maxTotal) * 100}%` }} />
                      </div>
                      {formatNumber(d.total)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {!term && (
              <tfoot className="sticky bottom-0 z-20">
                <tr className="bg-[#0f766e] text-white">
                  <th scope="row" className="sticky left-0 z-10 bg-[#0f766e] px-3 py-2 text-left font-extrabold">
                    Total
                  </th>
                  {data.totais.map((v, i) => (
                    <td key={data.faixas[i]} className={cn("px-1.5 py-2 text-center font-bold")}>
                      {formatNumber(v)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-extrabold">{formatNumber(data.total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function conclusion(data: AgePatternResponse) {
  const i = data.totais.indexOf(Math.max(...data.totais));
  const elderly = data.faixas.reduce((n, faixa, j) => (parseInt(faixa, 10) >= 60 ? n + data.totais[j] : n), 0);
  const top = data.diagnosticos[0];
  const topPeak = top ? data.faixas[top.valores.indexOf(Math.max(...top.valores))] : null;
  const keto = peakFor(data, "cetoacidose");
  const circ = peakFor(data, "circulatorias");
  return {
    lead: (
      <>
        A faixa etária com mais internações foi <strong>{data.faixas[i]}</strong> ({formatNumber(data.totais[i])} AIHs), e{" "}
        <strong>{formatPercent(elderly / (data.total || 1))}</strong> das internações foram de pessoas com 60 anos ou mais.
      </>
    ),
    points: [
      top && (
        <>
          O diagnóstico mais frequente foi <strong>{top.diagnostico}</strong> ({formatNumber(top.total)} AIHs), com pico na faixa {topPeak}.
        </>
      ),
      keto && (
        <>
          A cetoacidose ({formatNumber(keto.total)} AIHs) se concentrou em <strong>{keto.faixa}</strong>.
        </>
      ),
      circ && (
        <>
          As complicações circulatórias ({formatNumber(circ.total)} AIHs) se concentraram em <strong>{circ.faixa}</strong>.
        </>
      ),
    ].filter(Boolean),
  };
}

/** Página 7 — Padrão etário das internações. */
export default function AgePattern() {
  const state = useFilteredApi<AgePatternResponse>("/age-pattern/");

  return (
    <PageState {...state} isEmpty={(d) => d.total === 0}>
      {(data) => (
        <>
          <Matrix data={data} />
          <Conclusion {...conclusion(data)} />
        </>
      )}
    </PageState>
  );
}
