import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/skeleton";
import { useApi } from "@/hooks/use-api";
import { useScrolled } from "@/hooks/use-scrolled";
import { DATASET } from "@/routes/pages";
import type { Figure, OverviewResponse } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatCompact, formatMoney, formatNumber } from "@/utils/format";

/*
 * Site público do QuadLab, recriado a partir do protótipo
 * (web_app/dashboard/templates/teste/quadlab_moderno.html) com os
 * mesmos espaçamentos e cores. Os números vêm de /api/overview/ em vez
 * dos valores fixos do protótipo.
 */

const DASHBOARD = "/dashboard";

const NAV = [
  { href: "#projeto", label: "O projeto" },
  { href: "#descobertas", label: "O que analisamos" },
  { href: "#metodologia", label: "Metodologia" },
  { href: "#achados", label: "Achados" },
  { href: "#sobre", label: "Sobre" },
];

// Iniciativa e propósito do projeto (documentação no Notion).
const ABOUT = [
  {
    step: "01 — INICIATIVA",
    title: "Nasceu na Fábrica de Software",
    text: "O projeto foi desenvolvido na disciplina de Fábrica de Software, com a proposta de usar dados do DATASUS para criar uma solução de análise de dados voltada à saúde. Com o Diabetes Mellitus como tema, os dados foram organizados e tratados para construir indicadores e visualizações sobre as internações hospitalares relacionadas à doença no Brasil.",
  },
  {
    step: "02 — PROPÓSITO",
    title: "Uma visão ampla do impacto",
    text: "Proporcionar uma visão ampla do impacto do Diabetes Mellitus nas internações hospitalares, com recursos visuais que facilitam a identificação de padrões e diferenças: distribuição territorial e custos, panorama epidemiológico, perfil dos pacientes, complicações por CID-10, faixas etárias e mortalidade.",
  },
];

// Dimensões exploradas nos dados, que viraram os filtros do dashboard.
const DIMENSIONS = ["Ano", "Gênero", "Etnia", "Região", "UF de residência", "Município de atendimento", "Faixa etária"];

const TEAM = [
  "Tauane Carolina Oliveira Miranda dos Santos",
  "Amanda Lorena Ajaujo",
  "Victor Alves Farias",
  "Guilherme Esteves",
  "Marcos Vinicius Guimarães",
];
const COLLABORATOR = "Amanda Andrade";

const DISCOVERIES = [
  { title: "Onde estão?", text: "Distribuição das internações por região, estado e município.", link: "Distribuição territorial", to: "/criticidade" },
  { title: "Quem são?", text: "Perfil dos pacientes segundo faixa etária e gênero.", link: "Perfil demográfico", to: "/demografia" },
  { title: "O que acontece?", text: "Gravidade, complicações e mortalidade associadas às internações.", link: "Perfil clínico", to: "/complicacoes" },
  { title: "Como evolui?", text: "Comportamento das internações e dos indicadores ao longo do tempo.", link: "Panorama epidemiológico", to: "/panorama" },
  { title: "Quanto custa?", text: "Custos das internações, permanência hospitalar e impacto econômico.", link: "Impacto econômico", to: "/dashboard" },
];

// Origem dos dados e processo ETL (documentação no Notion).
const METHOD = [
  {
    step: "01 — FONTE",
    title: "SIH/SUS",
    text: "Registros das Autorizações de Internação Hospitalar (AIHs) financiadas pelo SUS, na base tratada e enriquecida pela Fiocruz e disponibilizada pela PCDaS. Recorte: diagnósticos E10 a E14 da CID-10 e suas complicações.",
  },
  {
    step: "02 — EXTRAÇÃO",
    title: "Microdados do DATASUS",
    text: "Download, no servidor FTP do DATASUS, dos arquivos .dbc com os microdados do SIH/SUS de cada estado, ano e mês — processo reexecutado a cada novo período disponível.",
  },
  {
    step: "03 — TRANSFORMAÇÃO",
    title: "Decodificação",
    text: "Decodificação e enriquecimento dos dados de acordo com o dicionário de dados do SIH/SUS, com processamento no Excel e no Power Query.",
  },
  {
    step: "04 — VISUALIZAÇÃO",
    title: "Painéis interativos",
    text: "Indicadores e gráficos organizados por território, perfil dos pacientes, complicações e mortalidade, com filtros para comparar diferentes recortes.",
  },
];

const PRIMARY_SHADOW = "shadow-[0_7px_18px_rgba(18,184,166,0.22)]";

/* ----------------------------------------------------------------------- */

