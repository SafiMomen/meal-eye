import { RESTRICTION_IDENTIFIERS } from "./restriction-identifiers.ts";
import { normalizeDietaryText } from "./text.ts";
import type {
  DietaryRestriction,
  RestrictionInput,
  RestrictionMatch,
} from "../../types/dietary.ts";

const PLANT_DAIRY_ALTERNATIVES = new RegExp(
  "\\b(?:almond|cashew|coconut|oat|soy|soya|rice|pea|hemp)\\s+" +
    "(?:milk|cream|butter)\\b|\\b(?:cocoa|shea|peanut)\\s+butter\\b",
  "g",
);

function getRestrictionPattern(restriction: DietaryRestriction): RegExp {
  const identifiers: readonly string[] = RESTRICTION_IDENTIFIERS[restriction];
  const keywords =
    restriction === "Gluten"
      ? [...identifiers, ...RESTRICTION_IDENTIFIERS.Wheat]
      : identifiers;

  return new RegExp(`\\b(?:${keywords.join("|")})(?:s)?\\b`, "g");
}

function readMatches(
  input: RestrictionInput,
  restriction: DietaryRestriction,
  source: RestrictionMatch["source"],
): RestrictionMatch[] {
  const sources = {
    allergen: input.allergens,
    ingredient: input.ingredients,
    "food-name": [input.foodName],
  };
  const values = sources[source];
  const pattern = getRestrictionPattern(restriction);

  return values.flatMap((text) => {
    let normalizedText = normalizeDietaryText(text);

    if (restriction === "Milk" && source !== "allergen") {
      normalizedText = normalizedText.replace(PLANT_DAIRY_ALTERNATIVES, " ");
    }

    // A free-from claim is not evidence of the ingredient itself. Alcohol
    // intentionally keeps the existing conservative policy for any mention.
    if (restriction !== "Alcohol") {
      const freeFromPattern = new RegExp(`${pattern.source}\\s+free\\b`, "g");
      normalizedText = normalizedText.replace(freeFromPattern, " ");
    }

    const identifiers = [...new Set(normalizedText.match(pattern) ?? [])];
    return identifiers.length > 0
      ? [{ restriction, source, text, identifiers }]
      : [];
  });
}

/** Prefer declared allergens, then ingredients, then clues in the dish name. */
export function getRestrictionMatches(
  input: RestrictionInput,
  selectedRestrictions: readonly DietaryRestriction[],
): RestrictionMatch[] {
  return [...new Set(selectedRestrictions)].flatMap((restriction) => {
    for (const source of ["allergen", "ingredient", "food-name"] as const) {
      const matches = readMatches(input, restriction, source);
      if (matches.length > 0) {
        return matches;
      }
    }

    return [];
  });
}
