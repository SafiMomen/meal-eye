"use client";

import { useContext } from "react";
import { FitnessContext } from "@/components/fitness/fitness-context";

export function useFitness() {
  const context = useContext(FitnessContext);
  if (!context) throw new Error("Fitness controls require a FitnessProvider.");
  return context;
}
