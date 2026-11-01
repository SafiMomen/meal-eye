import { classifyReligiousTags } from "../dietary/classification.ts";
import {
  extractNutritionLines,
  extractNutritionValues,
  readNutritionValue,
} from "./nutrition.ts";
import { normalizeWhitespace, parseCommaSeparatedList } from "./text.ts";
import type { MenuFood } from "../../types/dining.ts";
import type { HtmlElement } from "../../types/parsing.ts";

function readExplicitTagText(foodContainer: HtmlElement): string {
  const tagElements = foodContainer.find(
    "[data-religious-tag], .religious-tag, .dietary-tag",
  );

  return tagElements
    .map((tagIndex) => {
      const tagElement = tagElements.eq(tagIndex);
      return [
        tagElement.text(),
        tagElement.attr("data-religious-tag"),
        tagElement.attr("aria-label"),
        tagElement.attr("title"),
      ]
        .filter(Boolean)
        .join(" ");
    })
    .get()
    .join(" ");
}

export function extractMenuFood(
  foodContainer: HtmlElement,
  diningHallName: string,
): MenuFood | null {
  const foodName = normalizeWhitespace(
    foodContainer.find(".accordion-header .title").first().text(),
  );

  if (!foodName) {
    return null;
  }

  const nutritionLines = extractNutritionLines(foodContainer);
  const nutrition = extractNutritionValues(nutritionLines);
  const hasNutritionFacts = Object.values(nutrition).some(
    (value) => value !== null,
  );

  if (!hasNutritionFacts) {
    return null;
  }

  const ingredients = parseCommaSeparatedList(
    readNutritionValue(nutritionLines, "Ingredients"),
  );

  return {
    foodName,
    servingSize: readNutritionValue(nutritionLines, "Serving Size") ?? null,
    ...nutrition,
    ingredients,
    allergens: parseCommaSeparatedList(
      readNutritionValue(nutritionLines, "Allergens"),
    ),
    ...classifyReligiousTags({
      foodName,
      ingredients,
      explicitTagText: readExplicitTagText(foodContainer),
      diningHallName,
    }),
  };
}
