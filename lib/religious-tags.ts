import type { ReligiousTag } from "./dining-types";

export const HARAM_IDENTIFIERS = {
    pork: [
        "pork", "pig", "hog", "swine", "porcine", "boar", "bacon", "ham",
        "lard", "pancetta", "prosciutto", "guanciale", "gammon", "fatback",
        "chitterlings",
    ],
    alcohol: [
        "alcohol", "alcoholic", "nonalcoholic", "alcoholized", "alcoholised",
        "ethanol", "wine", "beer", "ale", "lager", "stout", "liquor",
        "liqueur", "spirits", "vodka", "rum", "brandy", "bourbon", "whiskey",
        "whisky", "champagne", "cognac", "sherry", "marsala", "madeira",
        "sake", "mirin", "vermouth", "tequila", "gin", "amaretto", "kirsch",
        "schnapps", "limoncello", "triple sec",
    ],
} as const;

type ReligiousTagInput = {
    foodName: string;
    ingredients: readonly string[];
    explicitTagText?: string;
    diningHallName?: string;
};

function normalizeText(value: string): string {
    return value
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[\u2010-\u2015-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

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
 */
export function detectReligiousTags({
    foodName,
    ingredients,
    explicitTagText = "",
    diningHallName = "",
}: ReligiousTagInput): ReligiousTag[] {
    const foodText = normalizeText([foodName, ...ingredients].join(" "));
    const labelText = normalizeText(explicitTagText);
    const classificationText = `${foodText} ${labelText}`;
    const hallName = normalizeText(diningHallName);
    const isCjl = hallName === "cjl" || /\bcenter for jewish life\b/.test(hallName);
    const containsPork = porkPattern.test(classificationText);
    // Intentionally includes cooking wine, wine vinegar, and alcohol-free wording.
    const containsAlcohol = alcoholPattern.test(classificationText);
    const isHaram = containsPork || containsAlcohol
        || /\bharam\b/.test(classificationText)
        || nonHalalPattern.test(classificationText);
    const tags: ReligiousTag[] = [];

    // Prohibited keywords override an otherwise explicit halal label.
    if (isHaram) {
        tags.push("Haram");
    } else if (/\bhalal\b/.test(classificationText)) {
        tags.push("Halal");
    }

    // CJL is the location-level kosher rule requested by the application.
    if (isCjl) {
        tags.push("Kosher");
    } else if (containsPork || nonKosherPattern.test(labelText)) {
        tags.push("Non-Kosher");
    } else if (/\bkosher\b/.test(labelText.replace(/\bkosher\s+salt\b/g, ""))) {
        // Only explicit dietary metadata can establish Kosher outside CJL.
        tags.push("Kosher");
    }

    return tags;
}
