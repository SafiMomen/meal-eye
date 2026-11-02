import type {
  DietaryTag,
  ReligiousClassification,
  ReligiousTagReasons,
  RestrictionMatch,
} from "./dietary";
import type { NutritionValues } from "./nutrition";

export type DiningHall = {
  name: string;
  link?: string;
};

export type MenuFood = NutritionValues &
  ReligiousClassification & {
    foodName: string;
    servingSize: string | null;
    ingredients: string[];
    allergens: string[];
  };

export type MenuCategories = Record<string, MenuFood[]>;

export type EntreeDietaryFood = Pick<
  MenuFood,
  | "foodName"
  | "calories"
  | "ingredients"
  | "allergens"
  | "religiousTags"
  | "religiousTagReasons"
>;

export type HallDietaryWarnings = {
  tags: DietaryTag[];
  reasons: ReligiousTagReasons;
  restrictionMatches: RestrictionMatch[];
};

export type HighProteinFood = Pick<
  MenuFood,
  "foodName" | "calories" | "ingredients" | "allergens" | "religiousTags"
> & {
  proteinGrams: number;
};

export type DiningMenu = Record<string, MenuCategories>;

export type MealPeriod = "Breakfast" | "Brunch" | "Lunch" | "Dinner";

export type SearchParamValue = string | string[] | undefined;

export type DiningPageSearchParams = {
  hall?: SearchParamValue;
  meal?: SearchParamValue;
};

export type DiningSelection = {
  selectedHallName?: string;
  selectedMeal: MealPeriod;
  isWeekend: boolean;
};

export type DiningHallAvailability = "available" | "empty" | "unknown";
