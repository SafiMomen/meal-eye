"use client";

import { useContext } from "react";

import { DietaryPreferencesContext } from "@/components/dietary/preferences-context";

export function useDietaryPreferences() {
  const context = useContext(DietaryPreferencesContext);

  if (!context) {
    throw new Error(
      "Dietary preferences require a DietaryPreferencesProvider.",
    );
  }

  return context;
}
