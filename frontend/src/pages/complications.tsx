import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Conclusion, joinPt } from "@/components/conclusion";
import Plotly from "plotly.js-dist-min";
import { X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { ChartCard, type PlotEvent } from "@/components/chart-card";
import { DataTable, ShareBar, type Column } from "@/components/data-table";
import { InfoPopover, type ChartInfo } from "@/components/info-popover";
import { GRID, PageState } from "@/components/page-state";
import { useFilteredApi } from "@/hooks/use-api";
import type { ComplicationsResponse } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatNumber, formatPercent } from "@/utils/format";
import { maxBy } from "@/utils/stats";

/** Nós do sunburst como vêm do backend (ComplicationsAPIView). */
interface Sunburst {
  ids: string[];
  labels: string[];
  parents: string[];
  values: number[];
}

/** Seleção feita no gráfico ou na lista de tipos: categoria aberta e item (subcategoria) destacado. */
interface Selection {
  category: string | null;
  item: string | null;
}

/** Um item (subcategoria) da hierarquia CID-10. */
interface CidItem {
  id: string;
  label: string;
  category: string;
  aihs: number;
}

function hierarchyInfo(data: ComplicationsResponse): ChartInfo {
  const t = data.fig_hierarquia.data[0] as unknown as { labels: string[]; parents: string[]; values: number[] };
  const root = t.labels[0];
  // Folhas = subcategorias (o pai não é a raiz nem vazio).
  const leaves = t.labels
    .map((label, i) => ({ label, parent: t.parents[i], value: t.values[i] }))
    .filter((n) => n.parent && n.parent !== root);
  const top = maxBy(leaves, (n) => n.value);
  const circulatory = leaves.filter((n) => n.label.includes("circulatorias")).reduce((a, n) => a + n.value, 0);
  return {
    how: "Anel interno: tipo de diabetes (categoria CID-10). Anel externo: subcategoria, que indica a complicação (4º dígito do código). Clique num tipo para ampliar.",
    insights: [
      top && (
        <>
          A subcategoria mais frequente é <strong>{top.label}</strong>, com {formatPercent(top.value / (data.total || 1))} das AIHs.
        </>
      ),
      circulatory > 0 && (
        <>
          Complicações circulatórias periféricas (ligadas ao pé diabético e amputações) somam {formatPercent(circulatory / (data.total || 1))} das
          internações.
        </>
      ),
    ].filter(Boolean),
  };
}

function matrixInfo(data: ComplicationsResponse): ChartInfo {
  const t = data.fig_matriz.data[0] as unknown as { x: string[]; y: string[]; z: number[][] };
  const dominant = t.y.slice(0, 3).map((cat, i) => {
    const j = t.z[i].indexOf(Math.max(...t.z[i]));
    return { cat, comp: t.x[j], pct: t.z[i][j] / 100 };
  });
  return {
    how: "Cada linha é um tipo de diabetes e soma 100%: a célula mostra que fração das internações daquele tipo teve cada complicação. Compare linhas para ver o que diferencia os tipos.",
    insights: dominant.map((d) => (
      <>
        Em <strong>{d.cat}</strong>, a complicação mais comum é {d.comp} ({formatPercent(d.pct, 0)}).
      </>
    )),
    caveat: '"C/compl NE" e "S/complic" indicam complicação não especificada ou ausente no registro, não necessariamente na realidade clínica.',
  };
}

interface CategoriesProps {
  data: ComplicationsResponse;
  selected: string | null;
  onSelect: (category: string | null) => void;
}

