import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import {
  Activity,
  Crosshair,
  Grid3x3,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";

type PageModule = Promise<{ default: ComponentType }>;

export interface PageConfig {
  path: string;
  label: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Endpoint que a página consome; o Layout pré-carrega todos em segundo plano. */
  endpoint: string;
  /** Importa o módulo da página (usado para pré-carregar). */
  load: () => PageModule;
  // As páginas usam o Plotly (~5 MB); carregá-las sob demanda deixa a
  // landing leve para quem só visita o site público.
  component: LazyExoticComponent<ComponentType>;
}

/** Monta a config com `component` (lazy) a partir de `load`. */
const page = (config: Omit<PageConfig, "component">): PageConfig => ({
  ...config,
  component: lazy(config.load),
});

/**
 * Fonte única das páginas, na ordem da documentação do projeto no Notion:
 * o menu lateral (layout/sidebar.tsx) e as rotas (routes/index.tsx) leem
 * daqui. Todas respondem aos filtros globais.
 */
export const PAGES: PageConfig[] = [
  page({
    path: "/dashboard",
    label: "Território e custos",
    icon: MapPin,
    title: "Distribuição territorial e impacto econômico",
    subtitle: "Onde moram os pacientes internados e quanto custam as internações",
    endpoint: "/territory/",
    load: () => import("@/pages/territory"),
  }),
  page({
    path: "/panorama",
    label: "Panorama epidemiológico",
    icon: Activity,
    title: "Panorama epidemiológico do Diabetes Mellitus",
    subtitle: "Volume, gravidade, mortalidade, permanência e polos de atendimento",
    endpoint: "/overview/",
    load: () => import("@/pages/overview"),
  }),
  page({
    path: "/criticidade",
    label: "Dispersão e criticidade",
    icon: Crosshair,
    title: "Dispersão territorial e municípios críticos",
    subtitle: "Residência x local de internação, tipos de diabetes e áreas que pedem atenção",
    endpoint: "/criticality/",
    load: () => import("@/pages/criticality"),
  }),
  page({
    path: "/aihs",
    label: "Panorama geral das AIHs",
    icon: LayoutDashboard,
    title: "Panorama geral das AIHs",
    subtitle: "Volume de internações por sexo, período e faixa etária",
    endpoint: "/general/",
    load: () => import("@/pages/general"),
  }),
  page({
    path: "/demografia",
    label: "Perfil e mortalidade",
    icon: Users,
    title: "Perfil demográfico e mortalidade",
    subtitle: "Quem são os pacientes, gravidade e óbitos por sexo, idade e raça/cor",
    endpoint: "/demographic/",
    load: () => import("@/pages/demographic"),
  }),
  page({
    path: "/complicacoes",
    label: "Complicações e CID-10",
    icon: Stethoscope,
    title: "Complicações clínicas e estratificação por CID-10",
    subtitle: "Tipos de diabetes e suas complicações registradas",
    endpoint: "/complications/",
    load: () => import("@/pages/complications"),
  }),
  page({
    path: "/padrao-etario",
    label: "Padrão etário",
    icon: Grid3x3,
    title: "Como cada subtipo de diabetes se distribui por idade?",
    subtitle: "Diagnóstico principal x faixa etária das internações",
    endpoint: "/age-pattern/",
    load: () => import("@/pages/age-pattern"),
  }),
  page({
    path: "/mortalidade",
    label: "Mortalidade",
    icon: HeartPulse,
    title: "Mortalidade por diabetes: procedimentos e desfechos",
    subtitle: "Procedimentos registrados nas internações que terminaram em óbito",
    endpoint: "/mortality/",
    load: () => import("@/pages/mortality"),
  }),
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
