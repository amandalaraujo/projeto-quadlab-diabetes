import {
  HeartPulse,
  LayoutDashboard,
  MapPin,
  Stethoscope,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Título/descrição e ajustes de uma figura `fig_*` da resposta da API. */
export interface FigureMeta {
  title: string;
  description?: string;
  /** Altura mínima do gráfico em px (padrão 320). */
  height?: number;
  /** Ocupa a linha inteira do grid. */
  wide?: boolean;
  /** Troca o mês numérico (1–12) do eixo x por Jan–Dez. */
  months?: boolean;
  /** Troca os rótulos longos do eixo x por uma legenda colorida (ver utils/figures.ts). */
  legendBars?: boolean;
  /** Unidade mostrada no tooltip das `legendBars`. */
  unit?: string;
}

export interface PageConfig {
  path: string;
  label: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Endpoint da API; páginas com endpoint são renderizadas pelo FigurePage. */
  endpoint?: string;
  figures?: Record<string, FigureMeta>;
}

/**
 * Fonte única das páginas: o menu lateral (layout/sidebar.tsx) e as rotas
 * (routes/index.tsx) leem daqui. Para uma página nova, basta adicionar um
 * item com `endpoint` e os títulos das figuras em `figures`.
 */
export const PAGES: PageConfig[] = [
  {
    path: "/dashboard",
    label: "Visão geral",
    icon: LayoutDashboard,
    title: "Visão geral",
    subtitle: "Panorama das internações hospitalares relacionadas ao Diabetes Mellitus",
  },
  {
    path: "/territorio",
    label: "Onde estão?",
    icon: MapPin,
    title: "Onde estão?",
    subtitle: "Distribuição geográfica das internações por diabetes",
    endpoint: "/territory/",
    figures: {
      // O backend agrupa por `uf_zi`, que no SIH é o código IBGE do
      // município gestor (não a UF).
      fig_por_uf: {
        title: "Internações por município gestor",
        description: "AIHs por código IBGE do gestor (campo UF_ZI do SIH)",
        height: 420,
      },
      fig_mapa_calor: {
        title: "Concentração por município",
        description: "Densidade de internações pelo município de residência",
        height: 420,
      },
    },
  },
  {
    path: "/demografia",
    label: "Quem são?",
    icon: Users,
    title: "Quem são?",
    subtitle: "Perfil dos pacientes internados por sexo e faixa etária",
    endpoint: "/demographic/",
    figures: {
      fig_sexo: { title: "Distribuição por sexo", description: "Participação no total de AIHs" },
      fig_idade: { title: "Distribuição por idade", description: "Número de AIHs por idade do paciente (anos)" },
    },
  },
  {
    path: "/mortalidade",
    label: "Mortalidade",
    icon: HeartPulse,
    title: "Mortalidade",
    subtitle: "Óbitos hospitalares por complicação e unidade da federação",
    endpoint: "/mortality/",
    figures: {
      fig_mortalidade_complicacao: {
        title: "Óbitos por complicação",
        description: "Número de óbitos por tipo de complicação",
        legendBars: true,
        unit: "óbitos",
      },
      fig_mortalidade_uf: { title: "Óbitos por UF", description: "Número de óbitos por unidade da federação" },
    },
  },
  {
    path: "/complicacoes",
    label: "Complicações e CID-10",
    icon: Stethoscope,
    title: "Complicações e CID-10",
    subtitle: "Complicações registradas e diagnósticos principais mais frequentes",
    endpoint: "/complications/",
    figures: {
      fig_complicacoes: {
        title: "AIHs por complicação",
        description: "Número de AIHs por tipo de complicação",
        legendBars: true,
        unit: "AIHs",
      },
      fig_cid10: {
        title: "Principais diagnósticos (CID-10)",
        description: "Número de AIHs por CID-10 principal",
      },
    },
  },
  {
    path: "/evolucao",
    label: "Evolução das AIHs",
    icon: TrendingUp,
    title: "Evolução das AIHs",
    subtitle: "Série temporal mensal das internações",
    endpoint: "/evolution/",
    figures: {
      fig_evolucao: {
        title: "Internações por mês",
        description: "Número de AIHs por mês/ano de competência",
        height: 400,
      },
    },
  },
  {
    path: "/economico",
    label: "Impacto econômico",
    icon: Wallet,
    title: "Impacto econômico",
    subtitle: "Custo hospitalar das internações ao longo do tempo",
    endpoint: "/economic/",
    figures: {
      fig_custo_mensal: {
        title: "Custo hospitalar por mês",
        description: "Soma do valor total das AIHs (R$)",
        height: 400,
        months: true,
      },
    },
  },
];

/**
 * Período e recorte dos dados. O README cita 2023–2025, mas a base
 * carregada hoje no Neon só tem competências de 2025 — atualize aqui
 * quando os outros anos forem importados.
 */
export const DATASET = {
  period: "2025",
  source: "SIH/SUS",
  region: "São Paulo",
};
