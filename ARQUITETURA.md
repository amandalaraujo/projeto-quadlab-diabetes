# Nova arquitetura do QuadLab

Migração do monólito Django (templates + Chart.js) para:

- **Backend**: Django + Django REST Framework, só como API. Continua com o
  mesmo Postgres no Neon (`DATABASE_URL` no `.env`, igual já estava).
- **Gráficos**: gerados em Python com **Plotly** (`plotly.graph_objects`)
  dentro das views da API (`web_app/dashboard/api/api_views.py`) e
  devolvidos como JSON (`fig.to_plotly_json()`).
- **Frontend**: aplicação React separada em `frontend/` (Vite), que
  consome a API e renderiza as figuras com o Plotly (`plotly.js-dist-min`,
  via `components/chart-card.tsx`).

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

Uma página por tela do dashboard (documentação no Notion),
na mesma ordem:

| Página (React)                          | Rota            | Endpoint              | View                   |
|------------------------------------------|-----------------|------------------------|-------------------------|
| 1. Distribuição territorial e custos     | `/dashboard`    | `/api/territory/`      | `TerritoryAPIView`      |
| 2. Panorama epidemiológico               | `/panorama`     | `/api/overview/`       | `OverviewAPIView`       |
| 3. Dispersão e municípios críticos       | `/criticidade`  | `/api/criticality/`    | `CriticalityAPIView`    |
| 4. Panorama geral das AIHs               | `/aihs`         | `/api/general/`        | `GeneralAPIView`        |
| 5. Perfil demográfico e mortalidade      | `/demografia`   | `/api/demographic/`    | `DemographicAPIView`    |
| 6. Complicações e CID-10                 | `/complicacoes` | `/api/complications/`  | `ComplicationsAPIView`  |
| 7. Padrão etário                         | `/padrao-etario`| `/api/age-pattern/`    | `AgePatternAPIView`     |
| 8. Mortalidade: procedimentos            | `/mortalidade`  | `/api/mortality/`      | `MortalityAPIView`      |
| (barra de filtros)                       | —               | `/api/filters/`        | `FiltersAPIView`        |

### Filtros globais

Todos os endpoints (menos `/api/filters/`) aceitam os mesmos filtros como
query params repetidos, um por valor: `?ano=2025&uf=SP&uf=MG&faixa=60-64a`.
Filtros: `ano`, `sexo`, `raca`, `regiao`, `uf` (residência), `municipio`
(atendimento), `faixa` (faixa etária de 5 anos) e `cid` (tipo de diabetes).
A definição fica em `web_app/dashboard/api/filters.py`. No front, o estado
dos filtros fica na URL (`hooks/use-filters.ts`), então vale para todas as
páginas e pode ser compartilhado por link.

## Adicionando uma página nova

Backend: `queryset_filtrado(request)` → consulta agregada via ORM →
`go.Figure(...)` → `fig.to_plotly_json()` na `Response` (chaves `fig_*`),
mais KPIs em `kpis` e tabelas como listas de dicts.

Frontend: crie o componente em `frontend/src/pages/` usando
`useFilteredApi` + `PageState` (veja `territory.tsx`) e adicione um item
em `frontend/src/routes/pages.ts` (com `endpoint`, para entrar no
pré-carregamento). O menu lateral e a rota saem dali. Cada `ChartCard` /
`DataTable` aceita `info` (botão "?" com como ler + interpretação
calculada a partir dos dados filtrados). No fim da página, `<Conclusion>`
com o panorama final: as conclusões dos dados do recorte (veja `territory.tsx`).

As respostas da API ficam num cache em memória por URL
(`hooks/use-api.ts`), e o `Layout` pré-carrega código e dados de todas
as páginas com os filtros atuais, então trocar de página não refaz
requisições. O cache vive até recarregar a aba.

## Frontend: TypeScript + Tailwind + Radix

```
frontend/src/
├── api/          cliente axios
├── components/   Button, Card, Badge, Tabs, Tooltip, Sheet... (Radix) + ChartCard, KpiCard
├── hooks/        useApi
├── layout/       Layout (rota pai com <Outlet />) e Sidebar
├── pages/        uma página por tela do dashboard (territory, overview, criticality...)
├── routes/       pages.ts (menu + páginas) e index.tsx (createBrowserRouter)
├── types/        formato das respostas da API
└── utils/        cn, formatação, tema do Plotly, ajustes de figuras
```

- **TypeScript** em modo `strict`; `npm run typecheck` roda o `tsc`, e
  `npm run build` checa os tipos antes de gerar o bundle.
- `/` é o site público (`pages/landing.tsx`, recriado do protótipo
  `templates/teste/quadlab_moderno.html`); a área de análise começa em
  `/dashboard`. As páginas do dashboard são carregadas sob demanda, e o
  Plotly fica num arquivo separado (`plotly-*.js`), baixado só ao abrir
  um gráfico.
- Rotas com o `createBrowserRouter` do **react-router-dom**. O título e o
  subtítulo de cada página vêm do `handle` da rota e são lidos pelo
  `Layout` via `useMatches()`.
- Estilo com **Tailwind CSS v4** (plugin `@tailwindcss/vite`). Os
  tokens de cor/fonte e os breakpoints (`nav:` 850px, `wide:` 1050px,
  iguais ao CSS original) ficam no bloco `@theme` de `src/style.css`.
- Componentes base no estilo shadcn sobre as primitivas do **Radix UI**
  (`radix-ui`).
- `utils/plotly-theme.ts` aplica o visual do dashboard nas figuras que
  vêm da API (fonte, grade, cores, números em pt-BR, sem títulos de
  eixo — a descrição do card diz o que o gráfico mede).
- Imports com alias `@/` → `src/`.
