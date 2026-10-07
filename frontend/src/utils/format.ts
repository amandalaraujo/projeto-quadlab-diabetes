const LOCALE = "pt-BR";

export function formatNumber(n: number | null | undefined, options?: Intl.NumberFormatOptions) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString(LOCALE, options);
}

/** Número abreviado: 26352 → "26,4 mil". */
export function formatCompact(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString(LOCALE, { notation: "compact", maximumFractionDigits: 1 });
}

export function formatMoney(n: number | null | undefined, { compact = false } = {}) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString(LOCALE, {
    style: "currency",
    currency: "BRL",
    ...(compact && { notation: "compact", maximumFractionDigits: 1 }),
  });
}

export function formatPercent(fraction: number | null | undefined, digits = 1) {
  if (fraction === null || fraction === undefined || Number.isNaN(fraction)) return "—";
  return fraction.toLocaleString(LOCALE, {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export const MONTHS_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/** Mês numérico (1–12), como o backend manda em `mes_cmpt`, para "Jan"–"Dez". */
export const monthLabel = (m: string | number) => MONTHS_SHORT[Number(m) - 1] ?? m;
