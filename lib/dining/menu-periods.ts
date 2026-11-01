import type { DiningMenu, MealPeriod } from "../../types/dining.ts";
import { hasMenuPeriod } from "./meal-periods.ts";

export function findMenuPeriod(
  menu: DiningMenu,
  selectedMeal: MealPeriod,
  isWeekend = false,
) {
  // Prefer a genuine Brunch period when present. Princeton's weekend midday
  // service is otherwise published under Lunch in the source menu.
  const sourcePeriods =
    isWeekend && selectedMeal === "Brunch" && !hasMenuPeriod(menu, "Breakfast")
      ? ["Brunch", "Lunch"]
      : [selectedMeal];
  const menuPeriods = Object.entries(menu);

  for (const sourcePeriod of sourcePeriods) {
    const matchingPeriod = menuPeriods.find(
      ([periodName]) =>
        periodName.trim().toLowerCase() === sourcePeriod.toLowerCase(),
    );

    if (matchingPeriod) {
      return matchingPeriod;
    }
  }

  return undefined;
}
