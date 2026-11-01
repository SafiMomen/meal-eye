import type {
  DiningMenu,
  MealPeriod,
  SearchParamValue,
} from "../../types/dining.ts";

const WEEKDAY_MEAL_PERIODS = [
  "Breakfast",
  "Lunch",
  "Dinner",
] as const satisfies readonly MealPeriod[];

const WEEKEND_MEAL_PERIODS = [
  "Brunch",
  "Dinner",
] as const satisfies readonly MealPeriod[];

const MEAL_ORDER: readonly MealPeriod[] = [
  "Breakfast",
  "Brunch",
  "Lunch",
  "Dinner",
];

export function hasMenuPeriod(menu: DiningMenu, period: MealPeriod): boolean {
  return Object.keys(menu).some(
    (name) => name.trim().toLowerCase() === period.toLowerCase(),
  );
}

export function getMealPeriods(
  isWeekend: boolean,
  menu?: DiningMenu | null,
): readonly MealPeriod[] {
  if (!menu || Object.keys(menu).length === 0) {
    return isWeekend ? WEEKEND_MEAL_PERIODS : WEEKDAY_MEAL_PERIODS;
  }

  const renameLunch = isWeekend && !hasMenuPeriod(menu, "Breakfast");
  const publishedPeriods = MEAL_ORDER.filter((period) =>
    hasMenuPeriod(menu, period),
  ).map((period) => (renameLunch && period === "Lunch" ? "Brunch" : period));

  return MEAL_ORDER.filter((period) => publishedPeriods.includes(period));
}

export function readSearchParam(value: SearchParamValue): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function resolveMealPeriod(
  value: string | undefined,
  isWeekend = false,
  menu?: DiningMenu | null,
): MealPeriod {
  const mealPeriods = getMealPeriods(isWeekend, menu);
  const matchingPeriod = mealPeriods.find(
    (period) => period.toLowerCase() === value?.toLowerCase(),
  );

  // Preserve midday selection when navigating between different hall schedules.
  return (
    matchingPeriod ??
    mealPeriods.find((period) => period === "Lunch" || period === "Brunch") ??
    mealPeriods[0] ??
    (isWeekend ? "Brunch" : "Lunch")
  );
}

export function createDiningHref(
  selectedMeal: MealPeriod,
  selectedHallName?: string,
) {
  const query = selectedHallName
    ? { hall: selectedHallName, meal: selectedMeal.toLowerCase() }
    : { meal: selectedMeal.toLowerCase() };

  return { pathname: "/", query };
}
