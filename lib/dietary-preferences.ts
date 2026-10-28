import type { ReligiousTag } from "./dining-types";

export type DietaryPreferences = {
  muslim: boolean;
  jewish: boolean;
};

export type DisplayReligiousTag = ReligiousTag | "Halal?";

export const DEFAULT_DIETARY_PREFERENCES: DietaryPreferences = {
  muslim: true,
  jewish: true,
};

/** Display preferences do not change the food's underlying classification. */
export function getVisibleReligiousTags(
  tags: readonly ReligiousTag[],
  preferences: DietaryPreferences,
): DisplayReligiousTag[] {
  const visible: DisplayReligiousTag[] = tags.filter((tag) =>
    tag === "Halal" || tag === "Haram"
      ? preferences.muslim
      : preferences.jewish,
  );

  if (
    preferences.muslim &&
    !tags.includes("Halal") &&
    !tags.includes("Haram")
  ) {
    visible.unshift("Halal?");
  }

  return visible;
}
