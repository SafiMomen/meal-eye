import { HARAM_IDENTIFIERS } from "./identifiers.ts";
import { findExplicitEvidence, findKeywordEvidence } from "./evidence.ts";
import { normalizeDietaryText } from "./text.ts";
import type {
  EvidenceSource,
  ReligiousClassification,
  ReligiousTag,
  ReligiousTagInput,
  ReligiousTagReasons,
} from "../../types/dietary.ts";

// Whole words avoid matches such as "ham" in "hamburger" or "rum" in "crumble".
const porkPattern = new RegExp(
  `\\b(?:${HARAM_IDENTIFIERS.pork.join("|")})(?:s)?\\b`,
);
const alcoholPattern = new RegExp(
  `\\b(?:${HARAM_IDENTIFIERS.alcohol.join("|")})(?:s)?\\b`,
);
const nonHalalPattern = /\b(?:non|not)\s*(?:certified\s+)?halal\b/;
const nonKosherPattern = /\b(?:non|not)\s*kosher\b/;

/**
 * Conservative keyword indicators, not dietary certification.
 * Unknown ingredients or unlabelled meat do not imply Halal or Kosher.
 * Keep evidence with the classification so the UI never has to guess its cause.
 */
export function classifyReligiousTags({
  foodName,
  ingredients,
  allergens = [],
  explicitTagText = "",
  diningHallName = "",
}: ReligiousTagInput): ReligiousClassification {
  const foodText = normalizeDietaryText([foodName, ...ingredients].join(" "));
  const labelText = normalizeDietaryText(explicitTagText);
  const classificationText = `${foodText} ${labelText}`;
  const hallName = normalizeDietaryText(diningHallName);
  const isCenterForJewishLife =
    hallName === "cjl" || /\bcenter for jewish life\b/.test(hallName);
  const tags: ReligiousTag[] = [];
  const reasons: ReligiousTagReasons = {};
  const sources: EvidenceSource[] = (
    [
      { source: "food-name", text: foodName },
      ...ingredients.map((text): EvidenceSource => ({
        source: "ingredient",
        text,
      })),
      { source: "menu-label", text: explicitTagText },
    ] satisfies EvidenceSource[]
  ).filter(({ text }) => text.trim().length > 0);
  // Allergen declarations can identify prohibited ingredients, but cannot
  // establish a positive religious certification.
  const prohibitedSources: EvidenceSource[] = [
    ...sources,
    ...allergens.map((text): EvidenceSource => ({ source: "allergen", text })),
  ];
  const porkReasons = findKeywordEvidence(
    prohibitedSources,
    porkPattern,
    "pork",
  );
  const alcoholReasons = findKeywordEvidence(
    prohibitedSources,
    alcoholPattern,
    "alcohol",
  );
  const containsPork = porkReasons.length > 0;
  // Intentionally includes cooking wine, wine vinegar, and alcohol-free wording.
  const isHaram =
    containsPork ||
    alcoholReasons.length > 0 ||
    /\bharam\b/.test(classificationText) ||
    nonHalalPattern.test(classificationText);

  // Prohibited keywords override an otherwise explicit halal label.
  if (isHaram) {
    tags.push("Haram");
    reasons.Haram = [
      ...porkReasons,
      ...alcoholReasons,
      ...findExplicitEvidence(sources, /\bharam\b/),
      ...findExplicitEvidence(sources, nonHalalPattern),
    ];
  } else if (/\bhalal\b/.test(classificationText)) {
    tags.push("Halal");
    reasons.Halal = findExplicitEvidence(sources, /\bhalal\b/);
  }

  // CJL is the location-level kosher rule requested by the application.
  if (isCenterForJewishLife) {
    tags.push("Kosher");
    reasons.Kosher = [
      { source: "location", text: "Center for Jewish Life (CJL)" },
    ];
  } else if (containsPork || nonKosherPattern.test(labelText)) {
    tags.push("Non-Kosher");
    reasons["Non-Kosher"] = [
      ...porkReasons,
      ...findExplicitEvidence(
        [{ source: "menu-label", text: explicitTagText }],
        nonKosherPattern,
      ),
    ];
  } else if (/\bkosher\b/.test(labelText.replace(/\bkosher\s+salt\b/g, ""))) {
    // Only explicit dietary metadata can establish Kosher outside CJL.
    tags.push("Kosher");
    reasons.Kosher = [{ source: "menu-label", text: explicitTagText }];
  }

  return { religiousTags: tags, religiousTagReasons: reasons };
}
