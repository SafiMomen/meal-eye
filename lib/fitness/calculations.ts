import type { FitnessProfile, FoodLogTotals } from "../../types/fitness.ts";

// PAL categories from the National Academies' 2023 Dietary Reference Intakes.
export const ACTIVITY_LEVELS = {
  inactive: { label: "Mostly seated", multiplier: 1.4 },
  light: { label: "Lightly active", multiplier: 1.6 },
  active: { label: "Active", multiplier: 1.75 },
  "very-active": { label: "Very active", multiplier: 2.05 },
} as const;

const MIFFLIN_COEFFICIENTS = { weight: 10, height: 6.25, age: 5 };
const FORMULA_OFFSETS = { male: 5, female: -161 };
export const KILOGRAMS_PER_POUND = 0.45359237;
export const CENTIMETERS_PER_INCH = 2.54;
export const INCHES_PER_FOOT = 12;

/** Mifflin–St Jeor resting estimate times a selected activity multiplier. */
export function estimateDailyCalories(profile: FitnessProfile): number {
  const restingCalories =
    MIFFLIN_COEFFICIENTS.weight * profile.weightKg +
    MIFFLIN_COEFFICIENTS.height * profile.heightCm -
    MIFFLIN_COEFFICIENTS.age * profile.age +
    FORMULA_OFFSETS[profile.formulaSex];
  return Math.max(
    0,
    restingCalories * ACTIVITY_LEVELS[profile.activityLevel].multiplier,
  );
}

export function formatCalories(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function calculateRemainingCalories(
  dailyEstimate: number | null,
  totals: FoodLogTotals,
): number | null {
  return dailyEstimate === null || totals.unknownCalorieItems > 0
    ? null
    : Math.round(dailyEstimate) - Math.round(totals.calories);
}
