import type {
  DietaryPreferences,
  DisplayReligiousTag,
  ReligiousTag,
} from "../../types/dietary.ts";

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
