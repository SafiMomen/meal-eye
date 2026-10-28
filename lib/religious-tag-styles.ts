import type { DisplayReligiousTag } from "./dietary-preferences";

export const religiousTagColors: Record<DisplayReligiousTag, string> = {
  Halal: "bg-emerald-400/20 text-emerald-300",
  Haram: "bg-red-400/20 text-red-300",
  "Halal?": "bg-zinc-400/20 text-zinc-300",
  Kosher: "bg-blue-400/20 text-blue-300",
  "Non-Kosher": "bg-amber-400/20 text-amber-300",
};

export const religiousTagTextColors: Record<DisplayReligiousTag, string> = {
  Halal: "text-emerald-300",
  Haram: "text-red-300",
  "Halal?": "text-zinc-300",
  Kosher: "text-blue-300",
  "Non-Kosher": "text-amber-300",
};
