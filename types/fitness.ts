export type FormulaSex = "male" | "female";
export type ActivityLevel = "inactive" | "light" | "active" | "very-active";

export type FitnessProfile = {
  weightKg: number;
  heightCm: number;
  age: number;
  formulaSex: FormulaSex;
  activityLevel: ActivityLevel;
};

export type FitnessProfileDraft = {
  weightPounds: string;
  heightFeet: string;
  heightInches: string;
  age: string;
  formulaSex: FormulaSex | "";
  activityLevel: ActivityLevel | "";
};

export type LoggableFood = {
  foodName: string;
  servingSize: string | null;
  caloriesPerPortion: number | null;
  proteinPerPortion: number | null;
  sourceLabel: string;
};

export type FoodLogEntry = LoggableFood & { id: string; portions: number };
export type FitnessData = {
  profile: FitnessProfile | null;
  logs: Record<string, FoodLogEntry[]>;
};

export type FoodLogTotals = {
  calories: number;
  protein: number;
  unknownCalorieItems: number;
  unknownProteinItems: number;
};
