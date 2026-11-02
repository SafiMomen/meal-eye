"use client";

import { DietaryPreferencesContext } from "./preferences-context";
import { usePersistedDietarySettings } from "@/hooks/use-persisted-dietary-settings";
import { updateDietarySettings } from "@/lib/dietary/settings-store";
import type {
  CalorieRange,
  DietaryPreferences,
  DietaryRestriction,
} from "@/types/dietary";
import type { ChildrenProps } from "@/types/ui";

export function DietaryPreferencesProvider({ children }: ChildrenProps) {
  const settings = usePersistedDietarySettings();

  function setRestriction(restriction: DietaryRestriction, enabled: boolean) {
    updateDietarySettings((current) => ({
      ...current,
      selectedRestrictions: enabled
        ? [...new Set([...current.selectedRestrictions, restriction])]
        : current.selectedRestrictions.filter((value) => value !== restriction),
    }));
  }

  function setPreference(
    preference: keyof DietaryPreferences,
    enabled: boolean,
  ) {
    updateDietarySettings((current) => ({
      ...current,
      preferences: { ...current.preferences, [preference]: enabled },
    }));
  }

  function setHideUnwantedMeals(enabled: boolean) {
    updateDietarySettings((current) => ({
      ...current,
      hideUnwantedMeals: enabled,
    }));
  }

  function setCalorieRange(range: CalorieRange) {
    updateDietarySettings((current) => ({ ...current, calorieRange: range }));
  }

  return (
    <DietaryPreferencesContext.Provider
      value={{
        ...settings,
        setPreference,
        setRestriction,
        setHideUnwantedMeals,
        setCalorieRange,
      }}
    >
      {children}
    </DietaryPreferencesContext.Provider>
  );
}
