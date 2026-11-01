"use client";

import { useState } from "react";

import { DietaryPreferencesContext } from "./preferences-context";
import { DEFAULT_DIETARY_PREFERENCES } from "@/lib/dietary/preferences";
import type { DietaryPreferences, DietaryRestriction } from "@/types/dietary";
import type { ChildrenProps } from "@/types/ui";

export function DietaryPreferencesProvider({ children }: ChildrenProps) {
  const [preferences, setPreferences] = useState(DEFAULT_DIETARY_PREFERENCES);
  const [selectedRestrictions, setSelectedRestrictions] = useState<
    DietaryRestriction[]
  >([]);

  function setRestriction(restriction: DietaryRestriction, enabled: boolean) {
    setSelectedRestrictions((current) => {
      if (!enabled) {
        return current.filter((value) => value !== restriction);
      }

      return current.includes(restriction)
        ? current
        : [...current, restriction];
    });
  }

  function setPreference(
    preference: keyof DietaryPreferences,
    enabled: boolean,
  ) {
    setPreferences((current) => ({
      ...current,
      [preference]: enabled,
    }));
  }

  return (
    <DietaryPreferencesContext.Provider
      value={{
        preferences,
        setPreference,
        selectedRestrictions,
        setRestriction,
      }}
    >
      {children}
    </DietaryPreferencesContext.Provider>
  );
}
