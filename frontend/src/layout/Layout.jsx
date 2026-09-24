import Sidebar from "./Sidebar.jsx";

export default function Layout({ title, subtitle, children }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="dmain">
        <div className="dhead">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="filters">
            <span className="filter">
              Ano: <strong>2023–2025 ▾</strong>
            </span>
            <span className="filter">
              Região: <strong>Brasil ▾</strong>
            </span>
            <span className="filter">
              UF: <strong>Todas ▾</strong>
            </span>
            <span className="filter">
              Idade: <strong>Todas ▾</strong>
            </span>
          </div>
        </div>
        <div id="dashContent">{children}</div>
      </main>
    </div>
  );
}
