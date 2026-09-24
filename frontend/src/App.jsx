import { Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview.jsx";
import FigurePage from "./pages/FigurePage.jsx";
import Placeholder from "./pages/Placeholder.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route
        path="/territorio"
        element={
          <FigurePage
            title="Onde estão?"
            subtitle="Internações por unidade da federação"
            endpoint="/territory/"
          />
        }
      />
      <Route
        path="/demografia"
        element={
          <FigurePage
            title="Quem são?"
            subtitle="Distribuição por sexo e faixa etária"
            endpoint="/demographic/"
          />
        }
      />
      <Route
        path="/economico"
        element={
          <FigurePage
            title="Impacto econômico"
            subtitle="Custo hospitalar total por mês"
            endpoint="/economic/"
          />
        }
      />
      <Route
        path="/mortalidade"
        element={<Placeholder title="Mortalidade" subtitle="Em construção" />}
      />
      <Route
        path="/complicacoes"
        element={<Placeholder title="Complicações e CID-10" subtitle="Em construção" />}
      />
      <Route
        path="/evolucao"
        element={<Placeholder title="Evolução das AIHs" subtitle="Em construção" />}
      />
    </Routes>
  );
}