function Categories({ data, selected, onSelect }: CategoriesProps) {
  const top = data.categorias[0];
  return (
    <Card className="flex min-w-0 flex-col">
      <CardHeader>
        <div>
          <CardTitle>Tipos de diabetes</CardTitle>
          <CardDescription>{formatNumber(data.total)} AIHs por categoria CID-10</CardDescription>
        </div>
        <InfoPopover
          title="Tipos de diabetes"
          info={{
            how: "Participação de cada categoria CID-10 do diagnóstico principal no total de internações.",
            insights: top
              ? [
                  <>
                    <strong>{top.categoria}</strong> é a mais frequente ({formatPercent(top.aihs / data.total)}).
                  </>,
                ]
              : [],
            caveat: "E10 é tipicamente o diabetes tipo 1 e E11 o tipo 2, mas a codificação no SIH nem sempre segue a classificação clínica.",
          }}
        />
      </CardHeader>
      <CardContent className="space-y-1">
        {data.categorias.map((c) => (
          <button
            type="button"
            key={c.categoria}
            onClick={() => onSelect(selected === c.categoria ? null : c.categoria)}
            aria-pressed={selected === c.categoria}
            className={cn(
              "-mx-2 block w-[calc(100%+1rem)] rounded-lg px-2 py-1.5 text-left text-xs transition-colors outline-none hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand/40",
              selected === c.categoria && "bg-brand-soft hover:bg-brand-soft",
              selected && selected !== c.categoria && "opacity-50",
            )}
          >
            <div className="flex justify-between gap-3">
              <span className="font-semibold text-ink">
                <strong>{c.categoria.slice(0, 3)}</strong> {c.categoria.slice(4)}
              </span>
              <span className="shrink-0 text-muted tabular-nums">
                {formatNumber(c.aihs)} · {formatPercent(c.aihs / data.total)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#edf1f5]">
              <div className="h-full rounded-full bg-[#1e3a8a]" style={{ width: `${(c.aihs / data.total) * 100}%` }} />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function itemColumns(totals: Map<string, number>): Column<CidItem>[] {
  const ofType = (r: CidItem) => r.aihs / (totals.get(r.category) || 1);
  return [
    { key: "label", header: "Item CID-10", render: (r) => r.label, sortValue: (r) => r.label },
    { key: "aihs", header: "AIHs", align: "right", render: (r) => formatNumber(r.aihs), sortValue: (r) => r.aihs },
    {
      key: "tipo",
      header: "% do tipo",
      align: "right",
      render: (r) => <ShareBar value={formatPercent(ofType(r))} fraction={ofType(r)} />,
      sortValue: ofType,
    },
  ];
}

const NO_SELECTION: Selection = { category: null, item: null };
const ZOOM_MS = 600;

/**
 * Hierarquia CID-10 + tipos + lista de itens, sincronizados: clicar num
 * tipo (no gráfico ou na lista) abre o gráfico nele e filtra a lista;
 * clicar numa subcategoria do gráfico também destaca o item na lista.
 */
function CidView({ data }: { data: ComplicationsResponse }) {
  const [selection, setSelection] = useState<Selection>(NO_SELECTION);
  const plotRef = useRef<HTMLDivElement | null>(null);
  const tree = data.fig_hierarquia.data[0] as unknown as Sunburst;
  const root = tree.ids[0];

  // Filtros globais trazem uma figura nova, que abre na raiz: a seleção volta junto.
  useEffect(() => setSelection(NO_SELECTION), [data]);

  // Se um filtro global remover a categoria aberta, volta para a visão geral.
  const category = selection.category && tree.ids.includes(selection.category) ? selection.category : null;

  const items = useMemo<CidItem[]>(
    () =>
      tree.ids
        .map((id, i) => ({ id, label: tree.labels[i], category: tree.parents[i], aihs: tree.values[i] }))
        .filter((n) => n.category && n.category !== root),
    [tree, root],
  );
  const totals = useMemo(() => new Map(data.categorias.map((c) => [c.categoria, c.aihs])), [data]);
  const columns = useMemo(() => itemColumns(totals), [totals]);
  const visible = category ? items.filter((n) => n.category === category) : items;
  const top = maxBy(visible, (v) => v.aihs);

  // Mesma animação de zoom que o Plotly faz no clique, para seleções vindas das listas.
  const zoomTo = useCallback(
    (level: string) => {
      const el = plotRef.current;
      if (!el) return;
      void Plotly.animate(el, { data: [{ level }], traces: [0] } as never, {
        transition: { duration: ZOOM_MS, easing: "cubic-in-out" },
        frame: { duration: ZOOM_MS, redraw: false },
        mode: "immediate",
      } as never);
    },
    [],
  );

  const select = (next: Selection) => {
    setSelection(next);
    zoomTo(next.category ?? root);
  };

  const events = useMemo(() => {
    const leaves = new Set(items.map((n) => n.id));
    return {
      plotly_sunburstclick: (e: PlotEvent) => {
        const pt = e.points?.[0] as { id?: string; parent?: string } | undefined;
        if (!pt?.id) return;
        if (leaves.has(pt.id)) {
          // Subcategoria: não há nível abaixo dela; abre o tipo e destaca o item na lista.
          setSelection({ category: pt.parent ?? null, item: pt.id });
          zoomTo(pt.parent ?? root);
          return false;
        }
        // Tipo ou centro: o Plotly anima até `nextLevel`; a lista acompanha.
        setSelection({ category: !e.nextLevel || e.nextLevel === root ? null : e.nextLevel, item: null });
      },
    };
  }, [items, root, zoomTo]);

  return (
    <div className="grid grid-cols-1 gap-3.5 nav:grid-cols-[1.6fr_1fr]">
      <ChartCard
        title="Hierarquia CID-10"
        description="Tipo de diabetes → complicação. Clique num tipo para abrir suas complicações; clique no centro para voltar."
        figure={data.fig_hierarquia}
        events={events}
        plotRef={plotRef}
        height={520}
        info={hierarchyInfo(data)}
      />
      <div className="flex min-w-0 flex-col gap-3.5">
        <Categories data={data} selected={category} onSelect={(c) => select({ category: c, item: null })} />
        <DataTable
          title="Itens da hierarquia CID-10"
          description={
            category
              ? `${formatNumber(visible.length)} itens de ${category.slice(0, 3)}`
              : `Todos os ${formatNumber(items.length)} itens; selecione um tipo no gráfico ou na lista`
          }
          rows={visible}
          columns={columns}
          searchText={(r) => r.label}
          searchPlaceholder="Buscar item"
          initialSort={{ key: "aihs", desc: true }}
          maxHeight={320}
          rowClassName={(r) => (r.id === selection.item ? "bg-brand-soft font-semibold hover:bg-brand-soft" : undefined)}
          toolbar={
            category && (
              <button
                type="button"
                onClick={() => select(NO_SELECTION)}
                className="mb-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand-strong hover:bg-brand/20"
              >
                {category}
                <X className="size-3" />
              </button>
            )
          }
          info={{
            how: "Todos os itens (subcategorias) do gráfico CID-10, com o volume e o peso dentro do tipo de diabetes. A lista acompanha o tipo selecionado no gráfico ou na lista acima.",
            insights: top
              ? [
                  <>
                    {category ? `Em ${category.slice(0, 3)}, o` : "O"} item mais frequente é <strong>{top.label}</strong> (
                    {formatNumber(top.aihs)} AIHs).
                  </>,
                ]
              : [],
          }}
        />
      </div>
    </div>
  );
}

function conclusion(data: ComplicationsResponse) {
  const [first, second] = data.categorias;
  const tree = data.fig_hierarquia.data[0] as unknown as Sunburst;
  const root = tree.ids[0];
  const leaves = tree.ids
    .map((_, i) => ({ label: tree.labels[i], parent: tree.parents[i], value: tree.values[i] }))
    .filter((n) => n.parent && n.parent !== root);
  const top5 = [...leaves].sort((a, b) => b.value - a.value).slice(0, 5);
  const share = (term: string) => leaves.filter((n) => n.label.includes(term)).reduce((a, n) => a + n.value, 0) / (data.total || 1);
  return {
    lead: (
      <>
        Das <strong>{formatNumber(data.total)} internações</strong>,{" "}
        {first && (
          <>
            <strong>{first.categoria.slice(0, 3)}</strong> ({first.categoria.slice(4)}) foi o tipo mais frequente, com{" "}
            {formatPercent(first.aihs / (data.total || 1))}
          </>
        )}
        {second && (
          <>
            , seguido por {second.categoria.slice(0, 3)} ({formatPercent(second.aihs / (data.total || 1))})
          </>
        )}
        .
      </>
    ),
    points: [
      <>
        Os itens CID-10 mais frequentes foram {joinPt(top5.map((n) => <><strong>{n.label}</strong> ({formatNumber(n.value)})</>))}.
      </>,
      <>
        Complicações circulatórias periféricas, ligadas ao pé diabético e às amputações, somaram {formatPercent(share("circulatorias"))} das
        internações; cetoacidose, {formatPercent(share("cetoacidose"))}.
      </>,
    ],
  };
}

/** Página 6 — Complicações clínicas e estratificação por CID-10. */
export default function Complications() {
  const state = useFilteredApi<ComplicationsResponse>("/complications/");

  return (
    <PageState {...state} isEmpty={(d) => d.total === 0}>
      {(data) => (
        <>
          <CidView data={data} />

          <div className={GRID.full}>
            <ChartCard
              title="Complicações por tipo de diabetes"
              description="% das AIHs de cada tipo em cada complicação (4º dígito do CID-10)"
              figure={data.fig_matriz}
              layout={{ xaxis: { showgrid: false }, yaxis: { showgrid: false } }}
              height={300}
              info={matrixInfo(data)}
            />
          </div>
          <Conclusion {...conclusion(data)} />
        </>
      )}
    </PageState>
  );
}
