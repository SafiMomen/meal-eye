import type {
  ExplanationPart,
  ReligiousTagReason,
} from "../../types/dietary.ts";

export function joinExplanationNames(
  names: readonly string[],
  highlighted: boolean,
): ExplanationPart[] {
  return names.flatMap((name, nameIndex) => {
    const parts: ExplanationPart[] = [];
    const isLastName = nameIndex === names.length - 1;

    if (nameIndex > 0) {
      let separator = ", ";

      if (isLastName) {
        separator = names.length === 2 ? " and " : ", and ";
      }

      parts.push({ text: separator });
    }

    parts.push({ text: name, highlighted });
    return parts;
  });
}

export function getUniqueNames(names: readonly string[]): string[] {
  const uniqueNames = new Map<string, string>();

  for (const name of names) {
    const trimmedName = name.trim();
    const normalizedName = trimmedName.toLowerCase();

    if (trimmedName && !uniqueNames.has(normalizedName)) {
      uniqueNames.set(normalizedName, trimmedName);
    }
  }

  return [...uniqueNames.values()];
}

function hasMatchingIngredientEvidence(
  foodNameReason: ReligiousTagReason,
  reasons: readonly ReligiousTagReason[],
): boolean {
  return reasons.some(
    (candidate) =>
      candidate.source === "ingredient" &&
      candidate.category === foodNameReason.category &&
      candidate.foodName === foodNameReason.foodName,
  );
}

export function groupExplanationEvidence(
  reasons: readonly ReligiousTagReason[],
): ReligiousTagReason[][] {
  const evidenceGroups = new Map<string, ReligiousTagReason[]>();

  for (const reason of reasons) {
    // Prefer the actual ingredient to a duplicate clue in the food's name.
    const isRedundantFoodName =
      reason.source === "food-name" &&
      hasMatchingIngredientEvidence(reason, reasons);

    if (isRedundantFoodName) {
      continue;
    }

    const groupKey = JSON.stringify([reason.source, reason.foodName]);
    const group = evidenceGroups.get(groupKey) ?? [];
    group.push(reason);
    evidenceGroups.set(groupKey, group);
  }

  return [...evidenceGroups.values()];
}

export function getEvidenceNames(
  reasons: readonly ReligiousTagReason[],
): string[] {
  const names = reasons.flatMap((reason) => {
    if (reason.source === "food-name" && reason.identifiers?.length) {
      return reason.identifiers;
    }

    return [reason.text];
  });

  return getUniqueNames(names);
}
