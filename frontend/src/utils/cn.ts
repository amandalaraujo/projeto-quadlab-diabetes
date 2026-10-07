import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Junta classes condicionais e resolve conflitos do Tailwind (px-2 vs px-4). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
