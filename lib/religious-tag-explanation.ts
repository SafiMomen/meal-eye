import type { DisplayReligiousTag } from "./dietary-preferences";
import type { ReligiousTagReason } from "./dining-types";

export type ExplanationPart = { text: string; highlighted?: boolean };

const fallbackExplanations: Record<DisplayReligiousTag, string> = {
  "Halal?": "Ingredients seem halal, but it is better to ask. This is not a Halal certification.",
  Halal: "The menu explicitly lists Halal ingredients or Halal meat.",
  Haram: "The menu marks this food Haram, but no specific ingredient was provided.",
  Kosher: "This food has a Kosher menu label or is served at CJL.",
  "Non-Kosher": "The menu marks this food Non-Kosher, but no specific ingredient was provided.",
};

function joinNames(names: readonly string[], highlighted: boolean): ExplanationPart[] {
  return names.flatMap((text, index) => {
    const separator = index === 0 ? "" : index === names.length - 1
      ? names.length === 2 ? " and " : ", and "
      : ", ";
    return [
      ...(separator ? [{ text: separator }] : []),
      { text, highlighted },
    ];
  });
}

function uniqueNames(names: readonly string[]): string[] {
  const unique = new Map<string, string>();
  for (const name of names) {
    const text = name.trim();
    const key = text.toLowerCase();
    if (text && !unique.has(key)) { unique.set(key, text); }
  }
  return [...unique.values()];
}

/** Build one sentence from structured evidence, not from parsing display copy. */
export function getReligiousTagExplanation(
  tag: DisplayReligiousTag,
  reasons: readonly ReligiousTagReason[],
): ExplanationPart[] {
  if (tag === "Halal?" || reasons.length === 0) {
    return [{ text: fallbackExplanations[tag] }];
  }

  const groups = new Map<string, ReligiousTagReason[]>();
  for (const reason of reasons) {
    // Prefer the actual ingredient to a duplicate clue in the food's name.
    if (reason.source === "food-name" && reasons.some((candidate) =>
      candidate.source === "ingredient" &&
      candidate.category === reason.category &&
      candidate.foodName === reason.foodName,
    )) { continue; }

    const key = JSON.stringify([reason.source, reason.foodName]);
    const group = groups.get(key) ?? [];
    group.push(reason);
    groups.set(key, group);
  }

  const parts: ExplanationPart[] = [];
  for (const group of groups.values()) {
    const { source, foodName } = group[0];
    const food = foodName ?? "this food";
    if (parts.length > 0) { parts.push({ text: "; " }); }

    if (source === "unspecified") {
      parts.push({ text: `the menu marks ${food} ${tag} but provides no specific ingredient` });
      continue;
    }

    const names = uniqueNames(group.flatMap((reason) =>
      source === "food-name" && reason.identifiers?.length
        ? reason.identifiers : [reason.text],
    ));
    let prefix: string;
    let suffix: string;

    if (source === "location") {
      prefix = `${food} is served at `;
      suffix = ", which the app treats as Kosher";
    } else if (source === "menu-label") {
      prefix = `the menu labels ${food} `;
      suffix = tag === "Halal" || tag === "Kosher"
        ? `, explicitly identifying it as ${tag}` : `, which triggered the ${tag} flag`;
    } else if (source === "food-name") {
      prefix = foodName ? `the name of ${foodName} mentions ` : "the food name mentions ";
      suffix = tag === "Halal" || tag === "Kosher"
        ? `, explicitly identifying it as ${tag}` : `, which triggered the ${tag} flag`;
    } else {
      prefix = `${food} contains `;
      if (tag === "Halal" || tag === "Kosher") {
        suffix = `, which the menu explicitly identifies as ${tag}`;
      } else {
        const categories = uniqueNames(group.flatMap((reason) => reason.category ? [reason.category] : []));
        const cause = joinNames(categories, false).map(({ text }) => text).join("");
        suffix = `, which the app flags as ${tag}${cause ? ` for ${cause} references` : " based on the menu label"}`;
      }
    }

    parts.push({ text: prefix }, ...joinNames(names, true), { text: suffix });
  }

  parts[0].text = parts[0].text.charAt(0).toUpperCase() + parts[0].text.slice(1);
  parts.push({ text: "." });
  return parts;
}
