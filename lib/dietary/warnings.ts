import type { DietaryTag } from "../../types/dietary.ts";

export function hasDietaryWarning(tags: readonly DietaryTag[]): boolean {
  return tags.some(
    (tag) => tag === "Haram" || tag === "Non-Kosher" || tag === "Restricted",
  );
}
