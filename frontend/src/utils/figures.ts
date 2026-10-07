import type { Figure, FigureLayout, Trace } from "@/types/api";
import { complicationColor } from "./complications";
import { monthLabel } from "./format";

/** Dados/layout ajustados que o ChartCard aplica por cima da figura original. */
export interface FigureAdjustment {
  data?: Trace[];
  layout?: FigureLayout;
}

/**
 * Barras por categoria (x = nomes, y = valores) com legenda no lugar dos
 * rótulos do eixo x: cada categoria vira um traço próprio, com cor fixa
 * por complicação, e a legenda em cima diz qual é qual — mesma leitura do
 * gráfico "Evolução das internações". O valor aparece no topo da barra.
 */
export function legendBars(figure: Figure, unit = ""): FigureAdjustment {
  const [bar] = figure.data;
  const names = (bar.x ?? []).map(String);
  const values = bar.y ?? [];
  const baseColor = bar.marker?.color;
  const max = Math.max(...values);

  return {
    data: names.map((name, i) => ({
      type: "bar",
      name,
      x: [name],
      y: [values[i]],
      marker: {
        color: complicationColor(name, Array.isArray(baseColor) ? baseColor[i] : baseColor),
      },
      texttemplate: "%{y:,}",
      textposition: "outside",
      textfont: { size: 12, color: "#101828" },
      cliponaxis: false,
      hovertemplate: `${name}: <b>%{y:,}${unit ? ` ${unit}` : ""}</b><extra></extra>`,
    })),
    layout: {
      // "stack" mantém cada barra centralizada na sua categoria (com
      // "group" o Plotly reservaria espaço para todos os traços em cada x).
      barmode: "stack",
      showlegend: true,
      // Rótulos em branco (em vez de showticklabels: false) para reservar a
      // mesma faixa de rótulos que os outros gráficos têm embaixo do eixo x
      // e manter as linhas de base alinhadas entre cards lado a lado.
      xaxis: { showgrid: false, tickmode: "array", tickvals: names, ticktext: names.map(() => " ") },
      yaxis: { range: [0, max * 1.15] },
    },
  };
}

/** Troca o mês numérico (1–12) do eixo x por "Jan"–"Dez". */
export function monthBars(figure: Figure): FigureAdjustment {
  return { data: figure.data.map((t) => ({ ...t, x: (t.x ?? []).map(monthLabel) })) };
}
