import { DEFAULT_CALORIE_RANGE, getCalorieRestriction } from "./calories.ts";
import { getVisibleReligiousTags } from "./preferences.ts";
import { getRestrictionMatches } from "./restrictions.ts";
import { hasDietaryWarning } from "./warnings.ts";
import type {
  CalorieRange,
  DietaryPreferences,
  DietaryRestriction,
  FoodDietaryInput,
  FoodDietaryStatus,
  RestrictionMatch,
} from "../../types/dietary.ts";

export function getFoodRestrictionMatches(
  food: Omit<FoodDietaryInput, "religiousTags">,
  selectedRestrictions: readonly DietaryRestriction[],
  calorieRange = DEFAULT_CALORIE_RANGE,
): RestrictionMatch[] {
  const matches: RestrictionMatch[] = getRestrictionMatches(
    food,
    selectedRestrictions,
  );
  const calorieMatch = getCalorieRestriction(food, calorieRange);

  if (calorieMatch) {
    matches.push(calorieMatch);
  }

  return matches;
}

export function getFoodDietaryStatus(
  food: FoodDietaryInput,
  preferences: DietaryPreferences,
  selectedRestrictions: readonly DietaryRestriction[],
  calorieRange: CalorieRange = DEFAULT_CALORIE_RANGE,
): FoodDietaryStatus {
  const restrictionMatches = getFoodRestrictionMatches(
    food,
    selectedRestrictions,
    calorieRange,
  );
  const tags: FoodDietaryStatus["tags"] = getVisibleReligiousTags(
    food.religiousTags,
    preferences,
  );

  if (restrictionMatches.length > 0) {
    tags.push("Restricted");
  }

  return { tags, restrictionMatches, shouldAvoid: hasDietaryWarning(tags) };
}
