import type { ComponentProps } from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/utils/cn";

interface ProgressProps extends ComponentProps<typeof ProgressPrimitive.Root> {
  /** Cor CSS do preenchimento (padrão: cor da marca). */
  color?: string;
}

/** Barra de progresso (0–100). */
export function Progress({ value = 0, color, className, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  return (
    <ProgressPrimitive.Root
      value={value}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-canvas", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </ProgressPrimitive.Root>
  );
}
