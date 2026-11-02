export type ReligiousTag = "Halal" | "Haram" | "Kosher" | "Non-Kosher";

export type DisplayReligiousTag = ReligiousTag | "Halal?";

export type EvidenceSourceKind =
  | "ingredient"
  | "allergen"
  | "food-name"
  | "menu-label"
  | "location"
  | "unspecified";

export type ProhibitedIngredientCategory = "pork" | "alcohol";

export type ReligiousTagReason = {
  source: EvidenceSourceKind;
  text: string;
  category?: ProhibitedIngredientCategory;
  identifiers?: string[];
  foodName?: string;
};

export type EvidenceSource = Pick<ReligiousTagReason, "source" | "text">;

export type ReligiousTagReasons = Partial<
  Record<ReligiousTag, ReligiousTagReason[]>
>;

export type ReligiousClassification = {
  religiousTags: ReligiousTag[];
  religiousTagReasons: ReligiousTagReasons;
};

export type ReligiousTagInput = {
  foodName: string;
  ingredients: readonly string[];
  allergens?: readonly string[];
  explicitTagText?: string;
  diningHallName?: string;
};

export type DietaryPreferences = {
  muslim: boolean;
  jewish: boolean;
};

export type DietaryRestriction =
  | "Milk"
  | "Eggs"
  | "Fish"
  | "Crustacean Shellfish"
  | "Tree Nut"
  | "Peanut"
  | "Wheat"
  | "Soybeans"
  | "Sesame"
  | "Gluten"
  | "Alcohol";

export type DietaryTag = DisplayReligiousTag | "Restricted";

export type RestrictionInput = {
  foodName: string;
  ingredients: readonly string[];
  allergens: readonly string[];
};

export type IngredientRestrictionMatch = {
  restriction: DietaryRestriction;
  source: "allergen" | "ingredient" | "food-name";
  text: string;
  identifiers: string[];
};

export type CalorieRange = {
  minimum: number;
  maximum: number | null;
};

export type CalorieRestrictionMatch = {
  restriction: "Calories";
  source: "calories";
  foodName: string;
  calories: number | null;
  range: CalorieRange;
};

export type RestrictionMatch =
  IngredientRestrictionMatch | CalorieRestrictionMatch;

export type FoodDietaryInput = RestrictionInput & {
  calories: number | null;
  religiousTags: readonly ReligiousTag[];
};

export type FoodDietaryStatus = {
  tags: DietaryTag[];
  restrictionMatches: RestrictionMatch[];
  shouldAvoid: boolean;
};

export type DietarySettings = {
  preferences: DietaryPreferences;
  selectedRestrictions: readonly DietaryRestriction[];
  hideUnwantedMeals: boolean;
  calorieRange: CalorieRange;
};

export type DietarySettingsUpdater = (
  current: DietarySettings,
) => DietarySettings;

export type ExplanationPart = {
  text: string;
  highlighted?: boolean;
};

export type ExplanationClause = {
  prefix: string;
  suffix: string;
};
