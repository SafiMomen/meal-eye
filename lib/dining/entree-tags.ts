import type {
  DiningMenu,
  EntreeDietaryFood,
  HallDietaryWarnings,
  MealPeriod,
} from "../../types/dining.ts";
import type {
  DietaryPreferences,
  DietaryRestriction,
  ReligiousTagReason,
} from "../../types/dietary.ts";
import { findMenuPeriod } from "./menu-periods.ts";
import { getRestrictionMatches } from "../dietary/restrictions.ts";

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getEntreeFoods(
  menu: DiningMenu,
  selectedMeal: MealPeriod,
  isWeekend = false,
): EntreeDietaryFood[] {
  const period = findMenuPeriod(menu, selectedMeal, isWeekend);

  if (!period) {
    return [];
  }

  return Object.entries(period[1])
    .filter(([category]) => /\bentrees?\b/.test(normalizeLabel(category)))
    .flatMap(([, foods]) => foods)
    .map((food) => ({
      foodName: food.foodName,
      ingredients: food.ingredients,
      allergens: food.allergens,
      religiousTags: food.religiousTags,
      religiousTagReasons: food.religiousTagReasons,
    }));
}

function getReligiousEntreeReasons(
  foods: readonly EntreeDietaryFood[],
  tag: "Haram" | "Non-Kosher",
): ReligiousTagReason[] {
  return foods
    .filter((food) => food.religiousTags.includes(tag))
    .flatMap((food) => {
      const reasons = food.religiousTagReasons?.[tag];

      return reasons?.length
        ? reasons.map((reason) => ({ ...reason, foodName: food.foodName }))
        : [
            {
              source: "unspecified" as const,
              text: "No specific ingredient was provided.",
              foodName: food.foodName ?? "An entrée",
            },
          ];
    });
}

/** Explain matching entrees without classifying the whole dining hall. */
export function getHaramEntreeReasons(
  menu: DiningMenu,
  selectedMeal: MealPeriod,
  isWeekend = false,
): ReligiousTagReason[] {
  return getReligiousEntreeReasons(
    getEntreeFoods(menu, selectedMeal, isWeekend),
    "Haram",
  );
}

export function getHallDietaryWarnings(
  foods: readonly EntreeDietaryFood[],
  preferences: DietaryPreferences,
  selectedRestrictions: readonly DietaryRestriction[],
): HallDietaryWarnings {
  const warnings: HallDietaryWarnings = {
    tags: [],
    reasons: {},
    restrictionMatches: [],
  };

  for (const tag of ["Haram", "Non-Kosher"] as const) {
    const enabled = tag === "Haram" ? preferences.muslim : preferences.jewish;
    const reasons = enabled ? getReligiousEntreeReasons(foods, tag) : [];

    if (reasons.length > 0) {
      warnings.tags.push(tag);
      warnings.reasons[tag] = reasons;
    }
  }

  warnings.restrictionMatches = foods.flatMap((food) =>
    getRestrictionMatches(food, selectedRestrictions),
  );

  if (warnings.restrictionMatches.length > 0) {
    warnings.tags.push("Restricted");
  }

  return warnings;
}