/**
 * Nav fixa sobre o hero. No topo da página fica transparente; ao rolar,
 * ganha o fundo translúcido com borda e sombra do protótipo.
 */
function Header() {
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-3.5 z-50 mx-auto flex w-[calc(100%-28px)] max-w-[1180px] items-center justify-between rounded-[18px] border py-3.25 pr-5 pl-6 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-white/90 bg-white/82 shadow-card backdrop-blur-[18px]"
          : "border-transparent bg-transparent shadow-none",
      )}
    >
      <Link to="/" aria-label="QuadLab — início">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-7 nav:flex">
        {NAV.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="text-[13px] font-semibold text-muted transition-colors hover:text-brand"
          >
            {label}
          </a>
        ))}
      </nav>
      <Button asChild size="lg" className={PRIMARY_SHADOW}>
        <Link to={DASHBOARD}>Acessar análise →</Link>
      </Button>
    </header>
  );
}

/** Pontos das duas linhas do mini-gráfico, escalados para o viewBox 460×150. */
function sparkline(figure: Figure) {
  // fig_evolucao do /overview/: [AIHs diabetes, AIHs graves, Óbitos].
  const [totalTrace, severeTrace] = figure.data;
  const months = totalTrace?.x?.length ?? 0;
  const total = totalTrace?.y ?? [];
  const severe = severeTrace?.y ?? [];

  const all = [...total, ...severe];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const x = (i: number) => 10 + (i * 440) / Math.max(1, months - 1);
  const y = (v: number) => 125 - ((v - min) / Math.max(1, max - min)) * 85;
  const points = (values: number[]) => values.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return {
    total: points(total),
    severe: points(severe),
    last: { cx: x(months - 1), cy: y(total[months - 1] ?? 0) },
  };
}

