import "server-only";
import * as Cheerio from "cheerio";
import type { Element } from "domhandler";
import { cacheLife } from "next/cache";
import { detectReligiousTags } from "@/lib/religious-tags";

import {
    DiningHallElement,
    DiningHallMenu,
    FoodElement,
    ReligiousTag,
} from "@/lib/dining-types";

function normalizeText(value: string): string {
    return value
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function extractNutritionLines(
    foodElementContainer: Cheerio.Cheerio<Element>
): string[] {
    const nutritionHtml = foodElementContainer
        .find(".nutritionFact")
        .first()
        .html();

    if (!nutritionHtml) { return []; }

    return nutritionHtml
        .split(/<br\s*\/?\s*>/i)
        .map((line) => normalizeText(Cheerio.load(line).text()))
        .filter(Boolean);
}

function extractNutritionValue(
    nutritionLines: string[],
    label: string
): string | undefined {
    const prefix = `${label}:`;
    const line = nutritionLines.find((candidate) =>
        candidate.toLowerCase().startsWith(prefix.toLowerCase())
    );

    return line ? normalizeText(line.slice(prefix.length)) : undefined;
}

function extractNumber(value: string | undefined): number | null {
    const match = value?.match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
}

function extractList(value: string | undefined): string[] {
    if (!value) { return []; }

    return value
        .split(",")
        .map(normalizeText)
        .filter(Boolean);
}

function extractReligiousTags(
    foodElementContainer: Cheerio.Cheerio<Element>,
    foodName: string,
    ingredients: string[],
    diningHallName: string
): ReligiousTag[] {
    const explicitTagElements = foodElementContainer.find(
        "[data-religious-tag], .religious-tag, .dietary-tag"
    );
    const explicitTagText = explicitTagElements
        .map((index) => {
            const tagElement = explicitTagElements.eq(index);
            return [
                tagElement.text(),
                tagElement.attr("data-religious-tag"),
                tagElement.attr("aria-label"),
                tagElement.attr("title"),
            ].filter(Boolean).join(" ");
        })
        .get()
        .join(" ");
    return detectReligiousTags({
        foodName,
        ingredients,
        explicitTagText,
        diningHallName,
    });
}

function extractFoodElement(
    foodElementContainer: Cheerio.Cheerio<Element>,
    diningHallName: string
): FoodElement | null {
    const foodName = normalizeText(
        foodElementContainer.find(".accordion-header .title").first().text()
    );

    if (!foodName) { return null; }

    const nutritionLines = extractNutritionLines(foodElementContainer);
    const nutritionValues = {
        calories: extractNumber(
            extractNutritionValue(nutritionLines, "Calories")
        ),
        totalFatGrams: extractNumber(
            extractNutritionValue(nutritionLines, "Total Fat")
        ),
        saturatedFatGrams: extractNumber(
            extractNutritionValue(nutritionLines, "Saturated Fat")
        ),
        transFatGrams: extractNumber(
            extractNutritionValue(nutritionLines, "Trans Fat")
        ),
        totalCarbohydratesGrams: extractNumber(
            extractNutritionValue(nutritionLines, "Total Carbohydrates")
        ),
        dietaryFiberGrams: extractNumber(
            extractNutritionValue(nutritionLines, "Dietary Fiber")
        ),
        sugarsGrams: extractNumber(
            extractNutritionValue(nutritionLines, "Sugars")
        ),
        cholesterolMilligrams: extractNumber(
            extractNutritionValue(nutritionLines, "Cholesterol")
        ),
        proteinGrams: extractNumber(
            extractNutritionValue(nutritionLines, "Protein")
        ),
        sodiumMilligrams: extractNumber(
            extractNutritionValue(nutritionLines, "Sodium")
        ),
    };
    const hasNutritionFacts = Object.values(nutritionValues).some(
        (value) => value !== null
    );

    if (!hasNutritionFacts) { return null; }

    const ingredients = extractList(
        extractNutritionValue(nutritionLines, "Ingredients")
    );

    return {
        foodName,
        servingSize: extractNutritionValue(nutritionLines, "Serving Size") ?? null,
        ...nutritionValues,
        ingredients,
        allergens: extractList(
            extractNutritionValue(nutritionLines, "Allergens")
        ),
        religiousTags: extractReligiousTags(
            foodElementContainer,
            foodName,
            ingredients,
            diningHallName
        ),
    };
}

function extractDiningHallFoodElements(
    periodBodyContainer: Cheerio.Cheerio<Element>,
    diningHallName: string
): Record<string, FoodElement[]> {
    const periodDomElements = periodBodyContainer.children();

    const foodElementsByCategory: Record<string, FoodElement[]> = {};
    let currCategoryQuery: string | undefined = undefined;

    periodDomElements.each((index) => {
        const childElement = periodDomElements.eq(index);

        /* case 1: is a category title i.e. Entree, Side, etc */
        if (childElement.hasClass("mealStation")) {
            const categoryName = childElement.text().trim();
            currCategoryQuery = categoryName;
            foodElementsByCategory[categoryName] = [];
            return;
        }
        /* Case #2: Is a food element i.e. the food item on the menu */
        if (!currCategoryQuery) { return; } // interesting no category yet?
        if (!childElement.hasClass('accordion-item')) { return; } // is not a food item?

        const foodElement = extractFoodElement(childElement, diningHallName);
        if (foodElement) {
            foodElementsByCategory[currCategoryQuery].push(foodElement);
        }
    });

    return Object.fromEntries(
        Object.entries(foodElementsByCategory).filter(
            ([, foodElements]) => foodElements.length > 0
        )
    );
}

export async function getMenu(
    diningHall: DiningHallElement
): Promise<DiningHallMenu> {
    "use cache";
    cacheLife({ stale: 60, revalidate: 60, expire: 300 });

    if (!diningHall.link) {
        throw new Error("cannot fetch dining hall with no link.")
    }

    const response = await fetch(diningHall.link, {
        headers: {
            "User-Agent": "MealEye/1.0 (educational dining information project)",
            "Accept": "text/html,application/xhtml+xml",
        }, // these headers might be useful to not block the web-scraping.
    });
    if (!response.ok) {
        throw new Error("failed to fetch dining hall menu.");
    }

    const html = await response.text();
    const $ = Cheerio.load(html);

    const diningHallMenu: DiningHallMenu = {};
    /* 
    Edge case #1: the dining hall is not available
    */
    const diningHallFailedToLoad = ($("#noData").length > 0);
    if (diningHallFailedToLoad) {
        return diningHallMenu;
    }
    /* All edge cases passed, must scrape the website */
    $(".card.mealCard").each((_, element) => {
        const mealCardContainer = $(element);

        const periodHeader = mealCardContainer.find(".card-header").first().clone();
        periodHeader.find(".float-end, a").remove();
        const periodName = normalizeText(periodHeader.text());

        if (!periodName) { return; }

        const periodBodyContainer = mealCardContainer.find(
            '.card-body [id^="mealAccordian-"]'
        );
        const periodData = extractDiningHallFoodElements(
            periodBodyContainer,
            diningHall.name
        );
        if (Object.keys(periodData).length > 0) {
            diningHallMenu[periodName] = periodData;
        }
    });
    return diningHallMenu;
}
