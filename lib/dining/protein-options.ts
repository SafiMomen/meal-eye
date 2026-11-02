import { getFoodDietaryStatus } from "../dietary/food-status.ts";
import { DEFAULT_CALORIE_RANGE } from "../dietary/calories.ts";
import { findMenuPeriod } from "./menu-periods.ts";
import type {
  DiningMenu,
  HighProteinFood,
  MealPeriod,
} from "../../types/dining.ts";
import type {
  DietaryPreferences,
  DietaryRestriction,
  CalorieRange,
} from "../../types/dietary.ts";

export const HIGH_PROTEIN_THRESHOLD_GRAMS = 20;

/** Send only qualifying items and the metadata needed for client preferences. */
export function getHighProteinFoods(
  menu: DiningMenu,
  selectedMeal: MealPeriod,
  isWeekend = false,
): HighProteinFood[] {
  const period = findMenuPeriod(menu, selectedMeal, isWeekend);

  if (!period) {
    return [];
  }

  return Object.values(period[1])
    .flat()
    .flatMap((food) => {
      const { proteinGrams } = food;

      if (
        proteinGrams === null ||
        !Number.isFinite(proteinGrams) ||
        proteinGrams < HIGH_PROTEIN_THRESHOLD_GRAMS
      ) {
        return [];
      }

      return [
        {
          foodName: food.foodName,
          calories: food.calories,
          proteinGrams,
          religiousTags: food.religiousTags,
          ingredients: food.ingredients,
          allergens: food.allergens,
        },
      ];
    });
}

/** Match the cards' active warning rules without implying dietary certification. */
export function getEligibleHighProteinFoods(
  foods: readonly HighProteinFood[],
  preferences: DietaryPreferences,
  selectedRestrictions: readonly DietaryRestriction[],
  calorieRange: CalorieRange = DEFAULT_CALORIE_RANGE,
): HighProteinFood[] {
  return foods.filter(
    (food) =>
      !getFoodDietaryStatus(
        food,
        preferences,
        selectedRestrictions,
        calorieRange,
      ).shouldAvoid,
  );
}
