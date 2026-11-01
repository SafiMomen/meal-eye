import type { DietaryTag } from "../../types/dietary.ts";

export const dietaryTagBadgeStyles = {
  label:
    "inline-flex shrink-0 items-center whitespace-nowrap font-semibold leading-none",
  badge: "rounded-[2px] py-0.5",
  compact: "px-1 text-[11px]",
  regular: "px-1.5 text-xs",
};

export const dietaryTagColors: Record<DietaryTag, string> = {
  Halal: "bg-emerald-400/20 text-emerald-300",
  Haram: "bg-red-400/20 text-red-300",
  "Halal?": "bg-zinc-400/20 text-zinc-300",
  Kosher: "bg-blue-400/20 text-blue-300",
  "Non-Kosher": "bg-amber-400/20 text-amber-300",
  Restricted: "bg-red-400/20 text-red-300",
};
