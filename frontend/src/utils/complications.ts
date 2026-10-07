/**
 * Cor fixa por complicação, para que a mesma categoria tenha a mesma cor
 * em todos os gráficos (o backend colore por posição, o que troca as
 * cores de um gráfico para outro).
 */
export const BRAND = "#12b8a6";

const COMPLICATION_COLORS: Record<string, string> = {
  Cetoacidose: "#f04461",
  "Amputação": "#f5a623",
  "Coma Diabético": "#4f7cff",
  "Sem complicação grave registrada": "#98a2b3",
};

export const isNoComplication = (name: string) => name.startsWith("Sem complicação");

export function complicationColor(name: string, fallback?: string) {
  return COMPLICATION_COLORS[name] ?? fallback ?? BRAND;
}
