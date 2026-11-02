import {
  getEvidenceNames,
  getUniqueNames,
  groupExplanationEvidence,
  joinExplanationNames,
} from "./explanation-formatting.ts";
import type {
  DisplayReligiousTag,
  ExplanationClause,
  ExplanationPart,
  ReligiousTagReason,
} from "../../types/dietary.ts";

const FALLBACK_EXPLANATIONS: Record<DisplayReligiousTag, string> = {
  "Halal?":
    "Ingredients seem halal, but it is better to ask. " +
    "This is not a Halal certification.",
  Halal: "The menu explicitly lists Halal ingredients or Halal meat.",
  Haram:
    "The menu marks this food Haram, " +
    "but no specific ingredient was provided.",
  Kosher: "This food has a Kosher menu label or is served at CJL.",
  "Non-Kosher":
    "The menu marks this food Non-Kosher, " +
    "but no specific ingredient was provided.",
};

function getIngredientClause(
  tag: DisplayReligiousTag,
  reasons: readonly ReligiousTagReason[],
): ExplanationClause {
  const foodName = reasons[0].foodName ?? "this food";
  const prefix = `${foodName} contains `;

  if (tag === "Halal" || tag === "Kosher") {
    return {
      prefix,
      suffix: `, which the menu explicitly identifies as ${tag}`,
    };
  }

  const categories = getUniqueNames(
    reasons.flatMap((reason) => (reason.category ? [reason.category] : [])),
  );
  const cause = joinExplanationNames(categories, false)
    .map(({ text }) => text)
    .join("");
  const qualifier = cause
    ? ` for ${cause} references`
    : " based on the menu label";

  return { prefix, suffix: `, which the app flags as ${tag}${qualifier}` };
}

function getEvidenceClause(
  tag: DisplayReligiousTag,
  reasons: readonly ReligiousTagReason[],
): ExplanationClause {
  const { source, foodName } = reasons[0];
  const foodLabel = foodName ?? "this food";
  const isPositiveClassification = tag === "Halal" || tag === "Kosher";
  const labelSuffix = isPositiveClassification
    ? `, explicitly identifying it as ${tag}`
    : `, which triggered the ${tag} flag`;

  switch (source) {
    case "allergen":
      return {
        prefix: `the menu's allergen information for ${foodLabel} lists `,
        suffix: getIngredientClause(tag, reasons).suffix,
      };
    case "location":
      return {
        prefix: `${foodLabel} is served at `,
        suffix: ", which the app treats as Kosher",
      };
    case "menu-label":
      return {
        prefix: `the menu labels ${foodLabel} `,
        suffix: labelSuffix,
      };
    case "food-name":
      return {
        prefix: foodName
          ? `the name of ${foodName} mentions `
          : "the food name mentions ",
        suffix: labelSuffix,
      };
    case "unspecified":
      return {
        prefix:
          `the menu marks ${foodLabel} ${tag} ` +
          "but provides no specific ingredient",
        suffix: "",
      };
    default:
      return getIngredientClause(tag, reasons);
  }
}

/** Build one sentence from evidence without parsing human-facing messages. */
export function getReligiousTagExplanation(
  tag: DisplayReligiousTag,
  reasons: readonly ReligiousTagReason[],
): ExplanationPart[] {
  if (tag === "Halal?" || reasons.length === 0) {
    return [{ text: FALLBACK_EXPLANATIONS[tag] }];
  }

  const sentenceParts: ExplanationPart[] = [];
  const evidenceGroups = groupExplanationEvidence(reasons);

  for (const evidenceGroup of evidenceGroups) {
    if (sentenceParts.length > 0) {
      sentenceParts.push({ text: "; " });
    }

    const clause = getEvidenceClause(tag, evidenceGroup);
    sentenceParts.push({ text: clause.prefix });

    if (evidenceGroup[0].source !== "unspecified") {
      const names = getEvidenceNames(evidenceGroup);
      sentenceParts.push(...joinExplanationNames(names, true));
    }

    sentenceParts.push({ text: clause.suffix });
  }

  const firstPart = sentenceParts[0];
  firstPart.text =
    firstPart.text.charAt(0).toUpperCase() + firstPart.text.slice(1);
  sentenceParts.push({ text: "." });

  return sentenceParts;
}
