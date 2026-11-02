import { getFoodDietaryStatus } from "../dietary/food-status.ts";
import type { MenuCategories } from "../../types/dining.ts";
import type { DietarySettings } from "../../types/dietary.ts";

export function getVisibleMenuCategories(
  categories: MenuCategories,
  settings: DietarySettings,
): MenuCategories {
  return Object.fromEntries(
    Object.entries(categories)
      .map(([name, foods]) => {
        const visibleFoods = settings.hideUnwantedMeals
          ? foods.filter(
              (food) =>
                !getFoodDietaryStatus(
                  food,
                  settings.preferences,
                  settings.selectedRestrictions,
                  settings.calorieRange,
                ).shouldAvoid,
            )
          : foods;

        return [name, visibleFoods] as const;
      })
      .filter(([, foods]) => foods.length > 0),
  );
}

export function countMenuFoods(categories: MenuCategories): number {
  return Object.values(categories).reduce(
    (total, foods) => total + foods.length,
    0,
  );
}