function Preview({ data }: { data: OverviewResponse | null }) {
  const kpis = data?.kpis;
  const line = data ? sparkline(data.fig_evolucao) : null;
  const items = [
    { value: formatCompact(kpis?.aihs), label: "AIHs analisadas" },
    { value: formatNumber(kpis?.obitos), label: "óbitos" },
    { value: formatMoney(kpis?.custo_total, { compact: true }), label: "custo total" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-line bg-white p-6 shadow-[0_28px_70px_rgba(16,24,40,0.10)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#12b8a6,#6f8cff)]" />
      <div className="mb-4.5 flex justify-between text-[10px] font-extrabold tracking-[1.2px] text-faint">
        <span>QUADLAB / VISÃO GERAL</span>
        <span>SIHSUS</span>
      </div>
      <div className="mb-4.5 text-[22px] font-extrabold tracking-[-0.5px]">Panorama das internações</div>

      <div className="grid grid-cols-3 gap-2.5">
        {items.map(({ value, label }) => (
          <div key={label} className="rounded-[15px] border border-line bg-subtle p-3.5">
            {kpis ? (
              <b className="block text-xl tabular-nums">{value}</b>
            ) : (
              <Skeleton className="my-1.5 h-5 w-16" />
            )}
            <span className="text-[10px] text-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-3.75">
        <div className="mb-2.25 flex justify-between text-[11px] font-bold text-muted">
          <span>Evolução das internações</span>
          <span>{DATASET.period}</span>
        </div>
        <svg viewBox="0 0 460 150" role="img" aria-label="Evolução mensal das internações e dos casos graves">
          <line x1="0" y1="130" x2="460" y2="130" stroke="#e2e8f0" />
          <line x1="0" y1="85" x2="460" y2="85" stroke="#f1f5f9" />
          {line && (
            <>
              <polyline points={line.total} fill="none" stroke="#0d9488" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={line.severe} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={line.last.cx} cy={line.last.cy} r="5" fill="#0d9488" />
            </>
          )}
        </svg>
        <div className="mt-2.5 flex justify-center gap-4.5 text-[10px] text-muted">
          <span className="flex items-center gap-1.25">
            <i className="size-1.75 rounded-full bg-[#0d9488]" />
            Internações
          </span>
          <span className="flex items-center gap-1.25">
            <i className="size-1.75 rounded-full bg-[#f43f5e]" />
            Casos graves
          </span>
        </div>
      </div>
    </div>
  );
}

function Hero({ data }: { data: OverviewResponse | null }) {
  return (
    <div className="mx-auto grid min-h-svh max-w-[1180px] content-center items-center gap-18 px-6 pt-32 pb-16 wide:grid-cols-[1fr_0.95fr]">
      <div>
        <div className="w-fit rounded-full bg-[#d9faf5] px-3 py-1.75 text-[11px] font-extrabold tracking-[1.5px] text-brand-strong uppercase">
          Análise de dados em saúde
        </div>
        <h1 className="mt-5 text-[42px] leading-[1.03] font-extrabold tracking-[-2.7px] sm:text-[clamp(44px,5.5vw,66px)]">
          Diabetes Mellitus em dados.
        </h1>
        <p className="mt-5.5 max-w-[570px] text-[17px] leading-[1.75] text-muted">
          O QuadLab transforma dados públicos do SIHSUS em informações visuais para compreender as
          internações hospitalares relacionadas ao Diabetes Mellitus no Brasil — onde acontecem, quem
          são os pacientes e o impacto no sistema de saúde.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className={PRIMARY_SHADOW}>
            <a href="#descobertas">Explorar os dados ↓</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-white shadow-none hover:border-[#cdd5df] hover:bg-white">
            <Link to={DASHBOARD}>Acessar dashboards</Link>
          </Button>
        </div>
      </div>
      <Preview data={data} />
    </div>
  );
}

/** `.section` do protótipo; `alt` é a faixa branca de largura total com bordas. */
function Section({
  id,
  alt,
  title,
  text,
  children,
}: {
  id?: string;
  alt?: boolean;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      <div className={cn("mx-auto max-w-[700px] text-center", children && "mb-12")}>
        <h2 className="mb-3 text-[34px] leading-tight font-extrabold tracking-[-1.3px]">{title}</h2>
        <p className="text-base leading-[1.75] text-muted">{text}</p>
      </div>
      {children}
    </>
  );

  return alt ? (
    <section id={id} className="scroll-mt-28 border-y border-line bg-white px-6 py-22">
      <div className="mx-auto max-w-[1132px]">{body}</div>
    </section>
  ) : (
    <section id={id} className="mx-auto max-w-[1180px] scroll-mt-28 px-6 py-22">
      {body}
    </section>
  );
}

function Discoveries() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 wide:grid-cols-5">
      {DISCOVERIES.map((item, i) => (
        <Link
          key={item.title}
          to={item.to}
          className="rounded-[18px] border border-line bg-white p-5.5 transition duration-250 hover:-translate-y-1.5 hover:border-[#b9ebe5] hover:shadow-[0_12px_32px_rgba(16,24,40,0.07)]"
        >
          <div className="mb-4.25 flex size-8.5 items-center justify-center rounded-[10px] bg-[#d9faf5] text-xs font-extrabold text-brand-strong">
            {String(i + 1).padStart(2, "0")}
          </div>
          <h3 className="mb-2 text-base font-bold">{item.title}</h3>
          <p className="text-xs leading-[1.6] text-muted">{item.text}</p>
          <span className="mt-3.75 inline-block text-[11px] font-extrabold text-brand-strong">
            {item.link} →
          </span>
        </Link>
      ))}
    </div>
  );
}

function Findings({ data }: { data: OverviewResponse | null }) {
  const kpis = data?.kpis;
  const items = [
    { value: formatCompact(kpis?.aihs), text: "AIHs relacionadas ao Diabetes Mellitus." },
    { value: formatNumber(kpis?.obitos), text: "óbitos registrados no conjunto." },
    {
      value: `${formatNumber(kpis?.permanencia_media, { maximumFractionDigits: 2 })} dias`,
      text: "média de permanência hospitalar.",
    },
    { value: formatMoney(kpis?.custo_medio), text: "custo médio por internação." },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 nav:grid-cols-4">
      {items.map(({ value, text }) => (
        <div key={text} className="rounded-[18px] border border-line bg-canvas px-5 py-7">
          {kpis ? (
            <b className="block text-[34px] leading-tight font-extrabold tracking-[-1px] text-brand-strong tabular-nums">
              {value}
            </b>
          ) : (
            <Skeleton className="h-10 w-32" />
          )}
          <span className="mt-1.75 block text-xs text-muted">{text}</span>
        </div>
      ))}
    </div>
  );
}

function Method() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 wide:grid-cols-4">
      {METHOD.map(({ step, title, text }) => (
        <div key={step} className="rounded-[18px] border border-line bg-white p-7 shadow-card">
          <div className="mb-3 text-[11px] font-extrabold text-brand-strong">{step}</div>
          <h3 className="mb-2 text-lg font-bold">{title}</h3>
          <p className="text-[13px] leading-[1.6] text-muted">{text}</p>
        </div>
      ))}
    </div>
  );
}

function Access() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-22">
      <div className="relative mx-auto flex max-w-[1132px] flex-col items-stretch gap-8.75 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0f172a,#172033)] px-6.5 py-8.75 text-center text-white sm:flex-row sm:items-center sm:justify-between sm:p-12 sm:text-left">
        <div className="pointer-events-none absolute -top-30 -right-20 size-80 rounded-full bg-brand opacity-24 blur-[85px]" />
        <div className="relative z-10">
          <h2 className="text-[29px] leading-tight font-bold tracking-[-1px]">
            Quer investigar os dados em profundidade?
          </h2>
          <p className="mt-2 text-sm text-faint">
            Acesse a área de análise para explorar os indicadores com filtros por território, perfil e período.
          </p>
        </div>
        <Button asChild size="lg" className="relative z-10 bg-white text-ink shadow-none hover:bg-white">
          <Link to={DASHBOARD}>Acessar dashboards →</Link>
        </Button>
      </div>
    </section>
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

/** Iniciativa, propósito, dimensões e equipe, no mesmo visual dos cards da Metodologia. */
function About() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 nav:grid-cols-2">
        {ABOUT.map(({ step, title, text }) => (
          <div key={step} className="rounded-[18px] border border-line bg-canvas p-7">
            <div className="mb-3 text-[11px] font-extrabold text-brand-strong">{step}</div>
            <h3 className="mb-2 text-lg font-bold">{title}</h3>
            <p className="text-[13px] leading-[1.7] text-muted">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <div className="text-[11px] font-extrabold tracking-[1.5px] text-faint uppercase">Dimensões exploradas nos dados</div>
        <div className="mt-3.5 flex flex-wrap justify-center gap-2">
          {DIMENSIONS.map((d) => (
            <span key={d} className="rounded-full bg-[#d9faf5] px-3.5 py-1.75 text-xs font-bold text-brand-strong">
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-[26px] leading-tight font-extrabold tracking-[-1px]">Quem fez</h3>
        <p className="mt-2 text-sm text-muted">Equipe do projeto na disciplina de Fábrica de Software.</p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 wide:grid-cols-5">
        {TEAM.map((name) => (
          <div
            key={name}
            className="flex flex-col items-center rounded-[18px] border border-line bg-canvas px-4 py-6 text-center transition duration-250 hover:-translate-y-1 hover:border-[#b9ebe5]"
          >
            <span className="grid size-14 place-items-center rounded-full bg-[linear-gradient(135deg,#12b8a6,#6f8cff)] text-base font-extrabold text-white shadow-[0_8px_20px_rgba(18,184,166,0.25)]">
              {initials(name)}
            </span>
            <span className="mt-3.5 text-[13px] leading-snug font-bold">{name}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Em colaboração com <strong className="text-ink">{COLLABORATOR}</strong>.
      </p>
    </>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-2 px-6 py-8.5 text-[11px] font-semibold text-faint">
      <span>QuadLab · Projeto acadêmico</span>
      <span>Dados: DATASUS / SIH/SUS · Fiocruz / PCDaS</span>
    </footer>
  );
}

export default function Landing() {
  // Sem a API os números aparecem como esqueleto; o resto da página funciona.
  const { data } = useApi<OverviewResponse>("/overview/");

  return (
    <>
      <Header />
      <Hero data={data} />

      <Section
        id="projeto"
        alt
        title="Transformar dados em perguntas."
        text="O objetivo do projeto é tornar uma base extensa de internações hospitalares mais fácil de interpretar. Em vez de apenas apresentar números, o QuadLab organiza os dados para permitir comparações territoriais, demográficas, clínicas e econômicas."
      />

      <Section
        id="descobertas"
        title="O que podemos descobrir?"
        text="O site apresenta os principais eixos da análise. Os dashboards completos ficam disponíveis na área restrita."
      >
        <Discoveries />
      </Section>

      <Section
        id="achados"
        alt
        title="Principais achados"
        text={`Uma prévia dos indicadores apresentados nos dashboards, calculada a partir da base atual (${DATASET.source} · ${DATASET.region}, ${DATASET.period}).`}
      >
        <Findings data={data} />
      </Section>

      <Section
        id="metodologia"
        title="Como os dados foram tratados?"
        text="Da fonte pública até os painéis interativos: de onde vêm os dados e o processo ETL aplicado."
      >
        <Method />
      </Section>

      <Section
        id="sobre"
        alt
        title="Sobre o projeto"
        text="Por que o QuadLab existe, o que ele busca mostrar e quem está por trás dele."
      >
        <About />
      </Section>

      <Access />
      <Footer />
    </>
  );
}
