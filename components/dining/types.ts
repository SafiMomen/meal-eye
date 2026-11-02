import type {
  DiningHall,
  DiningHallAvailability,
  DiningPageSearchParams,
  EntreeDietaryFood,
  HighProteinFood,
  MealPeriod,
  MenuCategories,
  MenuFood,
} from "@/types/dining";

export type DiningWorkspaceProps = {
  searchParams: Promise<DiningPageSearchParams>;
};

export type MealPeriodToggleProps = {
  selectedHallName?: string;
  selectedMeal: MealPeriod;
  mealPeriods: readonly MealPeriod[];
};

export type DiningHallSelectionRowProps = {
  hallName: string;
  selectedMeal: MealPeriod;
  isSelected: boolean;
  availability: DiningHallAvailability;
  entreeFoods?: readonly EntreeDietaryFood[];
  highProteinFoods?: readonly HighProteinFood[];
};

export type HighProteinIndicatorProps = {
  mealPeriod: MealPeriod;
  foods: readonly HighProteinFood[];
};

export type DiningHallMenuRowProps = {
  hall: DiningHall;
  selectedMeal: MealPeriod;
  isSelected: boolean;
  isWeekend: boolean;
};

export type DiningHallMenuContentProps = {
  hallName: string;
  periodName: string;
  categories: MenuCategories;
};

export type MenuCategoryProps = {
  categoryName: string;
  headingId: string;
  foods: MenuFood[];
  sourceFoods: MenuFood[];
  sourceLabel: string;
};

export type MenuItemCountProps = {
  categories: MenuCategories;
};

export type MenuFoodItemProps = {
  food: MenuFood;
  index: number;
  sourceLabel: string;
};

export type MenuMessageProps = {
  title: string;
  description: string;
};

export type LoadingMessageProps = {
  children: string;
  className?: string;
};
