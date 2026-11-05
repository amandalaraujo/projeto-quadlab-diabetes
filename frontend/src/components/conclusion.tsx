import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/card";
import { useFilterSummary } from "@/components/info-popover";

interface ConclusionProps {
  /** Frase de abertura com os números principais do recorte. */
  lead: ReactNode;
  /** Demais conclusões, uma por item. */
  points: ReactNode[];
}

/**
 * Card "Panorama final" no fim de cada página: as conclusões dos dados
 * (calculadas pela página a partir da resposta da API), com o recorte
 * dos filtros ativos.
 */
export function Conclusion({ lead, points }: ConclusionProps) {
  const recorte = useFilterSummary();

  return (
    <Card className="mt-3.5 overflow-hidden">
      <div className="h-1 bg-[linear-gradient(90deg,#12b8a6,#4f7cff)]" />
      <div className="p-6">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
          <Sparkles className="size-4 text-brand-strong" />
          Panorama final
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink">{lead}</p>
        {points.length > 0 && (
          <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 text-[13px] leading-relaxed text-[#475467] nav:grid-cols-2">
            {points.map((point, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 border-t border-line pt-3 text-[11px] text-faint">
          <strong className="text-muted">Recorte:</strong> {recorte}
        </p>
      </div>
    </Card>
  );
}

/** Lista "A, B, C e D" em português. */
export function joinPt(items: ReactNode[]): ReactNode {
  return items.map((item, i) => (
    <span key={i}>
      {i > 0 && (i === items.length - 1 ? " e " : ", ")}
      {item}
    </span>
  ));
}
