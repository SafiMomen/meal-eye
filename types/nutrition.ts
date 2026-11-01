export type NutritionValues = {
  calories: number | null;
  proteinGrams: number | null;
  cholesterolMilligrams: number | null;
  totalFatGrams: number | null;
  saturatedFatGrams: number | null;
  transFatGrams: number | null;
  totalCarbohydratesGrams: number | null;
  dietaryFiberGrams: number | null;
  sugarsGrams: number | null;
  sodiumMilligrams: number | null;
};

export type NutritionField = keyof NutritionValues;

export type NutrientDefinition = {
  field: NutritionField;
  label: string;
  unit: "g" | "mg";
};

export type NutrientGroupDefinition = NutrientDefinition & {
  details: readonly NutrientDefinition[];
};
