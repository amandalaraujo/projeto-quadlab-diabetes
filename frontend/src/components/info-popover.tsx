import type { ReactNode } from "react";
import { CircleHelp, Lightbulb, TriangleAlert } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { FILTERS, useFilters } from "@/hooks/use-filters";

/** Conteúdo do informativo de um gráfico. */
export interface ChartInfo {
  /** Como ler o gráfico (fixo). */
  how: string;
  /** Leituras calculadas a partir dos dados com os filtros atuais. */
  insights: ReactNode[];
  /** Cuidado de interpretação, quando houver. */
  caveat?: string;
}

/** Filtros ativos em texto ("Gênero: Feminino · Faixa etária: 60-64a"). */
export function useFilterSummary() {
  const { selected } = useFilters();
  const parts = FILTERS.filter((f) => selected[f.key].length).map(
    (f) => `${f.label}: ${selected[f.key].map((v) => f.short?.(v) ?? v).join(", ")}`,
  );
  return parts.length ? parts.join(" · ") : "todos os dados, sem filtros";
}

/** Botão "?" no cabeçalho dos cards; abre a interpretação do gráfico (clique ou toque). */
export function InfoPopover({ title, info }: { title: string; info: ChartInfo }) {
  const recorte = useFilterSummary();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Como interpretar: ${title}`}
          className="grid size-7 shrink-0 place-items-center rounded-full text-faint transition-colors outline-none hover:bg-canvas hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand/40 data-[state=open]:bg-brand-soft data-[state=open]:text-brand-strong"
        >
          <CircleHelp className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4 text-xs leading-relaxed text-[#475467]">
        <h4 className="text-[13px] font-extrabold text-ink">{title}</h4>
        <p className="mt-1.5">{info.how}</p>

        {info.insights.length > 0 && (
          <div className="mt-3 rounded-lg border border-[#d8efeb] bg-[#f7fbfa] p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.5px] text-brand-strong uppercase">
              <Lightbulb className="size-3.5" />
              Possível interpretação
            </div>
            <ul className="space-y-1.5">
              {info.insights.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {info.caveat && (
          <p className="mt-3 flex gap-2 text-[11px] text-muted">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber" />
            {info.caveat}
          </p>
        )}

        <p className="mt-3 border-t border-line pt-2.5 text-[11px] text-faint">
          <strong className="text-muted">Recorte:</strong> {recorte}
        </p>
      </PopoverContent>
    </Popover>
  );
}
