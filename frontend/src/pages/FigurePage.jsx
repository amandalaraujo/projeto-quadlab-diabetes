import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import api from "../api/client.js";
import Layout from "../layout/Layout.jsx";

/**
 * Página genérica: chama `endpoint`, espera de volta um objeto cujas
 * chaves comecem com "fig_" (cada uma um fig.to_plotly_json() do backend)
 * e renderiza um <Plot /> por figura. Cobre Território, Demografia e
 * Econômico hoje — para uma página com KPIs/layout diferente, copie
 * Overview.jsx em vez desta.
 */
export default function FigurePage({ title, subtitle, endpoint }) {
  const [data, setData] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setData(null);
    setErro(null);
    api
      .get(endpoint)
      .then((res) => setData(res.data))
      .catch((err) => setErro(err.message));
  }, [endpoint]);

  const figuras = data ? Object.entries(data).filter(([k]) => k.startsWith("fig_")) : [];

  return (
    <Layout title={title} subtitle={subtitle}>
      {erro && <p style={{ color: "#f04461" }}>Erro ao carregar dados: {erro}</p>}
      {!data && !erro && <p>Carregando…</p>}

      <div className="panels">
        {figuras.map(([key, fig]) => (
          <div className="panel" key={key}>
            <Plot
              data={fig.data}
              layout={{ ...fig.layout, autosize: true }}
              useResizeHandler
              style={{ width: "100%", height: "320px" }}
              config={{ displayModeBar: false }}
            />
          </div>
        ))}
      </div>
    </Layout>
  );
}
