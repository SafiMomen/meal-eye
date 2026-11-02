import { DEFAULT_CALORIE_RANGE, CALORIE_SLIDER_MAXIMUM } from "./calories.ts";
import { DEFAULT_DIETARY_PREFERENCES } from "./preferences.ts";
import { DIETARY_RESTRICTIONS } from "./restriction-identifiers.ts";
import type { CalorieRange, DietarySettings } from "../../types/dietary.ts";

export const DIETARY_SETTINGS_STORAGE_KEY = "meal-eye:dietary-settings:v1";

export const DEFAULT_DIETARY_SETTINGS: DietarySettings = {
  preferences: DEFAULT_DIETARY_PREFERENCES,
  selectedRestrictions: [],
  hideUnwantedMeals: false,
  calorieRange: DEFAULT_CALORIE_RANGE,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readCalorieRange(value: unknown): CalorieRange {
  if (!isRecord(value)) {
    return DEFAULT_CALORIE_RANGE;
  }

  const { minimum, maximum } = value;
  if (
    typeof minimum !== "number" ||
    !Number.isFinite(minimum) ||
    minimum < 0 ||
    minimum > CALORIE_SLIDER_MAXIMUM
  ) {
    return DEFAULT_CALORIE_RANGE;
  }

  if (
    maximum !== null &&
    (typeof maximum !== "number" ||
      !Number.isFinite(maximum) ||
      maximum < minimum ||
      maximum >= CALORIE_SLIDER_MAXIMUM)
  ) {
    return DEFAULT_CALORIE_RANGE;
  }

  return { minimum, maximum };
}

/** Preserve explicit false/empty values and ignore malformed saved fields. */
export function parseDietarySettings(
  serialized: string | null,
): DietarySettings {
  if (!serialized) {
    return DEFAULT_DIETARY_SETTINGS;
  }

  let saved: unknown;
  try {
    saved = JSON.parse(serialized);
  } catch {
    return DEFAULT_DIETARY_SETTINGS;
  }

  if (!isRecord(saved) || saved.version !== 1) {
    return DEFAULT_DIETARY_SETTINGS;
  }

  const preferences = isRecord(saved.preferences) ? saved.preferences : {};
  const restrictions = Array.isArray(saved.selectedRestrictions)
    ? saved.selectedRestrictions
    : [];

  return {
    preferences: {
      muslim:
        typeof preferences.muslim === "boolean"
          ? preferences.muslim
          : DEFAULT_DIETARY_PREFERENCES.muslim,
      jewish:
        typeof preferences.jewish === "boolean"
          ? preferences.jewish
          : DEFAULT_DIETARY_PREFERENCES.jewish,
    },
    selectedRestrictions: DIETARY_RESTRICTIONS.filter((restriction) =>
      restrictions.includes(restriction),
    ),
    hideUnwantedMeals: saved.hideUnwantedMeals === true,
    calorieRange: readCalorieRange(saved.calorieRange),
  };
}

export function serializeDietarySettings(settings: DietarySettings): string {
  return JSON.stringify({ version: 1, ...settings });
}
