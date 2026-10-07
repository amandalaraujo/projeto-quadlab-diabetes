import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1.75 text-[11px] font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        outline: "border border-line bg-surface text-muted shadow-card",
        brand: "bg-brand-soft text-brand-strong",
        coral: "bg-coral-soft text-coral",
        amber: "bg-amber-soft text-[#b5760b]",
        blue: "bg-blue-soft text-blue",
        neutral: "bg-canvas text-muted",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

// forwardRef para poder ser usado como gatilho de Tooltip (asChild).
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, ...props },
  ref,
) {
  return <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
});
