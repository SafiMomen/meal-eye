"use client";

import { createContext } from "react";
import type { FitnessContextValue } from "./types";

export const FitnessContext = createContext<FitnessContextValue | null>(null);
