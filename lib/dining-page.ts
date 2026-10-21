export const MEAL_PERIODS = [
    "Breakfast",
    "Brunch",
    "Lunch",
    "Dinner",
] as const;

export type MealPeriod = (typeof MEAL_PERIODS)[number];

export type DiningPageSearchParams = {
    hall?: string | string[];
    meal?: string | string[];
};

export function readSearchParam(
    value: string | string[] | undefined,
): string | undefined {
    return typeof value === "string" ? value : undefined;
}

export function resolveMealPeriod(value: string | undefined): MealPeriod {
    const matchingPeriod = MEAL_PERIODS.find(
        (period) => period.toLowerCase() === value?.toLowerCase(),
    );

    return matchingPeriod ?? "Lunch";
}
