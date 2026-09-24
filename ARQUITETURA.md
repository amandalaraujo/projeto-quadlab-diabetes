# Nova arquitetura do QuadLab

Migração do monólito Django (templates + Chart.js) para:

- **Backend**: Django + Django REST Framework, só como API. Continua com o
  mesmo Postgres no Neon (`DATABASE_URL` no `.env`, igual já estava).
- **Gráficos**: gerados em Python com **Plotly** (`plotly.graph_objects`)
  dentro das views da API (`web_app/dashboard/api/api_views.py`) e
  devolvidos como JSON (`fig.to_plotly_json()`).
- **Frontend**: aplicação React separada em `frontend/` (Vite), que
  consome a API e renderiza as figuras com `react-plotly.js`.

As views antigas em `web_app/dashboard/views.py` + templates continuam no
repo por enquanto (rodando em paralelo em `/dashboard/...`), pra vocês
comparar/migrar aos poucos. Podem ser apagadas quando o React cobrir tudo.

## Rodando o backend (API)

```bash
cd web_app
pip install -r ../requirements.txt   # ou pip install -r requirements.txt, dependendo de onde ele ficar
python manage.py runserver
```

A API sobe em `http://127.0.0.1:8000/api/...` (ex: `/api/overview/`).
O `.env` com `DATABASE_URL` do Neon continua igual, na raiz do projeto.

## Rodando o frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://127.0.0.1:5173`. Em dev, o Vite já faz proxy de
`/api/*` pro Django em `:8000` (configurado em `vite.config.js`), então
não precisa mexer em CORS pra desenvolver localmente — o
`django-cors-headers` já está configurado em `settings.py` para quando
vocês quiserem rodar os dois em portas/domínios diferentes sem proxy
(ex: deploy).

## Endpoints da API já implementados

| Página (React)      | Endpoint             | View                    |
|----------------------|-----------------------|--------------------------|
| Visão geral           | `/api/overview/`      | `OverviewAPIView`        |
| Onde estão?           | `/api/territory/`     | `TerritoryAPIView`       |
| Quem são?             | `/api/demographic/`   | `DemographicAPIView`     |
| Impacto econômico     | `/api/economic/`      | `EconomicAPIView`        |

## Faltam implementar (mesmo padrão)

- Mortalidade
- Complicações e CID-10
- Evolução das AIHs

O padrão está comentado no fim de `api_views.py`: consulta agregada via
ORM → `go.Figure(...)` → `fig.to_plotly_json()` na `Response`. No
frontend, basta trocar o `<Placeholder />` correspondente em `App.jsx`
por `<FigurePage endpoint="/mortality/" ... />` (ou copiar
`Overview.jsx` se a página precisar de KPIs também, não só gráficos).
