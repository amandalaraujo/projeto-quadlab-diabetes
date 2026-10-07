import { Card } from "@/components/card";
import { Skeleton } from "@/components/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";

interface KpiCardProps {
  label: string;
  value: string;
  /** Valor completo mostrado num tooltip sobre o número (útil quando `value` é abreviado). */
  fullValue?: string;
  /** Texto da pílula verde abaixo do número. */
  trend?: string;
}

/** Indicador do topo do dashboard (mesmo visual do `.dcard` original). */
export function KpiCard({ label, value, fullValue, trend }: KpiCardProps) {
  const number = (
    <div className="mt-1.5 text-2xl font-extrabold tracking-[-1px] text-ink tabular-nums sm:text-[28px]">
      {value}
    </div>
  );

  return (
    <Card className="p-5">
      <div className="text-[10px] font-extrabold tracking-[0.6px] text-faint uppercase">{label}</div>

      {fullValue ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-fit cursor-default">{number}</div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            {fullValue}
          </TooltipContent>
        </Tooltip>
      ) : (
        number
      )}

      {trend && (
        <div className="mt-1.75 inline-block rounded-full bg-brand-soft px-2 py-1 text-[10px] font-extrabold text-brand-strong">
          {trend}
        </div>
      )}
    </Card>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="mt-3 h-7 w-28" />
      <Skeleton className="mt-3 h-5 w-24 rounded-full" />
    </Card>
  );
}
