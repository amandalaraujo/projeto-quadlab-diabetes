import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { useApi } from "@/hooks/use-api";
import { FILTERS, useFilters, type FilterDef } from "@/hooks/use-filters";
import type { FilterOptions } from "@/types/api";
import { cn } from "@/utils/cn";

// Acima disso o popover ganha um campo de busca (municípios, UFs...).
const SEARCH_FROM = 8;

interface MultiSelectProps {
  filter: FilterDef;
  options: string[];
  value: string[];
  onChange: (values: string[]) => void;
}

function MultiSelect({ filter, options, value, onChange }: MultiSelectProps) {
  const [term, setTerm] = useState("");
  const selected = new Set(value);
  const visible = useMemo(() => {
    const t = term.trim().toLocaleLowerCase("pt-BR");
    return t ? options.filter((o) => o.toLocaleLowerCase("pt-BR").includes(t)) : options;
  }, [options, term]);

  const toggle = (option: string) =>
    onChange(selected.has(option) ? value.filter((v) => v !== option) : [...value, option]);

  const summary =
    value.length === 0 ? null : value.length === 1 ? (filter.short?.(value[0]) ?? value[0]) : `${value.length}`;

  return (
    <Popover onOpenChange={(open) => !open && setTerm("")}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 max-w-60 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
            value.length
              ? "border-brand/40 bg-brand-soft text-brand-strong"
              : "border-line bg-surface text-muted hover:text-ink",
          )}
        >
          {filter.label}
          {summary && <span className="truncate rounded bg-surface/70 px-1.5 text-[11px] text-ink">{summary}</span>}
          <ChevronDown className="size-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        {options.length > SEARCH_FROM && (
          <label className="mb-1.5 flex items-center gap-2 rounded-lg border border-line px-2.5">
            <Search className="size-3.5 text-faint" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={`Buscar ${filter.label.toLowerCase()}`}
              className="h-8 w-full bg-transparent text-xs outline-none placeholder:text-faint"
            />
          </label>
        )}
        <ul className="max-h-64 overflow-y-auto" role="listbox" aria-multiselectable>
          {visible.map((option) => {
            const on = selected.has(option);
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => toggle(option)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-ink outline-none hover:bg-canvas focus-visible:bg-canvas"
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded border",
                      on ? "border-brand bg-brand text-white" : "border-line",
                    )}
                  >
                    {on && <Check className="size-3" />}
                  </span>
                  <span className="truncate">{option}</span>
                </button>
              </li>
            );
          })}
          {visible.length === 0 && <li className="px-2 py-3 text-center text-xs text-faint">Nada encontrado</li>}
        </ul>
        {value.length > 0 && (
          <Button variant="ghost" size="sm" className="mt-1.5 w-full" onClick={() => onChange([])}>
            Limpar seleção
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Barra de filtros globais (ano, gênero, raça/cor, região...). O estado fica
 * na URL (ver hooks/use-filters.ts), então todas as páginas e gráficos
 * respondem aos mesmos filtros.
 */
export function FilterBar({ className }: { className?: string }) {
  const { data: options } = useApi<FilterOptions>("/filters/");
  const { selected, setFilter, clearAll, activeCount } = useFilters();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {FILTERS.map((filter) => (
        <MultiSelect
          key={filter.key}
          filter={filter}
          options={(options?.[filter.key] ?? []).map(String)}
          value={selected[filter.key]}
          onChange={(values) => setFilter(filter.key, values)}
        />
      ))}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-coral hover:text-coral">
          <X />
          Limpar tudo
        </Button>
      )}
    </div>
  );
}
