import {
  getUniqueNames,
  joinExplanationNames,
} from "./explanation-formatting.ts";
import type { ExplanationPart, RestrictionMatch } from "../../types/dietary.ts";

export function getRestrictionExplanation(
  matches: readonly RestrictionMatch[],
): ExplanationPart[] {
  const restrictions = getUniqueNames(
    matches.map((match) => match.restriction),
  );
  const identifiers = getUniqueNames(
    matches.flatMap((match) => match.identifiers),
  );

  if (matches.length === 0) {
    return [{ text: "This item matches one of your selected restrictions." }];
  }

  return [
    { text: "The menu lists " },
    ...joinExplanationNames(identifiers, true),
    { text: ", matching your " },
    ...joinExplanationNames(restrictions, true),
    { text: ` restriction${restrictions.length === 1 ? "" : "s"}.` },
  ];
}
