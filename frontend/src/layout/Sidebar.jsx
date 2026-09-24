import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Visão geral", end: true },
  { to: "/territorio", label: "Onde estão?" },
  { to: "/demografia", label: "Quem são?" },
  { to: "/mortalidade", label: "Mortalidade" },
  { to: "/complicacoes", label: "Complicações e CID-10" },
  { to: "/evolucao", label: "Evolução das AIHs" },
  { to: "/economico", label: "Impacto econômico" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark" />
        <span>QuadLab</span>
      </div>
      <div className="side-section">Análises</div>
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => `side-link${isActive ? " active" : ""}`}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
