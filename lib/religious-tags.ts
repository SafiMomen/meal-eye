import type {
    ReligiousClassification,
    ReligiousTag,
    ReligiousTagReason,
    ReligiousTagReasons,
} from "./dining-types";

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

type EvidenceSource = Pick<ReligiousTagReason, "source" | "text">;

function keywordReasons(
    sources: EvidenceSource[],
    pattern: RegExp,
    category: "pork" | "alcohol",
): ReligiousTagReason[] {
    return sources.flatMap(({ source, text }) => {
        const matches = normalizeText(text).match(new RegExp(pattern.source, "g"));
        const identifiers = [...new Set(matches ?? [])];
        if (identifiers.length === 0) { return []; }

        return [{ source, text, category, identifiers }];
    });
}

function explicitReasons(
    sources: EvidenceSource[],
    pattern: RegExp,
): ReligiousTagReason[] {
    return sources
        .filter(({ text }) => pattern.test(normalizeText(text)))
        .map(({ source, text }) => ({ source, text }));
}

/**
 * Conservative keyword indicators, not dietary certification.
 * Unknown ingredients or unlabelled meat do not imply Halal or Kosher.
 * Keep evidence with the classification so the UI never has to guess its cause.
 */
export function classifyReligiousTags({
    foodName,
    ingredients,
    explicitTagText = "",
    diningHallName = "",
}: ReligiousTagInput): ReligiousClassification {
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
    const reasons: ReligiousTagReasons = {};
    const sources: EvidenceSource[] = ([
        { source: "food-name", text: foodName },
        ...ingredients.map((text): EvidenceSource => ({ source: "ingredient", text })),
        { source: "menu-label", text: explicitTagText },
    ] satisfies EvidenceSource[]).filter(({ text }) => text.trim().length > 0);
    const porkReasons = keywordReasons(sources, porkPattern, "pork");

    // Prohibited keywords override an otherwise explicit halal label.
    if (isHaram) {
        tags.push("Haram");
        reasons.Haram = [
            ...porkReasons,
            ...keywordReasons(sources, alcoholPattern, "alcohol"),
            ...explicitReasons(sources, /\bharam\b/),
            ...explicitReasons(sources, nonHalalPattern),
        ];
    } else if (/\bhalal\b/.test(classificationText)) {
        tags.push("Halal");
        reasons.Halal = explicitReasons(sources, /\bhalal\b/);
    }

    // CJL is the location-level kosher rule requested by the application.
    if (isCjl) {
        tags.push("Kosher");
        reasons.Kosher = [{ source: "location", text: "Center for Jewish Life (CJL)" }];
    } else if (containsPork || nonKosherPattern.test(labelText)) {
        tags.push("Non-Kosher");
        reasons["Non-Kosher"] = [
            ...porkReasons,
            ...explicitReasons(
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

export function detectReligiousTags(input: ReligiousTagInput): ReligiousTag[] {
    return classifyReligiousTags(input).religiousTags;
}
