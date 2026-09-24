import Layout from "../layout/Layout.jsx";

export default function Placeholder({ title, subtitle }) {
  return (
    <Layout title={title} subtitle={subtitle}>
      <div className="panel">
        <p>
          Endpoint ainda não implementado no backend (ver TODO em{" "}
          <code>dashboard/api/api_views.py</code>). Assim que a view existir,
          troque este <code>&lt;Placeholder /&gt;</code> por{" "}
          <code>&lt;FigurePage endpoint="/xxx/" /&gt;</code> no{" "}
          <code>App.jsx</code>.
        </p>
      </div>
    </Layout>
  );
}
