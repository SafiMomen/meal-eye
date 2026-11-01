import type {
  NutritionField,
  NutrientDefinition,
  NutrientGroupDefinition,
} from "../../types/nutrition.ts";

export const NUTRITION_FIELD_LABELS: Record<NutritionField, string> = {
  calories: "Calories",
  proteinGrams: "Protein",
  cholesterolMilligrams: "Cholesterol",
  totalFatGrams: "Total Fat",
  saturatedFatGrams: "Saturated Fat",
  transFatGrams: "Trans Fat",
  totalCarbohydratesGrams: "Total Carbohydrates",
  dietaryFiberGrams: "Dietary Fiber",
  sugarsGrams: "Sugars",
  sodiumMilligrams: "Sodium",
};

export const MACRONUTRIENT_GROUPS = [
  {
    field: "totalFatGrams",
    label: "Total fat",
    unit: "g",
    details: [
      { field: "saturatedFatGrams", label: "Saturated", unit: "g" },
      { field: "transFatGrams", label: "Trans", unit: "g" },
    ],
  },
  {
    field: "totalCarbohydratesGrams",
    label: "Carbohydrates",
    unit: "g",
    details: [
      { field: "dietaryFiberGrams", label: "Fiber", unit: "g" },
      { field: "sugarsGrams", label: "Sugars", unit: "g" },
    ],
  },
] as const satisfies readonly NutrientGroupDefinition[];

export const ADDITIONAL_NUTRIENTS = [
  { field: "proteinGrams", label: "Protein", unit: "g" },
  { field: "cholesterolMilligrams", label: "Cholesterol", unit: "mg" },
  { field: "sodiumMilligrams", label: "Sodium", unit: "mg" },
] as const satisfies readonly NutrientDefinition[];
