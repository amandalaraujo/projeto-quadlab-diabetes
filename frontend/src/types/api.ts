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

/** Opções da barra de filtros (`/api/filters/`), uma lista por filtro. */
export type FilterOptions = Record<string, Array<string | number>>;

/** KPIs comuns (`indicadores()` no backend). */
export interface Kpis {
  aihs: number;
  graves: number;
  obitos: number;
  custo_total: number | null;
  custo_medio: number | null;
  permanencia_media: number | null;
  idade_media: number | null;
  pct_graves: number | null;
  letalidade: number | null;
}

/** Página 1 — `/api/territory/`. */
export interface TerritoryResponse {
  kpis: Kpis;
  fig_mapa: Figure;
  fig_custo_periodo: Figure;
  municipios: Array<{
    municipio: string;
    uf: string;
    aihs: number;
    pct_aihs: number | null;
    custo: number;
    pct_custo: number | null;
    custo_medio: number | null;
  }>;
}

/** Página 2 — `/api/overview/` (também usada pela landing). */
export interface OverviewResponse {
  kpis: Kpis;
  fig_evolucao: Figure;
  fig_mapa: Figure;
  municipios: Array<{
    municipio: string;
    uf: string;
    aihs: number;
    pct_graves: number | null;
    obitos: number;
    custo_medio: number | null;
  }>;
}

export interface CriticalMunicipality {
  municipio: string;
  aihs: number;
  pct_graves: number;
  obitos: number;
  letalidade: number;
}

/** Página 3 — `/api/criticality/`. */
export interface CriticalityResponse {
  kpis: Kpis & { fora_do_municipio: number; pct_fora_do_municipio: number | null };
  fig_categorias: Figure;
  fig_custo_categoria: Figure;
  fig_fluxo: Figure;
  fig_criticidade: Figure;
  corte: { aihs: number; pct_graves: number; min_aihs: number };
  criticos: CriticalMunicipality[];
}

/** Página 4 — `/api/general/`. */
export interface GeneralResponse {
  kpis: Kpis & {
    sexo: Record<string, { aihs: number; pct: number | null }>;
    media_diaria: number | null;
    pico: { periodo: string; aihs: number } | null;
  };
  fig_sexo: Figure;
  fig_evolucao: Figure;
  ranking_faixas: Array<{ faixa: string; aihs: number }>;
}

/** Página 5 — `/api/demographic/`. */
export interface DemographicResponse {
  kpis: Kpis & {
    sexo: Record<string, { aihs: number; obitos: number; pct_graves: number | null; letalidade: number | null }>;
  };
  fig_piramide: Figure;
  fig_obitos_raca: Figure;
}

/** Página 6 — `/api/complications/`. */
export interface ComplicationsResponse {
  total: number;
  categorias: Array<{ categoria: string; aihs: number }>;
  fig_hierarquia: Figure;
  fig_matriz: Figure;
}

/** Página 7 — `/api/age-pattern/`. */
export interface AgePatternResponse {
  faixas: string[];
  diagnosticos: Array<{ diagnostico: string; categoria: string; valores: number[]; total: number }>;
  totais: number[];
  total: number;
}

/** Página 8 — `/api/mortality/`. */
export interface MortalityResponse {
  kpis: Kpis & { permanencia_obitos: number | null; idade_obitos: number | null };
  procedimentos: Array<{
    solicitado: string;
    obitos: number;
    aihs: number;
    letalidade: number | null;
    realizado: string;
    obitos_realizado: number;
  }>;
  fig_letalidade_complicacao: Figure;
}
