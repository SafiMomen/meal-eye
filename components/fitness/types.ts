import type { ReactNode } from "react";
import type { DiningPageSearchParams } from "@/types/dining";
import type { ChildrenProps } from "@/types/ui";
import type {
  FitnessProfile,
  FoodLogEntry,
  LoggableFood,
} from "@/types/fitness";

export type FitnessContextValue = {
  profile: FitnessProfile | null;
  today: string;
  entries: readonly FoodLogEntry[];
  addFood: (food: LoggableFood) => void;
  setPortions: (id: string, portions: number) => void;
  removeFood: (id: string) => void;
  saveProfile: (profile: FitnessProfile | null) => void;
};

export type FitnessToolsProps = { diningQuery?: DiningPageSearchParams };
export type FitnessPageProps = ChildrenProps & { title: string };
export type AddFoodButtonProps = { food: LoggableFood };
export type FoodLogRowProps = { entry: FoodLogEntry; index: number };
export type ProfileFieldProps = {
  label: string;
  children: ReactNode;
};
