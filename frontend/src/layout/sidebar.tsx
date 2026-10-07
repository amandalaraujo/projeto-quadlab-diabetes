import { Link, NavLink } from "react-router-dom";
import { Logo } from "@/components/logo";
import { DATASET, PAGES } from "@/routes/pages";
import { cn } from "@/utils/cn";

/** Links de navegação — usados no menu fixo (desktop) e no Sheet (mobile). */
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav>
      <div className="mt-4.5 mb-2.25 px-3 text-[9px] font-extrabold tracking-[1.3px] text-faint uppercase">
        Análises
      </div>
      {PAGES.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "mb-0.75 flex items-center gap-2.5 rounded-[11px] px-3.25 py-2.75 text-xs font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
              isActive ? "bg-brand-soft text-brand-strong" : "text-muted hover:bg-canvas hover:text-ink",
            )
          }
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/** Rodapé do menu (`.sidebar-bottom` do protótipo): sair para o site + recorte dos dados. */
export function SidebarFooter() {
  return (
    <div className="border-t border-line pt-4.25">
      <Link
        to="/"
        className="block w-full rounded-[10px] p-2.75 text-xs font-bold text-muted transition-colors hover:bg-[#fff1f3] hover:text-coral"
      >
        ← Sair da análise
      </Link>
      <p className="mt-2 px-2.75 text-[11px] leading-relaxed text-muted">
        <strong className="text-ink">{DATASET.source}</strong> · {DATASET.region}, {DATASET.period}
      </p>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface px-4 py-5.5 nav:flex">
      <div className="mx-3 mt-1.75 mb-4">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavLinks />
      </div>
      <SidebarFooter />
    </aside>
  );
}
