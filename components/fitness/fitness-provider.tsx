"use client";

import { useSyncExternalStore } from "react";
import { FitnessContext } from "./fitness-context";
import { usePrincetonDay } from "@/hooks/use-princeton-day";
import { getPrincetonDateKey } from "@/lib/dining/calendar";
import { addFoodPortion, updateFoodPortions } from "@/lib/fitness/food-log";
import { fitnessStore } from "@/lib/fitness/store";
import type {
  FitnessProfile,
  FoodLogEntry,
  LoggableFood,
} from "@/types/fitness";
import type { ChildrenProps } from "@/types/ui";

const EMPTY_ENTRIES: readonly FoodLogEntry[] = [];

export function FitnessProvider({ children }: ChildrenProps) {
  const data = useSyncExternalStore(
    fitnessStore.subscribe,
    fitnessStore.getSnapshot,
    fitnessStore.getServerSnapshot,
  );
  const today = usePrincetonDay();

  function addFood(food: LoggableFood) {
    const date = getPrincetonDateKey(new Date());
    fitnessStore.update((current) => ({
      ...current,
      logs: {
        ...current.logs,
        [date]: addFoodPortion(current.logs[date] ?? [], food),
      },
    }));
  }

  function setPortions(id: string, portions: number) {
    if (!today) return;
    fitnessStore.update((current) => ({
      ...current,
      logs: {
        ...current.logs,
        [today]: updateFoodPortions(current.logs[today] ?? [], id, portions),
      },
    }));
  }

  function removeFood(id: string) {
    if (!today) return;
    fitnessStore.update((current) => ({
      ...current,
      logs: {
        ...current.logs,
        [today]: (current.logs[today] ?? []).filter((entry) => entry.id !== id),
      },
    }));
  }

  function saveProfile(profile: FitnessProfile | null) {
    fitnessStore.update((current) => ({ ...current, profile }));
  }

  return (
    <FitnessContext.Provider
      value={{
        profile: data.profile,
        today,
        entries: data.logs[today] ?? EMPTY_ENTRIES,
        addFood,
        setPortions,
        removeFood,
        saveProfile,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
}
