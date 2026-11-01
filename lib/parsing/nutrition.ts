import { load } from "cheerio";

import { NUTRITION_FIELD_LABELS } from "../nutrition/fields.ts";
import { normalizeWhitespace, parseNutritionNumber } from "./text.ts";
import type { HtmlElement } from "../../types/parsing.ts";
import type { NutritionValues } from "../../types/nutrition.ts";

export function extractNutritionLines(foodContainer: HtmlElement): string[] {
  const nutritionHtml = foodContainer.find(".nutritionFact").first().html();

  if (!nutritionHtml) {
    return [];
  }

  return nutritionHtml
    .split(/<br\s*\/?\s*>/i)
    .map((line) => normalizeWhitespace(load(line).text()))
    .filter(Boolean);
}

export function readNutritionValue(
  nutritionLines: readonly string[],
  label: string,
): string | undefined {
  const labelPrefix = `${label}:`;
  const matchingLine = nutritionLines.find((line) =>
    line.toLowerCase().startsWith(labelPrefix.toLowerCase()),
  );

  return matchingLine
    ? normalizeWhitespace(matchingLine.slice(labelPrefix.length))
    : undefined;
}

export function extractNutritionValues(
  nutritionLines: readonly string[],
): NutritionValues {
  // The typed label map contains every NutritionValues field exactly once.
  return Object.fromEntries(
    Object.entries(NUTRITION_FIELD_LABELS).map(([field, label]) => [
      field,
      parseNutritionNumber(readNutritionValue(nutritionLines, label)),
    ]),
  ) as NutritionValues;
}
