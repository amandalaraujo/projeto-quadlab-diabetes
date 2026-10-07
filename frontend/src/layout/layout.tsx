import { Suspense, useState } from "react";
import { Outlet, ScrollRestoration, useMatches } from "react-router-dom";
import { Menu } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import type { PageHandle } from "@/routes";
import { DATASET } from "@/routes/pages";
import { Logo } from "@/components/logo";
import Sidebar, { NavLinks, SidebarFooter } from "./sidebar";

function MobileBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur nav:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent className="px-4 py-5.5">
          <SheetTitle asChild>
            <div className="mx-3 mt-1.75 mb-4">
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Navegação entre as análises</SheetDescription>
          <div className="flex-1 overflow-y-auto">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <SidebarFooter />
        </SheetContent>
      </Sheet>
      <Logo />
    </header>
  );
}

/** Pílulas abaixo do subtítulo (mesmo visual dos `.filter` originais). */
function DatasetPills() {
  const pills = [
    { label: "Ano", value: DATASET.period, hint: "Ano de competência das AIHs carregadas na base." },
    { label: "Fonte", value: DATASET.source, hint: "Sistema de Informações Hospitalares do SUS." },
    { label: "Região", value: DATASET.region, hint: "Recorte geográfico dos dados importados." },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map(({ label, value, hint }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Badge tabIndex={0} className="cursor-default">
              {label}: <strong className="text-ink">{value}</strong>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{hint}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

/**
 * Rota pai de todas as páginas: menu lateral, cabeçalho e `<Outlet />`.
 * Título e subtítulo vêm do `handle` da rota ativa (ver routes/index.tsx).
 */
export default function Layout() {
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle as PageHandle | undefined;

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileBar />

      <main className="px-4 py-5.5 sm:px-9.5 sm:py-8.5 nav:ml-60">
        <header className="mb-6.5">
          <h1 className="text-[28px] leading-tight font-extrabold tracking-[-1px] text-ink">
            {handle?.title}
          </h1>
          {handle?.subtitle && <p className="mt-1.25 text-[13px] text-muted">{handle.subtitle}</p>}
          <div className="mt-3.5">
            <DatasetPills />
          </div>
        </header>

        {/* As páginas são carregadas sob demanda (ver routes/index.tsx). */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>

      <ScrollRestoration />
    </div>
  );
}
