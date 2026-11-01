import type {
  NutritionValues,
  NutrientGroupDefinition,
} from "@/types/nutrition";
import type { ReligiousTag, ReligiousTagReasons } from "@/types/dietary";
import type { DietaryTagListProps } from "@/components/dietary/types";

export type FoodNutritionCardProps = NutritionValues & {
  foodName: string;
  religiousTags: ReligiousTag[];
  religiousTagReasons?: ReligiousTagReasons;
  ingredients?: readonly string[];
  allergens?: readonly string[];
};

export type NutritionSummaryProps = {
  calories: number | null;
  proteinGrams: number | null;
  isExpanded: boolean;
};

export type NutritionDetailsProps = DietaryTagListProps & {
  nutrition: NutritionValues;
};

export type NutrientGroupProps = {
  nutrition: NutritionValues;
  definition: NutrientGroupDefinition;
};
