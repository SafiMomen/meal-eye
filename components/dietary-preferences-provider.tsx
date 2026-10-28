"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import {
  DEFAULT_DIETARY_PREFERENCES,
  type DietaryPreferences,
} from "@/lib/dietary-preferences";

type DietaryPreferencesContextValue = {
  preferences: DietaryPreferences;
  setPreference: (preference: keyof DietaryPreferences, enabled: boolean) => void;
};

const DietaryPreferencesContext =
  createContext<DietaryPreferencesContextValue | null>(null);

export function DietaryPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(DEFAULT_DIETARY_PREFERENCES);

  function setPreference(preference: keyof DietaryPreferences, enabled: boolean) {
    setPreferences((current) => ({ ...current, [preference]: enabled }));
  }

  return (
    <DietaryPreferencesContext.Provider value={{ preferences, setPreference }}>
      {children}
    </DietaryPreferencesContext.Provider>
  );
}

export function useDietaryPreferences() {
  const context = useContext(DietaryPreferencesContext);

  if (!context) {
    throw new Error("Dietary preferences require a DietaryPreferencesProvider.");
  }

  return context;
}
