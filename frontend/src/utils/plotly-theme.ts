import type { Axis, FigureLayout, Trace } from "@/types/api";

/**
 * Aplica o visual do dashboard em cima do layout que vem do backend
 * (fig.to_plotly_json()): fundo transparente, fonte da página, grade
 * suave, tooltip escuro e números em pt-BR. Opções específicas da figura
 * (autorange, mapbox...) são preservadas.
 */
const FONT = '"Plus Jakarta Sans", system-ui, sans-serif';

const INK = "#101828";
const MUTED = "#667085";
const FAINT = "#98a2b3";
const GRID = "#eef2f6";
const LINE = "#e6eaf0";

// Mesma paleta do backend (COLORS em api_views.py), para traços sem cor própria.
const COLORWAY = ["#12b8a6", "#f04461", "#f5a623", "#4f7cff", "#8a63d2", "#2fb8e6"];

function themedAxis(axis: Axis = {}): Axis {
  return {
    ...axis,
    // Títulos de eixo removidos: o que o gráfico mede fica na descrição do
    // card. Assim todos os eixos x terminam na mesma altura e os gráficos
    // lado a lado ficam alinhados.
    title: { text: "" },
    automargin: true,
    gridcolor: GRID,
    linecolor: LINE,
    zeroline: false,
    tickfont: { size: 11, color: FAINT },
  };
}

/** `overrides` é aplicado por cima; `xaxis`/`yaxis`/`legend` são mesclados, não substituídos. */
export function themedLayout(layout: FigureLayout = {}, overrides: FigureLayout = {}): FigureLayout {
  const hasMap = Boolean(layout.mapbox || layout.map || layout.geo);
  const { xaxis, yaxis, legend, ...rest } = overrides;

  return {
    ...layout,
    autosize: true,
    separators: ",.",
    colorway: COLORWAY,
    piecolorway: COLORWAY,
    font: { family: FONT, size: 12, color: MUTED },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: hasMap ? { l: 0, r: 0, t: 0, b: 0 } : { l: 4, r: 8, t: 8, b: 4, pad: 4 },
    xaxis: { ...themedAxis(layout.xaxis), ...xaxis },
    yaxis: { ...themedAxis(layout.yaxis), ...yaxis },
    bargap: 0.35,
    barcornerradius: 4,
    hoverlabel: {
      bgcolor: INK,
      bordercolor: INK,
      font: { family: FONT, size: 12, color: "#fff" },
    },
    legend: {
      orientation: "h",
      x: 0,
      y: 1.02,
      yanchor: "bottom",
      font: { size: 11, color: MUTED },
      bgcolor: "rgba(0,0,0,0)",
      ...legend,
    },
    ...rest,
  };
}

/** Ajustes por tipo de traço: pizza vira rosca com divisões brancas. */
export function themedData(data: Trace[] = []): Trace[] {
  return data.map((trace) =>
    trace.type === "pie"
      ? {
          hole: 0.58,
          textinfo: "percent",
          textfont: { color: "#fff", size: 12 },
          marker: { line: { color: "#fff", width: 2 }, ...trace.marker },
          ...trace,
        }
      : trace,
  );
}

export const PLOT_CONFIG = {
  displayModeBar: false,
  responsive: true,
} as const;
