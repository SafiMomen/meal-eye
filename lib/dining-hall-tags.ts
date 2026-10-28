import type { MealPeriod } from "./dining-page";
import type { DiningHallMenu, ReligiousTagReason } from "./dining-types";

function normalizeLabel(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/** Explain matching entrees without classifying the whole dining hall. */
export function getHaramEntreeReasons(
    menu: DiningHallMenu,
    selectedMeal: MealPeriod,
): ReligiousTagReason[] {
    const period = Object.entries(menu).find(
        ([name]) => normalizeLabel(name) === normalizeLabel(selectedMeal),
    );

    if (!period) { return []; }

    return Object.entries(period[1])
        .filter(([category]) => /\bentrees?\b/.test(normalizeLabel(category)))
        .flatMap(([, foods]) => foods
            .filter((food) => food.religiousTags.includes("Haram"))
            .flatMap((food) => {
                const reasons = food.religiousTagReasons?.Haram;
                return reasons?.length
                    ? reasons.map((reason) => ({ ...reason, foodName: food.foodName }))
                    : [{
                        source: "unspecified" as const,
                        text: "No specific ingredient was provided.",
                        foodName: food.foodName ?? "An entrée",
                    }];
            }));
}

export function hasHaramEntree(menu: DiningHallMenu, selectedMeal: MealPeriod): boolean {
    return getHaramEntreeReasons(menu, selectedMeal).length > 0;
}
