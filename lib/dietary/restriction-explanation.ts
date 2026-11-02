import {
  getUniqueNames,
  joinExplanationNames,
} from "./explanation-formatting.ts";
import type { ExplanationPart, RestrictionMatch } from "../../types/dietary.ts";
import { formatCalorieRange } from "./calories.ts";

export function getRestrictionExplanation(
  matches: readonly RestrictionMatch[],
): ExplanationPart[] {
  if (matches.length === 0) {
    return [{ text: "This item matches one of your selected restrictions." }];
  }

  const ingredients = matches.filter((match) => match.source !== "calories");
  const calorieMatches = matches.filter((match) => match.source === "calories");
  const parts: ExplanationPart[] = [];

  if (ingredients.length > 0) {
    const restrictions = getUniqueNames(
      ingredients.map((match) => match.restriction),
    );
    const identifiers = getUniqueNames(
      ingredients.flatMap((match) => match.identifiers),
    );
    parts.push(
      { text: "The menu lists " },
      ...joinExplanationNames(identifiers, true),
      { text: ", matching your " },
      ...joinExplanationNames(restrictions, true),
      { text: ` restriction${restrictions.length === 1 ? "" : "s"}` },
    );
  }

  for (const match of calorieMatches) {
    if (parts.length > 0) {
      parts.push({ text: "; " });
    }

    if (match.calories === null) {
      parts.push({
        text:
          `${match.foodName} does not list calories, so it cannot be checked ` +
          "against your selected range of ",
      });
    } else {
      parts.push(
        { text: `${match.foodName} has ` },
        { text: `${match.calories} kcal`, highlighted: true },
        { text: ", outside your selected range of " },
      );
    }

    parts.push({ text: formatCalorieRange(match.range), highlighted: true });
  }

  return [...parts, { text: "." }];
}
