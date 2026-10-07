/**
 * Formato das respostas da API do Django (dashboard/api/api_views.py).
 * As figuras vêm de `fig.to_plotly_json()`; tipamos só o que o front lê
 * e deixamos o resto aberto, já que o Plotly aceita muitos atributos.
 */
export interface Trace {
  type?: string;
  name?: string;
  x?: Array<string | number>;
  y?: number[];
  line?: { color?: string; [key: string]: unknown };
  marker?: { color?: string | string[]; [key: string]: unknown };
  visible?: boolean | "legendonly";
  [key: string]: unknown;
}

export interface Axis {
  title?: { text?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface FigureLayout {
  xaxis?: Axis;
  yaxis?: Axis;
  legend?: Record<string, unknown>;
  showlegend?: boolean;
  mapbox?: unknown;
  map?: unknown;
  geo?: unknown;
  [key: string]: unknown;
}

export interface Figure {
  data: Trace[];
  layout: FigureLayout;
}

/** Resposta genérica das páginas de gráficos: cada chave `fig_*` é uma figura. */
export type FigureResponse = Record<string, Figure>;

export interface OverviewResponse {
  kpis: {
    total_aihs: number;
    obitos: number;
    custo_total: number;
    custo_medio: number;
    permanencia_media: number;
  };
  fig_complicacoes: Figure;
  fig_evolucao: Figure;
}
