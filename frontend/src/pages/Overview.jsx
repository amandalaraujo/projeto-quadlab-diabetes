import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import api from "../api/client.js";
import Layout from "../layout/Layout.jsx";

function formatNumber(n) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("pt-BR");
}

function formatMoney(n) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Overview() {
  const [data, setData] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api
      .get("/overview/")
      .then((res) => setData(res.data))
      .catch((err) => setErro(err.message));
  }, []);

  return (
    <Layout
      title="Visão geral"
      subtitle="Panorama das internações hospitalares relacionadas ao Diabetes Mellitus"
    >
      {erro && <p style={{ color: "#f04461" }}>Erro ao carregar dados: {erro}</p>}
      {!data && !erro && <p>Carregando…</p>}

      {data && (
        <>
          <div className="dashboard-grid">
            <div className="dcard">
              <div className="label">AIHs diabetes</div>
              <div className="value">{formatNumber(data.kpis.total_aihs)}</div>
              <div className="trend">↑ indicador principal</div>
            </div>
            <div className="dcard">
              <div className="label">Óbitos</div>
              <div className="value">{formatNumber(data.kpis.obitos)}</div>
              <div className="trend">mortalidade</div>
            </div>
            <div className="dcard">
              <div className="label">Custo total</div>
              <div className="value">{formatMoney(data.kpis.custo_total)}</div>
              <div className="trend">impacto econômico</div>
            </div>
            <div className="dcard">
              <div className="label">Permanência média</div>
              <div className="value">
                {data.kpis.permanencia_media?.toFixed(2) ?? "—"} dias
              </div>
              <div className="trend">indicador hospitalar</div>
            </div>
          </div>

          <div className="panels">
            <div className="panel">
              <div className="panel-head">
                <h3>Evolução das internações (Mês a Mês)</h3>
              </div>
              <Plot
                data={data.fig_evolucao.data}
                layout={{ ...data.fig_evolucao.layout, autosize: true }}
                useResizeHandler
                style={{ width: "100%", height: "260px" }}
                config={{ displayModeBar: false }}
              />
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Distribuição por Complicação</h3>
              </div>
              <Plot
                data={data.fig_complicacoes.data}
                layout={{ ...data.fig_complicacoes.layout, autosize: true }}
                useResizeHandler
                style={{ width: "100%", height: "260px" }}
                config={{ displayModeBar: false }}
              />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
