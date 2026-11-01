import { normalizeDietaryText } from "./text.ts";
import type {
  EvidenceSource,
  ProhibitedIngredientCategory,
  ReligiousTagReason,
} from "../../types/dietary.ts";

export function findKeywordEvidence(
  sources: EvidenceSource[],
  pattern: RegExp,
  category: ProhibitedIngredientCategory,
): ReligiousTagReason[] {
  return sources.flatMap(({ source, text }) => {
    const matches = normalizeDietaryText(text).match(
      new RegExp(pattern.source, "g"),
    );
    const identifiers = [...new Set(matches ?? [])];
    if (identifiers.length === 0) {
      return [];
    }

    return [{ source, text, category, identifiers }];
  });
}

export function findExplicitEvidence(
  sources: EvidenceSource[],
  pattern: RegExp,
): ReligiousTagReason[] {
  return sources
    .filter(({ text }) => pattern.test(normalizeDietaryText(text)))
    .map(({ source, text }) => ({ source, text }));
}
