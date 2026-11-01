import { getVisibleReligiousTags } from "../dietary/preferences.ts";
import { getRestrictionMatches } from "../dietary/restrictions.ts";
import { hasDietaryWarning } from "../dietary/warnings.ts";
import { findMenuPeriod } from "./menu-periods.ts";
import type {
  DiningMenu,
  HighProteinFood,
  MealPeriod,
} from "../../types/dining.ts";
import type {
  DietaryPreferences,
  DietaryRestriction,
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
): HighProteinFood[] {
  return foods.filter((food) => {
    const visibleTags = getVisibleReligiousTags(
      food.religiousTags,
      preferences,
    );

    return (
      !hasDietaryWarning(visibleTags) &&
      getRestrictionMatches(food, selectedRestrictions).length === 0
    );
  });
}
