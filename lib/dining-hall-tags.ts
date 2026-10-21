import type { MealPeriod } from "./dining-page";
import type { DiningHallMenu } from "./dining-types";

function normalizeLabel(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/** Warn about a matching entree, without classifying the whole dining hall. */
export function hasHaramEntree(
    menu: DiningHallMenu,
    selectedMeal: MealPeriod,
): boolean {
    const period = Object.entries(menu).find(
        ([name]) => normalizeLabel(name) === normalizeLabel(selectedMeal),
    );

    if (!period) { return false; }

    return Object.entries(period[1]).some(([category, foods]) =>
        /\bentrees?\b/.test(normalizeLabel(category))
        && foods.some((food) => food.religiousTags.includes("Haram")),
    );
}
