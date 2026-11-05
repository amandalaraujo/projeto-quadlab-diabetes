import { useMemo, useState, type MutableRefObject } from "react";
import { MapPin, Search, X } from "lucide-react";
import Plotly from "plotly.js-dist-min";
import type { Data } from "plotly.js";
import type { Trace } from "@/types/api";
import { formatNumber } from "@/utils/format";

interface Place {
  name: string;
  lat: number;
  lon: number;
  /** AIHs por camada do mapa (ex.: Residência / Internação). */
  layers: Array<{ layer: string; aihs: number }>;
}

interface MapView {
  center: { lat: number; lon: number };
  zoom: number;
}

const LABEL_META = "map-search-marker";
const MAX_RESULTS = 8;

/** Sem acento e minúsculo, para "sao paulo" achar "São Paulo". */
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/**
 * Lê os municípios dos traços de mapa do backend (`bolhas()` em api_views.py):
 * customdata = [município, AIHs, óbitos].
 */
function placesFrom(traces: Trace[]): Place[] {
  const byName = new Map<string, Place>();
  for (const trace of traces) {
    const lat = trace.lat as number[] | undefined;
    const lon = trace.lon as number[] | undefined;
    const custom = trace.customdata as Array<[string, number, number]> | undefined;
    if (!lat || !lon || !custom) continue;
    custom.forEach(([name, aihs], i) => {
      const key = `${name}|${lat[i].toFixed(2)}|${lon[i].toFixed(2)}`;
      const place = byName.get(key) ?? { name, lat: lat[i], lon: lon[i], layers: [] };
      place.layers.push({ layer: trace.name ?? "", aihs });
      byName.set(key, place);
    });
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

interface MapSearchProps {
  traces: Trace[];
  graphRef: MutableRefObject<HTMLDivElement | null>;
  /** Enquadramento original, para o botão de limpar. */
  home: MapView;
}

/** Campo sobre o mapa: busca um município, centraliza o mapa nele e mostra os números. */
export function MapSearch({ traces, graphRef, home }: MapSearchProps) {
  const places = useMemo(() => placesFrom(traces), [traces]);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Place | null>(null);

  const results = useMemo(() => {
    const t = normalize(term.trim());
    if (!t) return [];
    return places.filter((p) => normalize(p.name).includes(t)).slice(0, MAX_RESULTS);
  }, [places, term]);

  // Remove o marcador da busca anterior (se o gráfico ainda o tiver).
  const removeLabel = (el: HTMLDivElement) => {
    const data = (el as unknown as { data?: Array<{ meta?: string }> }).data ?? [];
    const index = data.findIndex((t) => t.meta === LABEL_META);
    if (index >= 0) return Plotly.deleteTraces(el, index);
  };

  const select = async (place: Place) => {
    setSelected(place);
    setTerm(place.name);
    setOpen(false);
    const el = graphRef.current;
    if (!el) return;
    await Plotly.relayout(el, { "map.center": { lat: place.lat, lon: place.lon }, "map.zoom": 9.5 } as never);
    await removeLabel(el);
    // Marcador em anel sobre o município (camada de pontos; texto em mapa exige fontes do estilo).
    await Plotly.addTraces(el, {
      type: "scattermap",
      meta: LABEL_META,
      lat: [place.lat, place.lat],
      lon: [place.lon, place.lon],
      mode: "markers",
      marker: { size: [36, 10], color: ["rgba(240, 68, 97, 0.25)", "#f04461"] },
      hoverinfo: "skip",
      showlegend: false,
    } as unknown as Data);
  };

  const clear = async () => {
    setSelected(null);
    setTerm("");
    const el = graphRef.current;
    if (!el) return;
    await removeLabel(el);
    await Plotly.relayout(el, { "map.center": home.center, "map.zoom": home.zoom } as never);
  };

  return (
    <div className="absolute top-3 left-3 z-10 w-64 max-w-[calc(100%-1.5rem)]">
      <div className="relative">
        <label className="flex items-center gap-2 rounded-lg border border-line bg-surface/95 px-2.5 shadow-card backdrop-blur">
          <Search className="size-3.5 shrink-0 text-faint" />
          <input
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) void select(results[0]);
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Buscar município no mapa"
            aria-label="Buscar município no mapa"
            className="h-8 w-full bg-transparent text-xs text-ink outline-none placeholder:text-faint"
          />
          {(term || selected) && (
            <button type="button" onClick={() => void clear()} aria-label="Limpar busca" className="text-faint hover:text-ink">
              <X className="size-3.5" />
            </button>
          )}
        </label>

        {open && term && !selected && (
          <ul className="absolute inset-x-0 top-full mt-1 max-h-64 overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-pop">
            {results.map((p) => (
              <li key={`${p.name}${p.lat}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void select(p)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs text-ink hover:bg-canvas"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 text-faint tabular-nums">
                    {formatNumber(p.layers.reduce((n, l) => Math.max(n, l.aihs), 0))} AIHs
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && <li className="px-2 py-2 text-center text-xs text-faint">Município não está no mapa</li>}
          </ul>
        )}
      </div>

      {selected && (
        <div className="mt-1.5 rounded-lg border border-line bg-surface/95 px-3 py-2 text-xs shadow-card backdrop-blur">
          <div className="flex items-center gap-1.5 font-bold text-ink">
            <MapPin className="size-3.5 text-coral" />
            {selected.name}
          </div>
          {selected.layers.map((l) => (
            <div key={l.layer} className="mt-0.5 text-muted tabular-nums">
              {traces.length > 1 && `${l.layer}: `}
              <strong className="text-ink">{formatNumber(l.aihs)}</strong> AIHs
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
