import type { DietaryTag } from "../../types/dietary.ts";

const ABBREVIATED_TAG_LABELS: Record<DietaryTag, string> = {
  Halal: "H",
  "Halal?": "H",
  Haram: "H",
  Kosher: "K",
  "Non-Kosher": "NK",
  Restricted: "R",
};

export function getDietaryTagLabel(
  tag: DietaryTag,
  abbreviated = false,
): string {
  if (abbreviated) {
    return ABBREVIATED_TAG_LABELS[tag];
  }

  return tag === "Halal?" ? "Halal" : tag;
}
