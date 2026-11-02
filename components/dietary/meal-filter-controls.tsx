"use client";

import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";
import { PreferenceCheckbox } from "./preference-checkbox";
import { CalorieRangeControls } from "./calorie-range-controls";

export function MealFilterControls() {
  const { hideUnwantedMeals, setHideUnwantedMeals } = useDietaryPreferences();

  return (
    <div className="mt-4 px-2.5">
      <PreferenceCheckbox
        label="Hide unwanted meals"
        checked={hideUnwantedMeals}
        onChange={setHideUnwantedMeals}
      />
      <CalorieRangeControls />
    </div>
  );
}
