import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import Layout from "@/layout/layout";
import Landing from "@/pages/landing";
import { PAGES } from "./pages";

/** Dados de cada rota lidos pelo Layout (via `useMatches`) para montar o cabeçalho. */
export interface PageHandle {
  title: string;
  subtitle: string;
}

const dashboardRoutes: RouteObject[] = PAGES.map(({ path, title, subtitle, component: Page }) => ({
  path: path.replace(/^\//, ""),
  element: <Page />,
  handle: { title, subtitle } satisfies PageHandle,
}));

export const router = createBrowserRouter([
  // Site público.
  { path: "/", element: <Landing /> },
  // Área de análise: rota pai sem caminho próprio, só para o menu + cabeçalho.
  { element: <Layout />, children: dashboardRoutes },
  // Rotas antigas que foram incorporadas às páginas acima.
  { path: "/territorio", element: <Navigate to="/criticidade" replace /> },
  { path: "/evolucao", element: <Navigate to="/panorama" replace /> },
  { path: "/economico", element: <Navigate to="/dashboard" replace /> },
  // O "Sobre" agora fica só na landing.
  { path: "/sobre", element: <Navigate to="/#sobre" replace /> },
  // Qualquer rota desconhecida volta para o site.
  { path: "*", element: <Navigate to="/" replace /> },
]);
