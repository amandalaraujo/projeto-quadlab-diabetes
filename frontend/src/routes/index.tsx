import { lazy } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import Layout from "@/layout/layout";
import Landing from "@/pages/landing";
import { PAGES, type PageConfig } from "./pages";

// As páginas do dashboard usam o Plotly (~5 MB); carregá-las sob demanda
// deixa a landing leve para quem só visita o site público.
const Overview = lazy(() => import("@/pages/overview"));
const FigurePage = lazy(() => import("@/pages/figure-page"));

/** Dados de cada rota lidos pelo Layout (via `useMatches`) para montar o cabeçalho. */
export interface PageHandle {
  title: string;
  subtitle: string;
}

const handleOf = ({ title, subtitle }: PageConfig): PageHandle => ({ title, subtitle });
const routePath = (page: PageConfig) => page.path.replace(/^\//, "");

const [overview, ...figurePages] = PAGES;

const dashboardRoutes: RouteObject[] = [
  { path: routePath(overview), element: <Overview />, handle: handleOf(overview) },
  ...figurePages
    .filter((page) => page.endpoint)
    .map((page) => ({
      path: routePath(page),
      // `key` recria a página ao trocar de rota, zerando o estado do fetch.
      element: <FigurePage key={page.path} endpoint={page.endpoint!} figures={page.figures} />,
      handle: handleOf(page),
    })),
];

export const router = createBrowserRouter([
  // Site público.
  { path: "/", element: <Landing /> },
  // Área de análise: rota pai sem caminho próprio, só para o menu + cabeçalho.
  { element: <Layout />, children: dashboardRoutes },
  // Qualquer rota desconhecida volta para o site.
  { path: "*", element: <Navigate to="/" replace /> },
]);
