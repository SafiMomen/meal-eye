import type {
  FoodLogEntry,
  FoodLogTotals,
  LoggableFood,
} from "../../types/fitness.ts";

export const MINIMUM_PORTIONS = 1;
export const PORTION_STEP = 1;
export const MAXIMUM_PORTIONS = 15;

export function isValidPortions(portions: number): boolean {
  return (
    Number.isFinite(portions) &&
    portions >= MINIMUM_PORTIONS &&
    portions <= MAXIMUM_PORTIONS &&
    Number.isInteger(portions / PORTION_STEP)
  );
}

export function getFoodLogId(food: LoggableFood): string {
  return JSON.stringify([
    food.sourceLabel,
    food.foodName,
    food.servingSize,
    food.caloriesPerPortion,
    food.proteinPerPortion,
  ]);
}

export function addFoodPortion(
  entries: readonly FoodLogEntry[],
  food: LoggableFood,
): FoodLogEntry[] {
  const id = getFoodLogId(food);
  const existing = entries.find((entry) => entry.id === id);
  if (existing)
    return entries.map((entry) =>
      entry.id === id
        ? { ...entry, portions: Math.min(MAXIMUM_PORTIONS, entry.portions + 1) }
        : entry,
    );
  return [...entries, { ...food, id, portions: 1 }];
}

export function updateFoodPortions(
  entries: readonly FoodLogEntry[],
  id: string,
  portions: number,
): FoodLogEntry[] {
  if (!isValidPortions(portions)) return [...entries];
  return entries.map((entry) =>
    entry.id === id ? { ...entry, portions } : entry,
  );
}

export function totalFoodLog(entries: readonly FoodLogEntry[]): FoodLogTotals {
  return entries.reduce(
    (total, entry) => ({
      calories:
        total.calories + (entry.caloriesPerPortion ?? 0) * entry.portions,
      protein: total.protein + (entry.proteinPerPortion ?? 0) * entry.portions,
      unknownCalorieItems:
        total.unknownCalorieItems + Number(entry.caloriesPerPortion === null),
      unknownProteinItems:
        total.unknownProteinItems + Number(entry.proteinPerPortion === null),
    }),
    { calories: 0, protein: 0, unknownCalorieItems: 0, unknownProteinItems: 0 },
  );
}
