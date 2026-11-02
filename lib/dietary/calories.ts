import type {
  CalorieRange,
  CalorieRestrictionMatch,
  FoodDietaryInput,
} from "../../types/dietary.ts";

export const CALORIE_SLIDER_MAXIMUM = 2000;
export const CALORIE_SLIDER_STEP = 25;
export const DEFAULT_CALORIE_RANGE: CalorieRange = {
  minimum: 0,
  maximum: null,
};

export function isCalorieRangeActive(range: CalorieRange): boolean {
  return range.minimum > 0 || range.maximum !== null;
}

export function formatCalorieRange(range: CalorieRange): string {
  return `${range.minimum} to ${range.maximum ?? "no limit"} kcal`;
}

export function getCalorieRestriction(
  food: Pick<FoodDietaryInput, "foodName" | "calories">,
  range: CalorieRange,
): CalorieRestrictionMatch | null {
  if (!isCalorieRangeActive(range)) {
    return null;
  }

  const calories = Number.isFinite(food.calories) ? food.calories : null;
  const isWithinRange =
    calories !== null &&
    calories >= range.minimum &&
    (range.maximum === null || calories <= range.maximum);

  if (isWithinRange) {
    return null;
  }

  return {
    restriction: "Calories",
    source: "calories",
    foodName: food.foodName,
    calories,
    range,
  };
}
