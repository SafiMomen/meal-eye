"use client";

import { createContext } from "react";

import type { DietaryPreferencesContextValue } from "./types";

export const DietaryPreferencesContext =
  createContext<DietaryPreferencesContextValue | null>(null);
