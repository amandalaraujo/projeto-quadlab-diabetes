import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { InfoPopover, type ChartInfo } from "@/components/info-popover";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Valor usado na ordenação; sem ele a coluna não é ordenável. */
  sortValue?: (row: T) => number | string | null;
  align?: "left" | "right";
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  description?: string;
  rows: T[];
  columns: Column<T>[];
  /** Texto pesquisável de cada linha; sem ele não aparece o campo de busca. */
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  initialSort?: { key: string; desc: boolean };
  /** Altura máxima da área rolável, em px. */
  maxHeight?: number;
  className?: string;
  /** Informativo do botão "?". */
  info?: ChartInfo;
  /** Classe extra por linha (ex.: destacar a linha selecionada). */
  rowClassName?: (row: T) => string | undefined;
  /** Conteúdo entre o cabeçalho e a tabela (ex.: filtro ativo). */
  toolbar?: ReactNode;
}

/** Tabela em card com busca, ordenação por coluna e cabeçalho fixo ao rolar. */
export function DataTable<T>({
  title,
  description,
  rows,
  columns,
  searchText,
  searchPlaceholder = "Buscar",
  initialSort,
  maxHeight = 420,
  className,
  info,
  rowClassName,
  toolbar,
}: DataTableProps<T>) {
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState(initialSort);

  const visible = useMemo(() => {
    const t = term.trim().toLocaleLowerCase("pt-BR");
    const filtered = t && searchText ? rows.filter((r) => searchText(r).toLocaleLowerCase("pt-BR").includes(t)) : rows;
    const column = columns.find((c) => c.key === sort?.key);
    if (!sort || !column?.sortValue) return filtered;
    const value = column.sortValue;
    return [...filtered].sort((a, b) => {
      const va = value(a) ?? -Infinity;
      const vb = value(b) ?? -Infinity;
      const cmp =
        typeof va === "string" || typeof vb === "string"
          ? String(va).localeCompare(String(vb), "pt-BR")
          : va - vb;
      return sort.desc ? -cmp : cmp;
    });
  }, [rows, columns, term, sort, searchText]);

  const toggleSort = (key: string) =>
    setSort((prev) => (prev?.key === key ? { key, desc: !prev.desc } : { key, desc: true }));

  return (
    <Card className={cn("flex min-w-0 flex-col", className)}>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {searchText && (
            <label className="flex items-center gap-2 rounded-lg border border-line px-2.5">
              <Search className="size-3.5 text-faint" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-44 bg-transparent text-xs outline-none placeholder:text-faint"
              />
            </label>
          )}
          {info && <InfoPopover title={title} info={info} />}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {toolbar}
        <div className="overflow-auto rounded-lg border border-line" style={{ maxHeight }}>
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-subtle">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn(
                      "border-b border-line px-3 py-2.5 text-[10px] font-extrabold tracking-[0.5px] whitespace-nowrap text-faint uppercase",
                      c.align === "right" ? "text-right" : "text-left",
                    )}
                    aria-sort={sort?.key === c.key ? (sort.desc ? "descending" : "ascending") : undefined}
                  >
                    {c.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className="inline-flex items-center gap-1 uppercase hover:text-ink"
                      >
                        {c.header}
                        {sort?.key === c.key &&
                          (sort.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />)}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <tr key={i} className={cn("border-b border-line/70 last:border-0 hover:bg-subtle", rowClassName?.(row))}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-2 text-ink tabular-nums",
                        c.align === "right" && "text-right",
                        c.className,
                      )}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-8 text-center text-faint">
                    Nenhum resultado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-right text-[11px] text-faint">
          {formatNumber(visible.length)} de {formatNumber(rows.length)} linhas
        </p>
      </CardContent>
    </Card>
  );
}

/** Valor com barrinha proporcional (para colunas de participação). */
export function ShareBar({ value, fraction, color = "var(--color-brand)" }: {
  value: ReactNode;
  fraction: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#edf1f5]">
        <div className="h-full rounded-full" style={{ width: `${Math.min(1, fraction) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="w-14 text-right">{value}</span>
    </div>
  );
}
